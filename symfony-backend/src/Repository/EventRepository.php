<?php

namespace App\Repository;

use App\Entity\Event;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class EventRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Event::class);
    }

    // Obtener eventos de un calendario
    public function findByCalendar($calendarId)
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.calendario = :calendarId')
            ->setParameter('calendarId', $calendarId)
            ->orderBy('e.fechaInicio', 'ASC')
            ->getQuery()
            ->getResult();
    }
}