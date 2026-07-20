<?php

namespace App\Entity;

use App\Repository\PieceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PieceRepository::class)]
class Piece
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $nom = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $prixUnitaire = null;

    /**
     * @var Collection<int, ReparationPiece>
     */
    #[ORM\OneToMany(targetEntity: ReparationPiece::class, mappedBy: 'piece', orphanRemoval: true)]
    private Collection $reparationPieces;

    public function __construct()
    {
        $this->reparationPieces = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getPrixUnitaire(): ?string
    {
        return $this->prixUnitaire;
    }

    public function setPrixUnitaire(string $prixUnitaire): static
    {
        $this->prixUnitaire = $prixUnitaire;

        return $this;
    }

    /**
     * @return Collection<int, ReparationPiece>
     */
    public function getReparationPieces(): Collection
    {
        return $this->reparationPieces;
    }

    public function addReparationPiece(ReparationPiece $reparationPiece): static
    {
        if (!$this->reparationPieces->contains($reparationPiece)) {
            $this->reparationPieces->add($reparationPiece);
            $reparationPiece->setPiece($this);
        }

        return $this;
    }

    public function removeReparationPiece(ReparationPiece $reparationPiece): static
    {
        if ($this->reparationPieces->removeElement($reparationPiece)) {
            if ($reparationPiece->getPiece() === $this) {
                $reparationPiece->setPiece(null);
            }
        }

        return $this;
    }
}