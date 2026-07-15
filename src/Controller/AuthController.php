<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class AuthController extends AbstractController
{
    // User Story 1.1 (base) : inscription du patron (premier compte, public)
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $em
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $nom = $data['nom'] ?? null;
        $email = $data['email'] ?? null;
        $motDePasse = $data['mot_de_passe'] ?? null;

        if (!$nom || !$email || !$motDePasse) {
            return $this->json(['message' => 'Nom, email et mot de passe sont obligatoires.'], 400);
        }

        $existant = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($existant) {
            return $this->json(['message' => 'Cet email est déjà utilisé.'], 409);
        }

        $user = new User();
        $user->setNom($nom);
        $user->setEmail($email);
        $user->setRoles(['ROLE_PATRON']);
        $user->setPassword($passwordHasher->hashPassword($user, $motDePasse));

        $em->persist($user);
        $em->flush();

        return $this->json(['message' => 'Compte patron créé avec succès.', 'id' => $user->getId()], 201);
    }

    // User Story 1.2 : création d'un compte employé (réservé au patron)
    #[Route('/api/utilisateurs', name: 'api_creer_employe', methods: ['POST'])]
    public function creerEmploye(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $em
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_PATRON');

        $data = json_decode($request->getContent(), true);

        $nom = $data['nom'] ?? null;
        $email = $data['email'] ?? null;
        $motDePasse = $data['mot_de_passe'] ?? null;

        if (!$nom || !$email || !$motDePasse) {
            return $this->json(['message' => 'Nom, email et mot de passe sont obligatoires.'], 400);
        }

        $existant = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($existant) {
            return $this->json(['message' => 'Cet email est déjà utilisé.'], 409);
        }

        $user = new User();
        $user->setNom($nom);
        $user->setEmail($email);
        $user->setRoles(['ROLE_EMPLOYE']); // forcé ici, jamais pris depuis le body envoyé
        $user->setPassword($passwordHasher->hashPassword($user, $motDePasse));

        $em->persist($user);
        $em->flush();

        return $this->json(['message' => 'Compte employé créé avec succès.', 'id' => $user->getId()], 201);
    }

    // Exemple de route protégée simple (équivalent du dashboard qu'on avait en Node)
    #[Route('/api/dashboard', name: 'api_dashboard', methods: ['GET'])]
    public function dashboard(): JsonResponse
    {
        $user = $this->getUser();
        return $this->json(['message' => sprintf('Bienvenue %s (rôle : %s)', $user->getUserIdentifier(), $user->getRoles()[0] ?? '?')]);
    }

    // Exemple de route réservée au patron (équivalent des factures qu'on avait en Node)
    #[Route('/api/factures', name: 'api_factures_test', methods: ['GET'])]
    public function facturesTest(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_PATRON');
        return $this->json(['message' => 'Liste des factures (accès patron confirmé).']);
    }
}