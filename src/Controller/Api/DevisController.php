<?php

namespace App\Controller\Api;

use App\Entity\Devis;
use App\Repository\ClientRepository;
use App\Repository\DevisRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class DevisController extends AbstractController
{
    private const STATUTS_VALIDES = ['brouillon', 'envoye', 'accepte', 'refuse', 'expire'];
    private const TAUX_TVA = 1.20;

    // Convertit un Devis en tableau simple pour le JSON.
    private function toArray(Devis $devis): array
    {
        return [
            'id' => $devis->getId(),
            'date' => $devis->getDate()?->format('Y-m-d'),
            'montantHt' => $devis->getMontantHt(),
            'montantTtc' => $devis->getMontantTtc(),
            'statut' => $devis->getStatut(),
            'actif' => $devis->isActif(),
            'client' => [
                'id' => $devis->getClient()?->getId(),
                'nom' => $devis->getClient()?->getNom(),
                'prenom' => $devis->getClient()?->getPrenom(),
            ],
            'factureId' => $devis->getFacture()?->getId(),
        ];
    }

    // Liste + filtre par statut + recherche sur le nom du client
    #[Route('/api/devis', name: 'api_devis_list', methods: ['GET'])]
    public function list(Request $request, DevisRepository $repo): JsonResponse
    {
        $statut = $request->query->get('statut');
        $search = $request->query->get('search');

        $qb = $repo->createQueryBuilder('d')
            ->leftJoin('d.client', 'c')
            ->andWhere('d.actif = true');

        if ($statut) {
            if (!in_array($statut, self::STATUTS_VALIDES, true)) {
                return $this->json(['message' => 'Statut invalide.'], 400);
            }
            $qb->andWhere('d.statut = :statut')->setParameter('statut', $statut);
        }

        if ($search) {
            $qb->andWhere('c.nom LIKE :s OR c.prenom LIKE :s')
               ->setParameter('s', '%'.$search.'%');
        }

        $qb->orderBy('d.date', 'DESC');

        $devisListe = $qb->getQuery()->getResult();

        return $this->json(array_map([$this, 'toArray'], $devisListe));
    }

    // Créer un devis — client obligatoire, statut forcé à brouillon,
    // montants initialisés à 0.00 (aucune ligne à la création : gérées par le sous-CRUD DevisItem)
    #[Route('/api/devis', name: 'api_devis_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, ClientRepository $clientRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['date'])) {
            return $this->json(['message' => 'La date est obligatoire.'], 400);
        }

        if (empty($data['client_id'])) {
            return $this->json(['message' => 'Le client est obligatoire pour un devis.'], 400);
        }

        $client = $clientRepo->find($data['client_id']);
        if (!$client || !$client->isActif()) {
            return $this->json(['message' => 'Client introuvable ou inactif.'], 404);
        }

        try {
            $date = new \DateTime($data['date']);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Format de date invalide (attendu : YYYY-MM-DD).'], 400);
        }

        $devis = new Devis();
        $devis->setDate($date);
        $devis->setStatut('brouillon');
        $devis->setMontantHt('0.00');
        $devis->setMontantTtc('0.00');
        $devis->setClient($client);
        // actif = true déjà par défaut sur l'entité

        $em->persist($devis);
        $em->flush();

        return $this->json($this->toArray($devis), 201);
    }

    // Consulter un devis
    #[Route('/api/devis/{id}', name: 'api_devis_show', methods: ['GET'])]
    public function show(Devis $devis): JsonResponse
    {
        return $this->json($this->toArray($devis));
    }

    // Modifier un devis (date ou statut). montantHt/montantTtc ne sont jamais modifiables ici :
    // ils sont recalculés par le sous-CRUD DevisItem. Un devis déjà transformé en facture
    // est figé : plus aucune modification possible.
    #[Route('/api/devis/{id}', name: 'api_devis_update', methods: ['PUT'])]
    public function update(Request $request, Devis $devis, EntityManagerInterface $em): JsonResponse
    {
        if ($devis->getFacture() !== null) {
            return $this->json(['message' => 'Ce devis a déjà été transformé en facture, il ne peut plus être modifié.'], 400);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['date'])) {
            try {
                $devis->setDate(new \DateTime($data['date']));
            } catch (\Exception $e) {
                return $this->json(['message' => 'Format de date invalide (attendu : YYYY-MM-DD).'], 400);
            }
        }

        if (isset($data['statut'])) {
            if (!in_array($data['statut'], self::STATUTS_VALIDES, true)) {
                return $this->json(['message' => 'Statut invalide.'], 400);
            }
            $devis->setStatut($data['statut']);
        }

        $em->flush();

        return $this->json($this->toArray($devis));
    }

    // Archiver un devis (patron uniquement) — comme Client, Vehicule et Reparation
    #[Route('/api/devis/{id}', name: 'api_devis_archive', methods: ['DELETE'])]
    public function archive(Devis $devis, EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_PATRON');

        $devis->setActif(false); // jamais de vraie suppression
        $em->flush();

        return $this->json(['message' => 'Devis archivé avec succès.']);
    }
}