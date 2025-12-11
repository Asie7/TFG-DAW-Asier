<?php

namespace App\Controller;

use App\Entity\Calendar;
use App\Entity\User;
use App\Entity\CalendarMember;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class CalendarController extends AbstractController
{
    // Obtener todos los calendarios del usuario
    #[Route('/api/calendars', name: 'api_calendars_list', methods: ['GET', 'OPTIONS'])]
    public function list(
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $response = new JsonResponse();
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        if ($request->getMethod() === 'OPTIONS') {
            $response->setStatusCode(204);
            return $response;
        }

        $userId = $request->query->get('userId', 1);

        $user = $entityManager->getRepository(User::class)->find($userId);
        if (!$user) {
            $response->setData(['error' => 'Usuario no encontrado']);
            $response->setStatusCode(404);
            return $response;
        }

        $calendars = $entityManager->getRepository(Calendar::class)->findByUser($userId);

        $calendaresArray = array_map(function($calendar) {
            return [
                'id' => $calendar->getId(),
                'nombre' => $calendar->getNombre(),
                'descripcion' => $calendar->getDescripcion(),
                'tipo' => $calendar->getTipo(),
                'color' => $calendar->getColor(),
                'createdAt' => $calendar->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $calendar->getUpdatedAt()->format('Y-m-d H:i:s')
            ];
        }, $calendars);

        $response->setData($calendaresArray);
        return $response;
    }

    // Obtener un calendario específico por ID
   #[Route('/api/calendars/{id}', name: 'api_calendar_get', methods: ['GET', 'OPTIONS'])]
public function getCalendar(
    int $id,
    Request $request,
    EntityManagerInterface $entityManager
): JsonResponse {
    $response = new JsonResponse();
    $response->headers->set('Access-Control-Allow-Origin', '*');
    $response->headers->set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if ($request->getMethod() === 'OPTIONS') {
        $response->setStatusCode(204);
        return $response;
    }

    $calendar = $entityManager->getRepository(Calendar::class)->find($id);

    if (!$calendar) {
        $response->setData(['error' => 'Calendario no encontrado']);
        $response->setStatusCode(404);
        return $response;
    }

    $response->setData([
        'id' => $calendar->getId(),
        'nombre' => $calendar->getNombre(),
        'descripcion' => $calendar->getDescripcion(),
        'tipo' => $calendar->getTipo(),
        'color' => $calendar->getColor(),
        'createdAt' => $calendar->getCreatedAt()->format('Y-m-d H:i:s'),
        'updatedAt' => $calendar->getUpdatedAt()->format('Y-m-d H:i:s'),
        'propietario' => [
            'id' => $calendar->getPropietario()->getId(),
            'nombre' => $calendar->getPropietario()->getNombre()
        ]
    ]);

        return $response;
    }

// Crear nuevo calendario
#[Route('/api/calendars', name: 'api_calendars_create', methods: ['POST', 'OPTIONS'])]
public function create(
    Request $request,
    EntityManagerInterface $entityManager
): JsonResponse {
    $response = new JsonResponse();
    $response->headers->set('Access-Control-Allow-Origin', '*');
    $response->headers->set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if ($request->getMethod() === 'OPTIONS') {
        $response->setStatusCode(204);
        return $response;
    }

    $data = json_decode($request->getContent(), true);

    if (!isset($data['nombre']) || !isset($data['userId'])) {
        $response->setData(['error' => 'Nombre y userId son obligatorios']);
        $response->setStatusCode(400);
        return $response;
    }

    $user = $entityManager->getRepository(User::class)->find($data['userId']);
    if (!$user) {
        $response->setData(['error' => 'Usuario no encontrado']);
        $response->setStatusCode(404);
        return $response;
    }

    $calendar = new Calendar();
    $calendar->setNombre($data['nombre']);
    $calendar->setDescripcion($data['descripcion'] ?? '');
    $calendar->setTipo($data['tipo'] ?? 'personal');
    $calendar->setColor($data['color'] ?? 'blue');
    $calendar->setPropietario($user);
    $calendar->generateInviteCode(); // ← GENERA CÓDIGO DE INVITACIÓN

    $entityManager->persist($calendar);
    $entityManager->flush();

    // Si es grupal, añadir al creador como owner
    if ($calendar->getTipo() === 'grupal') {
        $member = new CalendarMember();
        $member->setCalendario($calendar);
        $member->setUsuario($user);
        $member->setRol('owner');
        
        $entityManager->persist($member);
        $entityManager->flush();
    }

    $response->setData([
        'message' => 'Calendario creado exitosamente',
        'calendar' => [
            'id' => $calendar->getId(),
            'nombre' => $calendar->getNombre(),
            'descripcion' => $calendar->getDescripcion(),
            'tipo' => $calendar->getTipo(),
            'color' => $calendar->getColor(),
            'inviteCode' => $calendar->getInviteCode(), // ← DEVUELVE EL CÓDIGO
            'createdAt' => $calendar->getCreatedAt()->format('Y-m-d H:i:s')
        ]
    ]);
    $response->setStatusCode(201);
    
    return $response;
}

    // Eliminar calendario
    #[Route('/api/calendars/{id}', name: 'api_calendars_delete', methods: ['DELETE', 'OPTIONS'])]
    public function delete(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $response = new JsonResponse();
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        if ($request->getMethod() === 'OPTIONS') {
            $response->setStatusCode(204);
            return $response;
        }

        $calendar = $entityManager->getRepository(Calendar::class)->find($id);

        if (!$calendar) {
            $response->setData(['error' => 'Calendario no encontrado']);
            $response->setStatusCode(404);
            return $response;
        }

        $entityManager->remove($calendar);
        $entityManager->flush();

        $response->setData(['message' => 'Calendario eliminado exitosamente']);
        return $response;
    }

    // Generar código de invitación
#[Route('/api/calendars/{id}/invite', name: 'api_calendar_generate_invite', methods: ['POST', 'OPTIONS'])]
public function generateInviteCode(
    int $id,
    Request $request,
    EntityManagerInterface $entityManager
): JsonResponse {
    $response = new JsonResponse();
    $response->headers->set('Access-Control-Allow-Origin', '*');
    $response->headers->set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if ($request->getMethod() === 'OPTIONS') {
        $response->setStatusCode(204);
        return $response;
    }

    $calendar = $entityManager->getRepository(Calendar::class)->find($id);

    if (!$calendar) {
        $response->setData(['error' => 'Calendario no encontrado']);
        $response->setStatusCode(404);
        return $response;
    }

    // Generar código si no existe
    if (!$calendar->getInviteCode()) {
        $calendar->generateInviteCode();
        $entityManager->flush();
    }

    $response->setData([
        'inviteCode' => $calendar->getInviteCode(),
        'inviteUrl' => 'http://localhost:4200/join/' . $calendar->getInviteCode()
    ]);

    return $response;
}

// Unirse a un calendario mediante código
#[Route('/api/calendars/join/{inviteCode}', name: 'api_calendar_join', methods: ['POST', 'OPTIONS'])]
public function joinCalendar(
    string $inviteCode,
    Request $request,
    EntityManagerInterface $entityManager
): JsonResponse {
    $response = new JsonResponse();
    $response->headers->set('Access-Control-Allow-Origin', '*');
    $response->headers->set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if ($request->getMethod() === 'OPTIONS') {
        $response->setStatusCode(204);
        return $response;
    }

    $data = json_decode($request->getContent(), true);

    if (!isset($data['userId'])) {
        $response->setData(['error' => 'userId es obligatorio']);
        $response->setStatusCode(400);
        return $response;
    }

    $calendar = $entityManager->getRepository(Calendar::class)->findOneBy(['inviteCode' => $inviteCode]);

    if (!$calendar) {
        $response->setData(['error' => 'Código de invitación inválido']);
        $response->setStatusCode(404);
        return $response;
    }

    $user = $entityManager->getRepository(User::class)->find($data['userId']);

    if (!$user) {
        $response->setData(['error' => 'Usuario no encontrado']);
        $response->setStatusCode(404);
        return $response;
    }

    // Verificar si ya es miembro
    $memberRepo = $entityManager->getRepository(CalendarMember::class);
    if ($memberRepo->isMember($calendar->getId(), $user->getId())) {
        $response->setData(['error' => 'Ya eres miembro de este calendario']);
        $response->setStatusCode(400);
        return $response;
    }

    // Verificar límite de miembros (6)
    $memberCount = $memberRepo->countMembersByCalendar($calendar->getId());
    if ($memberCount >= 6) {
        $response->setData(['error' => 'Este calendario ya alcanzó el límite de 6 miembros']);
        $response->setStatusCode(400);
        return $response;
    }

    // Añadir como miembro
    $member = new CalendarMember();
    $member->setCalendario($calendar);
    $member->setUsuario($user);
    $member->setRol('member');

    $entityManager->persist($member);
    $entityManager->flush();

    $response->setData([
        'message' => 'Te has unido al calendario exitosamente',
        'calendar' => [
            'id' => $calendar->getId(),
            'nombre' => $calendar->getNombre(),
            'descripcion' => $calendar->getDescripcion()
        ]
    ]);

    return $response;
}

// Obtener miembros de un calendario
#[Route('/api/calendars/{id}/members', name: 'api_calendar_members', methods: ['GET', 'OPTIONS'])]
public function getMembers(
    int $id,
    Request $request,
    EntityManagerInterface $entityManager
): JsonResponse {
    $response = new JsonResponse();
    $response->headers->set('Access-Control-Allow-Origin', '*');
    $response->headers->set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if ($request->getMethod() === 'OPTIONS') {
        $response->setStatusCode(204);
        return $response;
    }

    $calendar = $entityManager->getRepository(Calendar::class)->find($id);

    if (!$calendar) {
        $response->setData(['error' => 'Calendario no encontrado']);
        $response->setStatusCode(404);
        return $response;
    }

    $members = $entityManager->getRepository(CalendarMember::class)->findByCalendar($id);

    $membersArray = array_map(function($member) {
        return [
            'id' => $member->getId(),
            'usuario' => [
                'id' => $member->getUsuario()->getId(),
                'nombre' => $member->getUsuario()->getNombre(),
                'email' => $member->getUsuario()->getEmail(),
                'avatar' => $member->getUsuario()->getAvatar()
            ],
            'rol' => $member->getRol(),
            'joinedAt' => $member->getJoinedAt()->format('Y-m-d H:i:s')
        ];
    }, $members);

    $response->setData($membersArray);
    return $response;
}

// Expulsar miembro (solo owner)
#[Route('/api/calendars/members/{memberId}', name: 'api_calendar_remove_member', methods: ['DELETE', 'OPTIONS'])]
public function removeMember(
    int $memberId,
    Request $request,
    EntityManagerInterface $entityManager
): JsonResponse {
    $response = new JsonResponse();
    $response->headers->set('Access-Control-Allow-Origin', '*');
    $response->headers->set('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if ($request->getMethod() === 'OPTIONS') {
        $response->setStatusCode(204);
        return $response;
    }

    $member = $entityManager->getRepository(CalendarMember::class)->find($memberId);

    if (!$member) {
        $response->setData(['error' => 'Miembro no encontrado']);
        $response->setStatusCode(404);
        return $response;
    }

    // No se puede expulsar al owner
    if ($member->getRol() === 'owner') {
        $response->setData(['error' => 'No se puede expulsar al propietario del calendario']);
        $response->setStatusCode(400);
        return $response;
    }

    $entityManager->remove($member);
    $entityManager->flush();

    $response->setData(['message' => 'Miembro eliminado exitosamente']);
    return $response;
}
}