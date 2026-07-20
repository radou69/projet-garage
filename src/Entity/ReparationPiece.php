<?php

namespace App\Entity;

use App\Repository\ReparationPieceRepository;
use Doctrine\ORM\Mapping as ORM;


#[ORM\Entity(repositoryClass: ReparationPieceRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_REPARATION_PIECE', fields: ['reparation', 'piece'])]
class ReparationPiece
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $quantite = null;

    #[ORM\ManyToOne(inversedBy: 'reparationPieces')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Reparation $reparation = null;

    #[ORM\ManyToOne(inversedBy: 'reparationPieces')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Piece $piece = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getQuantite(): ?int
    {
        return $this->quantite;
    }

    public function setQuantite(int $quantite): static
    {
        $this->quantite = $quantite;

        return $this;
    }

    public function getReparation(): ?Reparation
    {
        return $this->reparation;
    }

    public function setReparation(?Reparation $reparation): static
    {
        $this->reparation = $reparation;

        return $this;
    }

    public function getPiece(): ?Piece
    {
        return $this->piece;
    }

    public function setPiece(?Piece $piece): static
    {
        $this->piece = $piece;

        return $this;
    }
}
