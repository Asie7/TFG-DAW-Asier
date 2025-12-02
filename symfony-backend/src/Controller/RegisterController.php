<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class RegisterController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): JsonResponse {
        // Obtener datos del JSON
        $data = json_decode($request->getContent(), true);

        // Validar que lleguen los campos necesarios
        if (!isset($data['nombre']) || !isset($data['email']) || !isset($data['password'])) {
            return $this->json([
                'error' => 'Faltan campos obligatorios'
            ], 400);
        }

        // Validar email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->json([
                'error' => 'Email no válido'
            ], 400);
        }

        // Verificar que el email no exista ya
        $existingUser = $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return $this->json([
                'error' => 'El email ya está registrado'
            ], 400);
        }

        // Crear nuevo usuario
        $user = new User();
        $user->setNombre($data['nombre']);
        $user->setEmail($data['email']);

        // Encriptar contraseña
        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        // Validar entidad
        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            return $this->json([
                'error' => 'Datos de usuario no válidos'
            ], 400);
        }

        // Guardar en base de datos
        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json([
            'message' => 'Usuario registrado exitosamente',
            'user' => [
                'id' => $user->getId(),
                'nombre' => $user->getNombre(),
                'email' => $user->getEmail(),
                'createdAt' => $user->getCreatedAt()->format('Y-m-d H:i:s')
            ]
        ], 201);
    }
}