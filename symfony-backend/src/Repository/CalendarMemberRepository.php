<?php

namespace App\Repository;

use App\Entity\CalendarMember;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class CalendarMemberRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CalendarMember::class);
    }

    public function findByCalendar($calendarId)
    {
        return $this->createQueryBuilder('cm')
            ->andWhere('cm.calendario = :calendarId')
            ->setParameter('calendarId', $calendarId)
            ->orderBy('cm.joinedAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function countMembersByCalendar($calendarId): int
    {
        return (int) $this->createQueryBuilder('cm')
            ->select('COUNT(cm.id)')
            ->andWhere('cm.calendario = :calendarId')
            ->setParameter('calendarId', $calendarId)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function isMember($calendarId, $userId): bool
    {
        $result = $this->createQueryBuilder('cm')
            ->select('COUNT(cm.id)')
            ->andWhere('cm.calendario = :calendarId')
            ->andWhere('cm.usuario = :userId')
            ->setParameter('calendarId', $calendarId)
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getSingleScalarResult();

        return $result > 0;
    }
}