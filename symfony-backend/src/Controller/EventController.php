<?php

namespace App\Controller;

use App\Entity\Event;
use App\Entity\Calendar;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class EventController extends AbstractController
{
    // Listar eventos de un calendario
    #[Route('/api/calendars/{calendarId}/events', name: 'api_events_list', methods: ['GET', 'OPTIONS'])]
    public function list(
        int $calendarId,
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

        $calendar = $entityManager->getRepository(Calendar::class)->find($calendarId);
        if (!$calendar) {
            $response->setData(['error' => 'Calendario no encontrado']);
            $response->setStatusCode(404);
            return $response;
        }

        $events = $entityManager->getRepository(Event::class)->findByCalendar($calendarId);

        $eventsArray = array_map(function($event) {
            return [
                'id' => $event->getId(),
                'titulo' => $event->getTitulo(),
                'descripcion' => $event->getDescripcion(),
                'fechaInicio' => $event->getFechaInicio()->format('Y-m-d H:i:s'),
                'fechaFin' => $event->getFechaFin()->format('Y-m-d H:i:s'),
                'color' => $event->getColor(),
                'creador' => [
                    'id' => $event->getCreador()->getId(),
                    'nombre' => $event->getCreador()->getNombre()
                ]
            ];
        }, $events);

        $response->setData($eventsArray);
        return $response;
    }

    // Crear evento
    #[Route('/api/calendars/{calendarId}/events', name: 'api_events_create', methods: ['POST', 'OPTIONS'])]
    public function create(
        int $calendarId,
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

        if (!isset($data['titulo']) || !isset($data['fechaInicio']) || !isset($data['fechaFin'])) {
            $response->setData(['error' => 'Faltan campos obligatorios']);
            $response->setStatusCode(400);
            return $response;
        }

        $calendar = $entityManager->getRepository(Calendar::class)->find($calendarId);
        if (!$calendar) {
            $response->setData(['error' => 'Calendario no encontrado']);
            $response->setStatusCode(404);
            return $response;
        }

        $user = $entityManager->getRepository(User::class)->find($data['userId']);
        if (!$user) {
            $response->setData(['error' => 'Usuario no encontrado']);
            $response->setStatusCode(404);
            return $response;
        }

        $event = new Event();
        $event->setTitulo($data['titulo']);
        $event->setDescripcion($data['descripcion'] ?? '');
        $event->setFechaInicio(new \DateTimeImmutable($data['fechaInicio']));
        $event->setFechaFin(new \DateTimeImmutable($data['fechaFin']));
        $event->setColor($data['color'] ?? 'blue');
        $event->setCalendario($calendar);
        $event->setCreador($user);

        $entityManager->persist($event);
        $entityManager->flush();

        $response->setData([
            'message' => 'Evento creado exitosamente',
            'event' => [
                'id' => $event->getId(),
                'titulo' => $event->getTitulo(),
                'fechaInicio' => $event->getFechaInicio()->format('Y-m-d H:i:s'),
                'fechaFin' => $event->getFechaFin()->format('Y-m-d H:i:s')
            ]
        ]);
        $response->setStatusCode(201);
        
        return $response;
    }

    // Eliminar evento
    #[Route('/api/events/{id}', name: 'api_events_delete', methods: ['DELETE', 'OPTIONS'])]
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

        $event = $entityManager->getRepository(Event::class)->find($id);

        if (!$event) {
            $response->setData(['error' => 'Evento no encontrado']);
            $response->setStatusCode(404);
            return $response;
        }

        $entityManager->remove($event);
        $entityManager->flush();

        $response->setData(['message' => 'Evento eliminado exitosamente']);
        return $response;
    }
}