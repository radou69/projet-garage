<?php
namespace App\Entity;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;
    #[ORM\Column(length: 180)]
    private ?string $email = null;
    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];
    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;
    #[ORM\Column(length: 50)]
    private ?string $nom = null;
    #[ORM\Column]
    private bool $actif = true;
    #[ORM\Column(length: 100, nullable: true)]
    private ?string $nomGarage = null;
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $adresseGarage = null;
    // Patron qui a créé ce compte employé (null pour un compte Patron lui-même).
    #[ORM\ManyToOne]
    private ?User $patron = null;
    /**
     * @var Collection<int, Client>
     */
    #[ORM\OneToMany(targetEntity: Client::class, mappedBy: 'utilisateur')]
    private Collection $clients;
    public function __construct()
    {
        $this->clients = new ArrayCollection();
    }
    public function getId(): ?int
    {
        return $this->id;
    }
    public function getEmail(): ?string
    {
        return $this->email;
    }
    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }
    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }
    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }
    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }
    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }
    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }
    public function isActif(): bool
    {
        return $this->actif;
    }
    public function setActif(bool $actif): static
    {
        $this->actif = $actif;
        return $this;
    }
    /**
     * Ensure the session doesn't contain actual password hashes by CRC32C-hashing them, as supported since Symfony 7.3.
     */
    public function __serialize(): array
    {
        $data = (array) $this;
        $data["\0".self::class."\0password"] = hash('crc32c', $this->password);
        return $data;
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
    public function getNomGarage(): ?string
    {
        return $this->nomGarage;
    }
    public function setNomGarage(?string $nomGarage): static
    {
        $this->nomGarage = $nomGarage;
        return $this;
    }
    public function getAdresseGarage(): ?string
    {
        return $this->adresseGarage;
    }
    public function setAdresseGarage(?string $adresseGarage): static
    {
        $this->adresseGarage = $adresseGarage;
        return $this;
    }
    public function getPatron(): ?User
    {
        return $this->patron;
    }
    public function setPatron(?User $patron): static
    {
        $this->patron = $patron;
        return $this;
    }
    // Le "tenant" effectif pour l'isolation des données : soi-même si Patron,
    // sinon le patron qui a créé ce compte employé (jamais null après migration/backfill).
    public function getTenant(): User
    {
        return in_array('ROLE_PATRON', $this->getRoles(), true) ? $this : ($this->patron ?? $this);
    }
    /**
     * @return Collection<int, Client>
     */
    public function getClients(): Collection
    {
        return $this->clients;
    }
    public function addClient(Client $client): static
    {
        if (!$this->clients->contains($client)) {
            $this->clients->add($client);
            $client->setUtilisateur($this);
        }
        return $this;
    }
    public function removeClient(Client $client): static
    {
        if ($this->clients->removeElement($client)) {
            // set the owning side to null (unless already changed)
            if ($client->getUtilisateur() === $this) {
                $client->setUtilisateur(null);
            }
        }
        return $this;
    }
}
