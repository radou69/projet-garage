<?php

namespace App\Controller\Api;

use App\Entity\VehiculeOccasion;
use App\Repository\ClientRepository;
use App\Repository\VehiculeOccasionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class VehiculeOccasionController extends AbstractController
{
    private const STATUTS_VALIDES = ['disponible', 'reserve', 'vendu'];

    // Convertit un VehiculeOccasion en tableau simple pour le JSON.
    private function toArray(VehiculeOccasion $vo): array
    {
        return [
            'id' => $vo->getId(),
            'marque' => $vo->getMarque(),
            'modele' => $vo->getModele(),
            'annee' => $vo->getAnnee(),
            'kilometrage' => $vo->getKilometrage(),
            'prix' => $vo->getPrix(),
            'statut' => $vo->getStatut(),
            'client' => $vo->getClient() ? [
                'id' => $vo->getClient()->getId(),
                'nom' => $vo->getClient()->getNom(),
                'prenom' => $vo->getClient()->getPrenom(),
            ] : null,
        ];
    }

    // Liste + filtre par statut + recherche sur marque/modèle
    #[Route('/api/vehicule-occasions', name: 'api_vehicule_occasions_list', methods: ['GET'])]
    public function list(Request $request, VehiculeOccasionRepository $repo): JsonResponse
    {
        $statut = $request->query->get('statut');
        $search = $request->query->get('search');

        $qb = $repo->createQueryBuilder('vo');

        if ($statut) {
            if (!in_array($statut, self::STATUTS_VALIDES, true)) {
                return $this->json(['message' => 'Statut invalide.'], 400);
            }
            $qb->andWhere('vo.statut = :statut')->setParameter('statut', $statut);
        }

        if ($search) {
            $qb->andWhere('vo.marque LIKE :s OR vo.modele LIKE :s')
               ->setParameter('s', '%'.$search.'%');
        }

        $qb->orderBy('vo.id', 'DESC');

        $liste = $qb->getQuery()->getResult();

        return $this->json(array_map([$this, 'toArray'], $liste));
    }

    // Ajouter un véhicule d'occasion au stock — statut forcé à disponible, sans client
    #[Route('/api/vehicule-occasions', name: 'api_vehicule_occasions_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['marque']) || empty($data['modele'])) {
            return $this->json(['message' => 'Marque et modèle sont obligatoires.'], 400);
        }

        if (!isset($data['prix']) || !is_numeric($data['prix']) || (float) $data['prix'] <= 0) {
            return $this->json(['message' => 'Le prix doit être un nombre positif.'], 400);
        }

        $vo = new VehiculeOccasion();
        $vo->setMarque($data['marque']);
        $vo->setModele($data['modele']);
        $vo->setAnnee($data['annee'] ?? null);
        $vo->setKilometrage($data['kilometrage'] ?? null);
        $vo->setPrix(number_format((float) $data['prix'], 2, '.', ''));
        $vo->setStatut('disponible');
        // client volontairement laissé à null : fixé uniquement via l'action vendre()

        $em->persist($vo);
        $em->flush();

        return $this->json($this->toArray($vo), 201);
    }

    // Consulter un véhicule d'occasion
    #[Route('/api/vehicule-occasions/{id}', name: 'api_vehicule_occasions_show', methods: ['GET'])]
    public function show(VehiculeOccasion $vo): JsonResponse
    {
        return $this->json($this->toArray($vo));
    }

    // Modifier un véhicule d'occasion (marque, modele, annee, kilometrage, prix, ou passage à reserve).
    // Figé dès que vendu : un véhicule vendu ne se modifie plus.
    #[Route('/api/vehicule-occasions/{id}', name: 'api_vehicule_occasions_update', methods: ['PUT'])]
    public function update(Request $request, VehiculeOccasion $vo, EntityManagerInterface $em): JsonResponse
    {
        if ($vo->getStatut() === 'vendu') {
            return $this->json(['message' => 'Ce véhicule est vendu, il ne peut plus être modifié.'], 400);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['marque'])) $vo->setMarque($data['marque']);
        if (isset($data['modele'])) $vo->setModele($data['modele']);
        if (array_key_exists('annee', $data)) $vo->setAnnee($data['annee']);
        if (array_key_exists('kilometrage', $data)) $vo->setKilometrage($data['kilometrage']);

        if (isset($data['prix'])) {
            if (!is_numeric($data['prix']) || (float) $data['prix'] <= 0) {
                return $this->json(['message' => 'Le prix doit être un nombre positif.'], 400);
            }
            $vo->setPrix(number_format((float) $data['prix'], 2, '.', ''));
        }

        // "vendu" passe obligatoirement par la route dédiée /vendre.
        if (isset($data['statut'])) {
            if ($data['statut'] === 'vendu') {
                return $this->json(['message' => 'Utilisez la route /api/vehicule-occasions/{id}/vendre pour marquer ce véhicule comme vendu.'], 400);
            }
            if (!in_array($data['statut'], self::STATUTS_VALIDES, true)) {
                return $this->json(['message' => 'Statut invalide.'], 400);
            }
            $vo->setStatut($data['statut']);
        }

        $em->flush();

        return $this->json($this->toArray($vo));
    }

    // Marquer un véhicule d'occasion comme vendu (patron uniquement — impact financier).
    // Fixe le client acheteur et passe le statut à vendu, de façon définitive.
    #[Route('/api/vehicule-occasions/{id}/vendre', name: 'api_vehicule_occasions_vendre', methods: ['PATCH'])]
    public function vendre(Request $request, VehiculeOccasion $vo, EntityManagerInterface $em, ClientRepository $clientRepo): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_PATRON');

        if ($vo->getStatut() === 'vendu') {
            return $this->json(['message' => 'Ce véhicule est déjà vendu.'], 400);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['client_id'])) {
            return $this->json(['message' => 'Le client acheteur est obligatoire.'], 400);
        }

        $client = $clientRepo->find($data['client_id']);
        if (!$client || !$client->isActif()) {
            return $this->json(['message' => 'Client introuvable ou inactif.'], 404);
        }

        $vo->setClient($client);
        $vo->setStatut('vendu');

        $em->flush();

        return $this->json($this->toArray($vo));
    }
}