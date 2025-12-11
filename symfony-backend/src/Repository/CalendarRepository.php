<?php

namespace App\Repository;

use App\Entity\Calendar;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class CalendarRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Calendar::class);
    }

    // Método para obtener calendarios de un usuario
   public function findByUser($userId)
{
    return $this->createQueryBuilder('c')
        ->leftJoin('App\Entity\CalendarMember', 'cm', 'WITH', 'cm.calendario = c.id')
        ->where('c.propietario = :userId')
        ->orWhere('cm.usuario = :userId')
        ->setParameter('userId', $userId)
        ->orderBy('c.updatedAt', 'DESC')
        ->getQuery()
        ->getResult();
}

}