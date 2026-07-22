<?php

namespace App\Controller\Api;

use App\Entity\Devis;
use App\Entity\DevisItem;
use App\Repository\DevisItemRepository;
use App\Repository\DevisRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class DevisItemController extends AbstractController
{
    private const TAUX_TVA = 1.20;

    // Convertit une ligne DevisItem en tableau simple pour le JSON.
    private function toArray(DevisItem $ligne): array
    {
        return [
            'id' => $ligne->getId(),
            'designation' => $ligne->getDesignation(),
            'quantite' => $ligne->getQuantite(),
            'prixUnitaire' => $ligne->getPrixUnitaire(),
            'montant' => $ligne->getMontant(),
        ];
    }

    // Recalcule intégralement montantHt et montantTtc sur le Devis à partir de ses lignes actuelles.
    private function recalculerMontants(Devis $devis): void
    {
        $montantHt = 0.0;
        foreach ($devis->getDevisItems() as $ligne) {
            $montantHt += (float) $ligne->getMontant();
        }
        $devis->setMontantHt(number_format($montantHt, 2, '.', ''));
        $devis->setMontantTtc(number_format($montantHt * self::TAUX_TVA, 2, '.', ''));
    }

    // Vérifie que le devis existe et n'est pas figé (déjà transformé en facture).
    // Retourne une JsonResponse d'erreur si un souci est détecté, sinon null.
    private function verifierDevisModifiable(?Devis $devis): ?JsonResponse
    {
        if (!$devis) {
            return $this->json(['message' => 'Devis introuvable.'], 404);
        }

        if ($devis->getFacture() !== null) {
            return $this->json(['message' => 'Ce devis a déjà été transformé en facture, ses lignes ne peuvent plus être modifiées.'], 400);
        }

        return null;
    }

    // Liste les lignes d'un devis
    #[Route('/api/devis/{id}/items', name: 'api_devis_items_list', methods: ['GET'])]
    public function list(int $id, DevisRepository $devisRepo): JsonResponse
    {
        $devis = $devisRepo->find($id);
        if (!$devis) {
            return $this->json(['message' => 'Devis introuvable.'], 404);
        }

        return $this->json(array_map([$this, 'toArray'], $devis->getDevisItems()->toArray()));
    }

    // Ajouter une ligne à un devis
    #[Route('/api/devis/{id}/items', name: 'api_devis_items_add', methods: ['POST'])]
    public function add(int $id, Request $request, EntityManagerInterface $em, DevisRepository $devisRepo): JsonResponse
    {
        $devis = $devisRepo->find($id);

        $erreur = $this->verifierDevisModifiable($devis);
        if ($erreur) {
            return $erreur;
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['designation']) || !isset($data['quantite']) || !isset($data['prixUnitaire'])) {
            return $this->json(['message' => 'designation, quantite et prixUnitaire sont obligatoires.'], 400);
        }

        if (!is_int($data['quantite']) || $data['quantite'] <= 0) {
            return $this->json(['message' => 'La quantité doit être un nombre entier positif.'], 400);
        }

        if (!is_numeric($data['prixUnitaire']) || (float) $data['prixUnitaire'] <= 0) {
            return $this->json(['message' => 'Le prix unitaire doit être un nombre positif.'], 400);
        }

        $montant = $data['quantite'] * (float) $data['prixUnitaire'];

        $ligne = new DevisItem();
        $ligne->setDesignation($data['designation']);
        $ligne->setQuantite($data['quantite']);
        $ligne->setPrixUnitaire(number_format((float) $data['prixUnitaire'], 2, '.', ''));
        $ligne->setMontant(number_format($montant, 2, '.', ''));
        $devis->addDevisItem($ligne);

        $em->persist($ligne);
        $this->recalculerMontants($devis);
        $em->flush();

        return $this->json($this->toArray($ligne), 201);
    }

    // Modifier une ligne existante (designation, quantite, et/ou prixUnitaire)
    #[Route('/api/devis/{id}/items/{ligneId}', name: 'api_devis_items_update', methods: ['PUT'])]
    public function update(
        int $id,
        int $ligneId,
        Request $request,
        EntityManagerInterface $em,
        DevisRepository $devisRepo,
        DevisItemRepository $devisItemRepo
    ): JsonResponse {
        $devis = $devisRepo->find($id);

        $erreur = $this->verifierDevisModifiable($devis);
        if ($erreur) {
            return $erreur;
        }

        $ligne = $devisItemRepo->find($ligneId);
        if (!$ligne || $ligne->getDevis()?->getId() !== $devis->getId()) {
            return $this->json(['message' => 'Ligne introuvable pour ce devis.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (array_key_exists('designation', $data)) {
            if (empty($data['designation'])) {
                return $this->json(['message' => 'La désignation ne peut pas être vide.'], 400);
            }
            $ligne->setDesignation($data['designation']);
        }

        if (isset($data['quantite'])) {
            if (!is_int($data['quantite']) || $data['quantite'] <= 0) {
                return $this->json(['message' => 'La quantité doit être un nombre entier positif.'], 400);
            }
            $ligne->setQuantite($data['quantite']);
        }

        if (isset($data['prixUnitaire'])) {
            if (!is_numeric($data['prixUnitaire']) || (float) $data['prixUnitaire'] <= 0) {
                return $this->json(['message' => 'Le prix unitaire doit être un nombre positif.'], 400);
            }
            $ligne->setPrixUnitaire(number_format((float) $data['prixUnitaire'], 2, '.', ''));
        }

        $ligne->setMontant(number_format($ligne->getQuantite() * (float) $ligne->getPrixUnitaire(), 2, '.', ''));

        $this->recalculerMontants($devis);
        $em->flush();

        return $this->json($this->toArray($ligne));
    }

    // Retirer une ligne d'un devis
    #[Route('/api/devis/{id}/items/{ligneId}', name: 'api_devis_items_delete', methods: ['DELETE'])]
    public function delete(
        int $id,
        int $ligneId,
        EntityManagerInterface $em,
        DevisRepository $devisRepo,
        DevisItemRepository $devisItemRepo
    ): JsonResponse {
        $devis = $devisRepo->find($id);

        $erreur = $this->verifierDevisModifiable($devis);
        if ($erreur) {
            return $erreur;
        }

        $ligne = $devisItemRepo->find($ligneId);
        if (!$ligne || $ligne->getDevis()?->getId() !== $devis->getId()) {
            return $this->json(['message' => 'Ligne introuvable pour ce devis.'], 404);
        }

        $devis->removeDevisItem($ligne);
        $em->remove($ligne);
        $this->recalculerMontants($devis);
        $em->flush();

        return $this->json(['message' => 'Ligne retirée avec succès.']);
    }
}