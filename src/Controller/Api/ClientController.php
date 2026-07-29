<?php

namespace App\Controller\Api;

use App\Entity\Client;
use App\Entity\User;
use App\Repository\ClientRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class ClientController extends AbstractController
{
    // Convertit un Client en tableau simple pour le JSON — on choisit
    // exactement ce qu'on expose (jamais l'utilisateur entier, par exemple).
    private function toArray(Client $client): array
    {
        return [
            'id' => $client->getId(),
            'nom' => $client->getNom(),
            'prenom' => $client->getPrenom(),
            'telephone' => $client->getTelephone(),
            'email' => $client->getEmail(),
            'adresse' => $client->getAdresse(),
            'actif' => $client->isActif(),
        ];
    }

    // Vérifie que le client appartient bien au tenant courant (patron ou son employé) —
    // 404 (pas 403) pour ne pas confirmer l'existence d'un client d'un autre garage.
    private function verifierProprietaire(Client $client): void
    {
        /** @var User $user */
        $user = $this->getUser();
        if ($client->getUtilisateur() !== $user->getTenant()) {
            throw $this->createNotFoundException();
        }
    }

    // User Story 2.2 : liste + recherche (nom, téléphone, ou marque du véhicule)
    #[Route('/api/clients', name: 'api_clients_list', methods: ['GET'])]
    public function list(Request $request, ClientRepository $repo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $search = $request->query->get('search');

        $qb = $repo->createQueryBuilder('c')
            ->leftJoin('c.vehicules', 'v')
            ->andWhere('c.actif = true')
            ->andWhere('c.utilisateur = :tenant')
            ->setParameter('tenant', $user->getTenant());

        if ($search) {
            $qb->andWhere('c.nom LIKE :s OR c.prenom LIKE :s OR c.telephone LIKE :s OR v.marque LIKE :s')
               ->setParameter('s', '%'.$search.'%');
        }

        $clients = $qb->getQuery()->getResult();

        return $this->json(array_map([$this, 'toArray'], $clients));
    }

    // User Story 2.1 : créer un client
    #[Route('/api/clients', name: 'api_clients_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['nom']) || empty($data['prenom'])) {
            return $this->json(['message' => 'Nom et prénom sont obligatoires.'], 400);
        }

        /** @var User $user */
        $user = $this->getUser();

        $client = new Client();
        $client->setNom($data['nom']);
        $client->setPrenom($data['prenom']);
        $client->setTelephone($data['telephone'] ?? null);
        $client->setEmail($data['email'] ?? null);
        $client->setAdresse($data['adresse'] ?? null);
        // actif = true déjà par défaut sur l'entité
        $client->setUtilisateur($user->getTenant());

        $em->persist($client);
        $em->flush();

        return $this->json($this->toArray($client), 201);
    }

    // User Story 2.2 (détail) : consulter une fiche client
    #[Route('/api/clients/{id}', name: 'api_clients_show', methods: ['GET'])]
    public function show(Client $client): JsonResponse
    {
        $this->verifierProprietaire($client);

        return $this->json($this->toArray($client));
    }

    // User Story 2.3 : modifier un client
    #[Route('/api/clients/{id}', name: 'api_clients_update', methods: ['PUT'])]
    public function update(Request $request, Client $client, EntityManagerInterface $em): JsonResponse
    {
        $this->verifierProprietaire($client);

        $data = json_decode($request->getContent(), true);

        if (isset($data['nom'])) $client->setNom($data['nom']);
        if (isset($data['prenom'])) $client->setPrenom($data['prenom']);
        if (array_key_exists('telephone', $data)) $client->setTelephone($data['telephone']);
        if (array_key_exists('email', $data)) $client->setEmail($data['email']);
        if (array_key_exists('adresse', $data)) $client->setAdresse($data['adresse']);

        $em->flush();

        return $this->json($this->toArray($client));
    }

    // User Story 2.4 : archiver un client (patron uniquement)
    #[Route('/api/clients/{id}', name: 'api_clients_archive', methods: ['DELETE'])]
    public function archive(Client $client, EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_PATRON');
        $this->verifierProprietaire($client);

        $client->setActif(false); // jamais de vraie suppression
        $em->flush();

        return $this->json(['message' => 'Client archivé avec succès.']);
    }
}