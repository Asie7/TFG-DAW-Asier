<?php

namespace App\Entity;

use App\Repository\CalendarMemberRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CalendarMemberRepository::class)]
#[ORM\Table(name: 'calendar_members')]
class CalendarMember
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Calendar::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Calendar $calendario = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $usuario = null;

    #[ORM\Column(length: 20)]
    private ?string $rol = 'member'; // owner, member

    #[ORM\Column]
    private ?\DateTimeImmutable $joinedAt = null;

    public function __construct()
    {
        $this->joinedAt = new \DateTimeImmutable();
    }

    // Getters y Setters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCalendario(): ?Calendar
    {
        return $this->calendario;
    }

    public function setCalendario(?Calendar $calendario): static
    {
        $this->calendario = $calendario;
        return $this;
    }

    public function getUsuario(): ?User
    {
        return $this->usuario;
    }

    public function setUsuario(?User $usuario): static
    {
        $this->usuario = $usuario;
        return $this;
    }

    public function getRol(): ?string
    {
        return $this->rol;
    }

    public function setRol(string $rol): static
    {
        $this->rol = $rol;
        return $this;
    }

    public function getJoinedAt(): ?\DateTimeImmutable
    {
        return $this->joinedAt;
    }
}