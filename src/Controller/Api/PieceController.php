<?php
namespace App\Controller\Api;

use App\Entity\Piece;
use App\Repository\PieceRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class PieceController extends AbstractController
{
    private function toArray(Piece $piece): array
    {
        return [
            'id' => $piece->getId(),
            'nom' => $piece->getNom(),
            'prixUnitaire' => $piece->getPrixUnitaire(),
        ];
    }

    // Liste le catalogue des pieces disponibles (tout utilisateur authentifie)
    #[Route('/api/pieces', name: 'api_pieces_list', methods: ['GET'])]
    public function list(PieceRepository $repo): JsonResponse
    {
        $pieces = $repo->findAll();
        return $this->json(array_map([$this, 'toArray'], $pieces));
    }
}
