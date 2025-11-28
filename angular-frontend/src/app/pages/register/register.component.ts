import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styles: []
})
export class RegisterComponent {
  // Modelo del formulario
  usuario = {
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  // Errores específicos por campo
  errores = {
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  // Estados de validación
  camposValidos = {
    nombre: false,
    email: false,
    password: false,
    confirmPassword: false
  };

  // Para mostrar/ocultar contraseñas
  mostrarPassword = false;
  mostrarConfirmPassword = false;

  // Fortaleza de la contraseña
  fortalezaPassword = 0; // 0=débil, 1=media, 2=fuerte

  errorMessage = '';
  isLoading = false;

  constructor(private router: Router) {}

  // Validar nombre en tiempo real
  validarNombre() {
    if (!this.usuario.nombre) {
      this.errores.nombre = 'El nombre es obligatorio';
      this.camposValidos.nombre = false;
    } else if (this.usuario.nombre.length < 3) {
      this.errores.nombre = 'El nombre debe tener al menos 3 caracteres';
      this.camposValidos.nombre = false;
    } else {
      this.errores.nombre = '';
      this.camposValidos.nombre = true;
    }
  }

  // Validar email en tiempo real
  validarEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!this.usuario.email) {
      this.errores.email = 'El email es obligatorio';
      this.camposValidos.email = false;
    } else if (!emailRegex.test(this.usuario.email)) {
      this.errores.email = 'Email no válido';
      this.camposValidos.email = false;
    } else {
      this.errores.email = '';
      this.camposValidos.email = true;
    }
  }

  // Validar contraseña en tiempo real
  validarPassword() {
    if (!this.usuario.password) {
      this.errores.password = 'La contraseña es obligatoria';
      this.camposValidos.password = false;
      this.fortalezaPassword = 0;
    } else if (this.usuario.password.length < 6) {
      this.errores.password = 'La contraseña debe tener al menos 6 caracteres';
      this.camposValidos.password = false;
      this.fortalezaPassword = 0;
    } else {
      this.errores.password = '';
      this.camposValidos.password = true;
      
      // Calcular fortaleza
      this.calcularFortalezaPassword();
    }

    // Revalidar confirmación si ya tiene algo escrito
    if (this.usuario.confirmPassword) {
      this.validarConfirmPassword();
    }
  }

  // Calcular fortaleza de la contraseña
  calcularFortalezaPassword() {
    const password = this.usuario.password;
    let fortaleza = 0;

    // Criterios de fortaleza
    if (password.length >= 8) fortaleza++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) fortaleza++; // Mayúsculas y minúsculas
    if (/[0-9]/.test(password)) fortaleza++; // Números
    if (/[^a-zA-Z0-9]/.test(password)) fortaleza++; // Caracteres especiales

    // 0-1 = débil, 2-3 = media, 4 = fuerte
    if (fortaleza <= 1) this.fortalezaPassword = 0;
    else if (fortaleza <= 3) this.fortalezaPassword = 1;
    else this.fortalezaPassword = 2;
  }

  // Validar confirmación de contraseña
  validarConfirmPassword() {
    if (!this.usuario.confirmPassword) {
      this.errores.confirmPassword = 'Debes confirmar la contraseña';
      this.camposValidos.confirmPassword = false;
    } else if (this.usuario.password !== this.usuario.confirmPassword) {
      this.errores.confirmPassword = 'Las contraseñas no coinciden';
      this.camposValidos.confirmPassword = false;
    } else {
      this.errores.confirmPassword = '';
      this.camposValidos.confirmPassword = true;
    }
  }

  // Generar contraseña aleatoria
  generarPasswordAleatoria() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    // Asegurar al menos: 1 mayúscula, 1 minúscula, 1 número, 1 especial
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    // Rellenar hasta 12 caracteres
    for (let i = 4; i < 12; i++) {
      password += caracteres[Math.floor(Math.random() * caracteres.length)];
    }
    
    // Mezclar caracteres
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    this.usuario.password = password;
    this.usuario.confirmPassword = password;
    this.validarPassword();
    this.validarConfirmPassword();
  }

  // Toggle mostrar/ocultar contraseña
  toggleMostrarPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  toggleMostrarConfirmPassword() {
    this.mostrarConfirmPassword = !this.mostrarConfirmPassword;
  }

  // Método que se ejecuta al enviar el formulario
  onSubmit() {
    // Validar todos los campos
    this.validarNombre();
    this.validarEmail();
    this.validarPassword();
    this.validarConfirmPassword();

    // Verificar que todos sean válidos
    const todosValidos = Object.values(this.camposValidos).every(v => v === true);

    if (!todosValidos) {
      this.errorMessage = 'Por favor, corrige los errores antes de continuar';
      return;
    }

    // Si llegamos aquí, todo está bien
    this.errorMessage = '';
    this.isLoading = true;

    console.log('Usuario a registrar:', this.usuario);
    
    // Simulamos una llamada al backend
    setTimeout(() => {
      this.isLoading = false;
      alert('¡Registro exitoso! (por ahora es simulado)');
    }, 1500);
  }

  // Obtener texto de fortaleza
  getTextoFortaleza(): string {
    if (this.fortalezaPassword === 0) return 'Débil';
    if (this.fortalezaPassword === 1) return 'Media';
    return 'Fuerte';
  }

  // Obtener color de fortaleza
  getColorFortaleza(): string {
    if (this.fortalezaPassword === 0) return 'bg-red-500';
    if (this.fortalezaPassword === 1) return 'bg-yellow-500';
    return 'bg-green-500';
  }
}