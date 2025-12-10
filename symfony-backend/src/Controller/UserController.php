<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class UserController extends AbstractController
{
    // Actualizar avatar del usuario
    #[Route('/api/users/{id}/avatar', name: 'api_user_update_avatar', methods: ['PUT', 'OPTIONS'])]
    public function updateAvatar(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $response = new JsonResponse();
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'PUT, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        if ($request->getMethod() === 'OPTIONS') {
            $response->setStatusCode(204);
            return $response;
        }

        $user = $entityManager->getRepository(User::class)->find($id);

        if (!$user) {
            $response->setData(['error' => 'Usuario no encontrado']);
            $response->setStatusCode(404);
            return $response;
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['avatar'])) {
            $response->setData(['error' => 'Avatar es obligatorio']);
            $response->setStatusCode(400);
            return $response;
        }

        // El avatar viene como base64
        $user->setAvatar($data['avatar']);

        $entityManager->flush();

        $response->setData([
            'message' => 'Avatar actualizado exitosamente',
            'user' => [
                'id' => $user->getId(),
                'nombre' => $user->getNombre(),
                'email' => $user->getEmail(),
                'avatar' => $user->getAvatar()
            ]
        ]);

        return $response;
    }
}