<?php

namespace App\Entity;

use App\Repository\FactureRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: FactureRepository::class)]
class Facture
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTime $date = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $montantTtc = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    private ?string $montantAcompte = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTime $dateAcompte = null;

    #[ORM\Column(length: 20)]
    private ?string $statut = null;

    #[ORM\OneToOne(inversedBy: 'facture', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    private ?Devis $devis = null;

    #[ORM\ManyToOne(inversedBy: 'factures')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Client $client = null;

    /**
     * @var Collection<int, FactureItem>
     */
    #[ORM\OneToMany(targetEntity: FactureItem::class, mappedBy: 'facture', orphanRemoval: true)]
    private Collection $factureItems;

    public function __construct()
    {
        $this->factureItems = new ArrayCollection();
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

    public function getMontantTtc(): ?string
    {
        return $this->montantTtc;
    }

    public function setMontantTtc(string $montantTtc): static
    {
        $this->montantTtc = $montantTtc;

        return $this;
    }

    public function getMontantAcompte(): ?string
    {
        return $this->montantAcompte;
    }

    public function setMontantAcompte(?string $montantAcompte): static
    {
        $this->montantAcompte = $montantAcompte;

        return $this;
    }

    public function getDateAcompte(): ?\DateTime
    {
        return $this->dateAcompte;
    }

    public function setDateAcompte(?\DateTime $dateAcompte): static
    {
        $this->dateAcompte = $dateAcompte;

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

    public function getDevis(): ?Devis
    {
        return $this->devis;
    }

    public function setDevis(?Devis $devis): static
    {
        $this->devis = $devis;

        return $this;
    }

    public function getClient(): ?Client
    {
        return $this->client;
    }

    public function setClient(?Client $client): static
    {
        $this->client = $client;

        return $this;
    }

    /**
     * @return Collection<int, FactureItem>
     */
    public function getFactureItems(): Collection
    {
        return $this->factureItems;
    }

    public function addFactureItem(FactureItem $factureItem): static
    {
        if (!$this->factureItems->contains($factureItem)) {
            $this->factureItems->add($factureItem);
            $factureItem->setFacture($this);
        }

        return $this;
    }

    public function removeFactureItem(FactureItem $factureItem): static
    {
        if ($this->factureItems->removeElement($factureItem)) {
            // set the owning side to null (unless already changed)
            if ($factureItem->getFacture() === $this) {
                $factureItem->setFacture(null);
            }
        }

        return $this;
    }
}