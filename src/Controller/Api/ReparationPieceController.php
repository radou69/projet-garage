<?php
 
namespace App\Controller\Api;
 
use App\Entity\Reparation;
use App\Entity\ReparationPiece;
use App\Entity\User;
use App\Repository\PieceRepository;
use App\Repository\ReparationPieceRepository;
use App\Repository\ReparationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
 
class ReparationPieceController extends AbstractController
{
    // Convertit une ligne ReparationPiece en tableau simple pour le JSON.
    private function toArray(ReparationPiece $ligne): array
    {
        $piece = $ligne->getPiece();
 
        return [
            'id' => $ligne->getId(),
            'quantite' => $ligne->getQuantite(),
            'piece' => [
                'id' => $piece?->getId(),
                'nom' => $piece?->getNom(),
                'prixUnitaire' => $piece?->getPrixUnitaire(),
            ],
            'sousTotal' => $piece ? number_format($ligne->getQuantite() * (float) $piece->getPrixUnitaire(), 2, '.', '') : null,
        ];
    }
 
    // Recalcule intégralement coutTotal sur la Reparation à partir de ses lignes actuelles.
    private function recalculerCoutTotal(Reparation $reparation): void
    {
        $total = 0.0;
        foreach ($reparation->getReparationPieces() as $ligne) {
            $piece = $ligne->getPiece();
            if ($piece) {
                $total += $ligne->getQuantite() * (float) $piece->getPrixUnitaire();
            }
        }
        $reparation->setCoutTotal(number_format($total, 2, '.', ''));
    }
 
    // Vérifie que la réparation existe, appartient au tenant courant, et n'est pas figée
    // (terminee/annulee). Retourne une JsonResponse d'erreur si un souci est détecté, sinon null.
    private function verifierReparationModifiable(?Reparation $reparation): ?JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        if (!$reparation || $reparation->getVehicule()?->getClient()?->getUtilisateur() !== $user->getTenant()) {
            return $this->json(['message' => 'Réparation introuvable.'], 404);
        }

        if (in_array($reparation->getStatut(), ['terminee', 'annulee'], true)) {
            return $this->json(['message' => 'Cette réparation est '.$reparation->getStatut().', ses pièces ne peuvent plus être modifiées.'], 400);
        }
 
        return null;
    }
 
    // Liste les pièces associées à une réparation
    #[Route('/api/reparations/{id}/pieces', name: 'api_reparation_pieces_list', methods: ['GET'])]
    public function list(int $id, ReparationRepository $reparationRepo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $reparation = $reparationRepo->find($id);
        if (!$reparation || $reparation->getVehicule()?->getClient()?->getUtilisateur() !== $user->getTenant()) {
            return $this->json(['message' => 'Réparation introuvable.'], 404);
        }

        return $this->json(array_map([$this, 'toArray'], $reparation->getReparationPieces()->toArray()));
    }
 
    // Ajouter une pièce à une réparation
    #[Route('/api/reparations/{id}/pieces', name: 'api_reparation_pieces_add', methods: ['POST'])]
    public function add(
        int $id,
        Request $request,
        EntityManagerInterface $em,
        ReparationRepository $reparationRepo,
        PieceRepository $pieceRepo,
        ReparationPieceRepository $reparationPieceRepo
    ): JsonResponse {
        $reparation = $reparationRepo->find($id);
 
        $erreur = $this->verifierReparationModifiable($reparation);
        if ($erreur) {
            return $erreur;
        }
 
        $data = json_decode($request->getContent(), true);
 
        if (empty($data['piece_id']) || !isset($data['quantite'])) {
            return $this->json(['message' => 'piece_id et quantite sont obligatoires.'], 400);
        }
 
        if (!is_int($data['quantite']) || $data['quantite'] <= 0) {
            return $this->json(['message' => 'La quantité doit être un nombre entier positif.'], 400);
        }
 
        $piece = $pieceRepo->find($data['piece_id']);
        if (!$piece) {
            return $this->json(['message' => 'Pièce introuvable.'], 404);
        }
 
        $existante = $reparationPieceRepo->findOneBy(['reparation' => $reparation, 'piece' => $piece]);
        if ($existante) {
            return $this->json(['message' => 'Cette pièce est déjà associée à cette réparation.'], 409);
        }
 
        $ligne = new ReparationPiece();
        $ligne->setQuantite($data['quantite']);
        $ligne->setPiece($piece);
        $reparation->addReparationPiece($ligne);
 
        $em->persist($ligne);
        $this->recalculerCoutTotal($reparation);
        $em->flush();
 
        return $this->json($this->toArray($ligne), 201);
    }
 
    // Modifier la quantité d'une ligne existante
    #[Route('/api/reparations/{id}/pieces/{ligneId}', name: 'api_reparation_pieces_update', methods: ['PUT'])]
    public function update(
        int $id,
        int $ligneId,
        Request $request,
        EntityManagerInterface $em,
        ReparationRepository $reparationRepo,
        ReparationPieceRepository $reparationPieceRepo
    ): JsonResponse {
        $reparation = $reparationRepo->find($id);
 
        $erreur = $this->verifierReparationModifiable($reparation);
        if ($erreur) {
            return $erreur;
        }
 
        $ligne = $reparationPieceRepo->find($ligneId);
        if (!$ligne || $ligne->getReparation()?->getId() !== $reparation->getId()) {
            return $this->json(['message' => 'Ligne introuvable pour cette réparation.'], 404);
        }
 
        $data = json_decode($request->getContent(), true);
 
        if (!isset($data['quantite']) || !is_int($data['quantite']) || $data['quantite'] <= 0) {
            return $this->json(['message' => 'La quantité doit être un nombre entier positif.'], 400);
        }
 
        $ligne->setQuantite($data['quantite']);
        $this->recalculerCoutTotal($reparation);
        $em->flush();
 
        return $this->json($this->toArray($ligne));
    }
 
    // Retirer une pièce d'une réparation
    #[Route('/api/reparations/{id}/pieces/{ligneId}', name: 'api_reparation_pieces_delete', methods: ['DELETE'])]
    public function delete(
        int $id,
        int $ligneId,
        EntityManagerInterface $em,
        ReparationRepository $reparationRepo,
        ReparationPieceRepository $reparationPieceRepo
    ): JsonResponse {
        $reparation = $reparationRepo->find($id);
 
        $erreur = $this->verifierReparationModifiable($reparation);
        if ($erreur) {
            return $erreur;
        }
 
        $ligne = $reparationPieceRepo->find($ligneId);
        if (!$ligne || $ligne->getReparation()?->getId() !== $reparation->getId()) {
            return $this->json(['message' => 'Ligne introuvable pour cette réparation.'], 404);
        }
 
        $reparation->removeReparationPiece($ligne);
        $em->remove($ligne);
        $this->recalculerCoutTotal($reparation);
        $em->flush();
 
        return $this->json(['message' => 'Pièce retirée avec succès.']);
    }
}
 