<?php

namespace App\Controller\Api;

use App\Entity\Vehicule;
use App\Repository\ClientRepository;
use App\Repository\VehiculeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class VehiculeController extends AbstractController
{
    // Convertit un Vehicule en tableau simple pour le JSON — on choisit
    // exactement ce qu'on expose (jamais l'entité Client entière, par exemple).
    private function toArray(Vehicule $vehicule): array
    {
        return [
            'id' => $vehicule->getId(),
            'marque' => $vehicule->getMarque(),
            'modele' => $vehicule->getModele(),
            'immatriculation' => $vehicule->getImmatriculation(),
            'carburant' => $vehicule->getCarburant(),
            'vin' => $vehicule->getVin(),
            'annee' => $vehicule->getAnnee(),
            'kilometrage' => $vehicule->getKilometrage(),
            'actif' => $vehicule->isActif(),
            'client' => [
                'id' => $vehicule->getClient()?->getId(),
                'nom' => $vehicule->getClient()?->getNom(),
                'prenom' => $vehicule->getClient()?->getPrenom(),
            ],
        ];
    }

    // Liste + recherche (marque, modèle, immatriculation, ou nom du client)
    #[Route('/api/vehicules', name: 'api_vehicules_list', methods: ['GET'])]
    public function list(Request $request, VehiculeRepository $repo): JsonResponse
    {
        $search = $request->query->get('search');

        $qb = $repo->createQueryBuilder('v')
            ->leftJoin('v.client', 'c')
            ->andWhere('v.actif = true');

        if ($search) {
            $qb->andWhere('v.marque LIKE :s OR v.modele LIKE :s OR v.immatriculation LIKE :s OR c.nom LIKE :s')
               ->setParameter('s', '%'.$search.'%');
        }

        $vehicules = $qb->getQuery()->getResult();

        return $this->json(array_map([$this, 'toArray'], $vehicules));
    }

    // Créer un véhicule — client obligatoire (contrairement à VehiculeOccasion)
    #[Route('/api/vehicules', name: 'api_vehicules_create', methods:['POST'])]
    public function create(Request $request, EntityManagerInterface $em, ClientRepository $clientRepo, VehiculeRepository $vehiculeRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['marque']) || empty($data['modele']) || empty($data['immatriculation'])) {
            return $this->json(['message' => 'Marque, modèle et immatriculation sont obligatoires.'], 400);
        }

        if (empty($data['client_id'])) {
            return $this->json(['message' => 'Le client est obligatoire pour un véhicule.'], 400);
        }

        $client = $clientRepo->find($data['client_id']);
        if (!$client || !$client->isActif()) {
            return $this->json(['message' => 'Client introuvable ou inactif.'], 404);
        }

        $existant = $vehiculeRepo->findOneBy(['immatriculation' => $data['immatriculation']]);
        if ($existant) {
            return $this->json(['message' => 'Cette immatriculation est déjà utilisée.'], 409);
        }

        $vehicule = new Vehicule();
        $vehicule->setMarque($data['marque']);
        $vehicule->setModele($data['modele']);
        $vehicule->setImmatriculation($data['immatriculation']);
        $vehicule->setCarburant($data['carburant'] ?? null);
        $vehicule->setVin($data['vin'] ?? null);
        $vehicule->setAnnee($data['annee'] ?? null);
        $vehicule->setKilometrage($data['kilometrage'] ?? null);
        $vehicule->setClient($client);
        // actif = true déjà par défaut sur l'entité

        $em->persist($vehicule);
        $em->flush();

        return $this->json($this->toArray($vehicule), 201);
    }

    // Consulter une fiche véhicule
    #[Route('/api/vehicules/{id}', name: 'api_vehicules_show', methods: ['GET'])]
    public function show(Vehicule $vehicule): JsonResponse
    {
        return $this->json($this->toArray($vehicule));
    }

    // Modifier un véhicule
    #[Route('/api/vehicules/{id}', name: 'api_vehicules_update', methods: ['PUT'])]
    public function update(Request $request, Vehicule $vehicule, EntityManagerInterface $em, ClientRepository $clientRepo, VehiculeRepository $vehiculeRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['immatriculation']) && $data['immatriculation'] !== $vehicule->getImmatriculation()) {
            $existant = $vehiculeRepo->findOneBy(['immatriculation' => $data['immatriculation']]);
            if ($existant) {
                return $this->json(['message' => 'Cette immatriculation est déjà utilisée.'], 409);
            }
        }

        if (isset($data['marque'])) $vehicule->setMarque($data['marque']);
        if (isset($data['modele'])) $vehicule->setModele($data['modele']);
        if (isset($data['immatriculation'])) $vehicule->setImmatriculation($data['immatriculation']);
        if (array_key_exists('carburant', $data)) $vehicule->setCarburant($data['carburant']);
        if (array_key_exists('vin', $data)) $vehicule->setVin($data['vin']);
        if (array_key_exists('annee', $data)) $vehicule->setAnnee($data['annee']);
        if (array_key_exists('kilometrage', $data)) $vehicule->setKilometrage($data['kilometrage']);

        // Le client reste obligatoire : on ne l'accepte que s'il est fourni ET valide,
        // jamais en le mettant à null.
        if (!empty($data['client_id'])) {
            $client = $clientRepo->find($data['client_id']);
            if (!$client || !$client->isActif()) {
                return $this->json(['message' => 'Client introuvable ou inactif.'], 404);
            }
            $vehicule->setClient($client);
        }

        $em->flush();

        return $this->json($this->toArray($vehicule));
    }

    // Archiver un véhicule (patron uniquement)
    #[Route('/api/vehicules/{id}', name: 'api_vehicules_archive', methods: ['DELETE'])]
    public function archive(Vehicule $vehicule, EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_PATRON');

        $vehicule->setActif(false); // jamais de vraie suppression
        $em->flush();

        return $this->json(['message' => 'Véhicule archivé avec succès.']);
    }
}
