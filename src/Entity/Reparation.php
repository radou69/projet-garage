<?php

namespace App\Entity;

use App\Repository\ReparationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ReparationRepository::class)]
class Reparation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTime $date = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 20)]
    private ?string $statut = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    private ?string $coutTotal = null;

    #[ORM\Column(options: ['default' => true])]
    private ?bool $actif = true;

    #[ORM\ManyToOne(inversedBy: 'reparations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Vehicule $vehicule = null;

    /**
     * @var Collection<int, ReparationPiece>
     */
    #[ORM\OneToMany(targetEntity: ReparationPiece::class, mappedBy: 'reparation', orphanRemoval: true)]
    private Collection $reparationPieces;

    public function __construct()
    {
        $this->reparationPieces = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDate(): ?\DateTime
    {
        return $this->date;
    }

    public function setDate(\DateTime $date): static
    {
        $this->date = $date;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getStatut(): ?string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): static
    {
        $this->statut = $statut;

        return $this;
    }

    public function getCoutTotal(): ?string
    {
        return $this->coutTotal;
    }

    public function setCoutTotal(?string $coutTotal): static
    {
        $this->coutTotal = $coutTotal;

        return $this;
    }

    public function isActif(): ?bool
    {
        return $this->actif;
    }

    public function setActif(bool $actif): static
    {
        $this->actif = $actif;

        return $this;
    }

    public function getVehicule(): ?Vehicule
    {
        return $this->vehicule;
    }

    public function setVehicule(?Vehicule $vehicule): static
    {
        $this->vehicule = $vehicule;

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
            $reparationPiece->setReparation($this);
        }

        return $this;
    }

    public function removeReparationPiece(ReparationPiece $reparationPiece): static
    {
        if ($this->reparationPieces->removeElement($reparationPiece)) {
            // set the owning side to null (unless already changed)
            if ($reparationPiece->getReparation() === $this) {
                $reparationPiece->setReparation(null);
            }
        }

        return $this;
    }
}
