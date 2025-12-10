<?php

namespace App\Controller;

use App\Entity\Calendar;
use App\Entity\User;
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

        $entityManager->persist($calendar);
        $entityManager->flush();

        $response->setData([
            'message' => 'Calendario creado exitosamente',
            'calendar' => [
                'id' => $calendar->getId(),
                'nombre' => $calendar->getNombre(),
                'descripcion' => $calendar->getDescripcion(),
                'tipo' => $calendar->getTipo(),
                'color' => $calendar->getColor(),
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
}