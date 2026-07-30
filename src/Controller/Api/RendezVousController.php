<?php

namespace App\Controller\Api;

use App\Entity\RendezVous;
use App\Entity\User;
use App\Repository\ClientRepository;
use App\Repository\RendezVousRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class RendezVousController extends AbstractController
{
    private const STATUTS_VALIDES = ['planifie', 'confirme', 'termine', 'annule'];

    // Convertit un RendezVous en tableau simple pour le JSON.
    private function toArray(RendezVous $rdv): array
    {
        return [
            'id' => $rdv->getId(),
            'dateHeure' => $rdv->getDateHeure()?->format('Y-m-d H:i:s'),
            'description' => $rdv->getDescription(),
            'statut' => $rdv->getStatut(),
            'client' => [
                'id' => $rdv->getClient()?->getId(),
                'nom' => $rdv->getClient()?->getNom(),
                'prenom' => $rdv->getClient()?->getPrenom(),
            ],
        ];
    }

    // Vérifie que le rendez-vous appartient bien au tenant courant (patron ou son employé) —
    // 404 (pas 403) pour ne pas confirmer l'existence d'un rendez-vous d'un autre garage.
    private function verifierProprietaire(RendezVous $rdv): void
    {
        /** @var User $user */
        $user = $this->getUser();
        if ($rdv->getClient()?->getUtilisateur() !== $user->getTenant()) {
            throw $this->createNotFoundException();
        }
    }

    // Liste + recherche par statut et/ou nom du client
    #[Route('/api/rendez-vous', name: 'api_rendez_vous_list', methods: ['GET'])]
    public function list(Request $request, RendezVousRepository $repo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $statut = $request->query->get('statut');
        $search = $request->query->get('search');

        $qb = $repo->createQueryBuilder('r')
            ->leftJoin('r.client', 'c')
            ->andWhere('c.utilisateur = :tenant')
            ->setParameter('tenant', $user->getTenant());

        if ($statut) {
            if (!in_array($statut, self::STATUTS_VALIDES, true)) {
                return $this->json(['message' => 'Statut invalide.'], 400);
            }
            $qb->andWhere('r.statut = :statut')->setParameter('statut', $statut);
        }

        if ($search) {
            $qb->andWhere('c.nom LIKE :s OR c.prenom LIKE :s OR r.description LIKE :s')
               ->setParameter('s', '%'.$search.'%');
        }

        $qb->orderBy('r.dateHeure', 'ASC');

        $rendezVous = $qb->getQuery()->getResult();

        return $this->json(array_map([$this, 'toArray'], $rendezVous));
    }

    // Créer un rendez-vous — client obligatoire, statut toujours "planifie" à la création
    #[Route('/api/rendez-vous', name: 'api_rendez_vous_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, ClientRepository $clientRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['dateHeure'])) {
            return $this->json(['message' => 'La date et l\'heure sont obligatoires.'], 400);
        }

        if (empty($data['client_id'])) {
            return $this->json(['message' => 'Le client est obligatoire pour un rendez-vous.'], 400);
        }

        /** @var User $user */
        $user = $this->getUser();
        $client = $clientRepo->find($data['client_id']);
        if (!$client || !$client->isActif() || $client->getUtilisateur() !== $user->getTenant()) {
            return $this->json(['message' => 'Client introuvable ou inactif.'], 404);
        }

        try {
            $dateHeure = new \DateTime($data['dateHeure']);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Format de date invalide (attendu : YYYY-MM-DD HH:MM:SS).'], 400);
        }

        $rdv = new RendezVous();
        $rdv->setDateHeure($dateHeure);
        $rdv->setDescription($data['description'] ?? null);
        $rdv->setStatut('planifie');
        $rdv->setClient($client);

        $em->persist($rdv);
        $em->flush();

        return $this->json($this->toArray($rdv), 201);
    }

    // Consulter un rendez-vous
    #[Route('/api/rendez-vous/{id}', name: 'api_rendez_vous_show', methods: ['GET'])]
    public function show(RendezVous $rdv): JsonResponse
    {
        $this->verifierProprietaire($rdv);

        return $this->json($this->toArray($rdv));
    }

    // Modifier un rendez-vous (date, description, ou transition de statut hors annulation)
    #[Route('/api/rendez-vous/{id}', name: 'api_rendez_vous_update', methods: ['PUT'])]
    public function update(Request $request, RendezVous $rdv, EntityManagerInterface $em): JsonResponse
    {
        $this->verifierProprietaire($rdv);

        $data = json_decode($request->getContent(), true);

        if (isset($data['dateHeure'])) {
            try {
                $rdv->setDateHeure(new \DateTime($data['dateHeure']));
            } catch (\Exception $e) {
                return $this->json(['message' => 'Format de date invalide (attendu : YYYY-MM-DD HH:MM:SS).'], 400);
            }
        }

        if (array_key_exists('description', $data)) {
            $rdv->setDescription($data['description']);
        }

        // Un rendez-vous terminé ou annulé a un statut figé : plus aucune transition possible.
        if (isset($data['statut']) && in_array($rdv->getStatut(), ['termine', 'annule'], true)) {
            return $this->json(['message' => 'Ce rendez-vous est '.$rdv->getStatut().', son statut ne peut plus être modifié.'], 400);
        }

        // L'annulation passe obligatoirement par la route dédiée /cancel,
        // pas par une mise à jour générique du statut.
        if (isset($data['statut'])) {
            if ($data['statut'] === 'annule') {
                return $this->json(['message' => 'Utilisez la route /api/rendez-vous/{id}/cancel pour annuler un rendez-vous.'], 400);
            }
            if (!in_array($data['statut'], self::STATUTS_VALIDES, true)) {
                return $this->json(['message' => 'Statut invalide.'], 400);
            }
            $rdv->setStatut($data['statut']);
        }

        $em->flush();

        return $this->json($this->toArray($rdv));
    }

    // Annuler un rendez-vous — action métier dédiée, ouverte à Patron et Employé
    // (annulation = usage quotidien, pas une suppression de données).
    // Reste en base avec statut "annule". Un rendez-vous déjà terminé ou annulé
    // a un statut figé : l'annulation est refusée dans ces deux cas.
    #[Route('/api/rendez-vous/{id}/cancel', name: 'api_rendez_vous_cancel', methods: ['PATCH'])]
    public function cancel(RendezVous $rdv, EntityManagerInterface $em): JsonResponse
    {
        $this->verifierProprietaire($rdv);

        if (in_array($rdv->getStatut(), ['termine', 'annule'], true)) {
            return $this->json(['message' => 'Ce rendez-vous est '.$rdv->getStatut().', il ne peut plus être annulé.'], 400);
        }

        $rdv->setStatut('annule');
        $em->flush();

        return $this->json($this->toArray($rdv));
    }
}