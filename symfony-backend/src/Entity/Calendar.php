<?php

namespace App\Entity;

use App\Repository\CalendarRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity(repositoryClass: CalendarRepository::class)]
#[ORM\Table(name: 'calendars')]
class Calendar
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $nombre = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $descripcion = null;

    #[ORM\Column(length: 20)]
    private ?string $tipo = 'personal'; // 'personal' o 'grupal'

    #[ORM\Column(length: 20)]
    private ?string $color = 'blue'; // Color para la UI


#[ORM\OneToMany(mappedBy: 'calendario', targetEntity: CalendarMember::class, cascade: ['remove'], orphanRemoval: true)]
private Collection $members;

    #[ORM\Column(length: 20, unique: true, nullable: true)]
private ?string $inviteCode = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $propietario = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->members = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    public function setNombre(string $nombre): static
    {
        $this->nombre = $nombre;
        return $this;
    }

    public function getDescripcion(): ?string
    {
        return $this->descripcion;
    }

    public function setDescripcion(?string $descripcion): static
    {
        $this->descripcion = $descripcion;
        return $this;
    }

    public function getTipo(): ?string
    {
        return $this->tipo;
    }

    public function setTipo(string $tipo): static
    {
        $this->tipo = $tipo;
        return $this;
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function setColor(string $color): static
    {
        $this->color = $color;
        return $this;
    }

    public function getPropietario(): ?User
    {
        return $this->propietario;
    }

    public function setPropietario(?User $propietario): static
    {
        $this->propietario = $propietario;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
    
    public function getInviteCode(): ?string
{
    return $this->inviteCode;
}

public function setInviteCode(?string $inviteCode): static
{
    $this->inviteCode = $inviteCode;
    return $this;
}

public function getMembers(): Collection
{
    return $this->members;
}

// Método para generar código único
public function generateInviteCode(): void
{
    $this->inviteCode = substr(md5(uniqid()), 0, 10);
}
}