import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { UserAvatarComponent } from '../../components/user-avatar/user.avatar.component';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, UserAvatarComponent, ThemeToggleComponent],
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent {
  // Modelo del formulario
  credenciales = {
    email: '',
    password: ''
  };

  // Para mostrar/ocultar contraseña
  mostrarPassword = false;

  // Mensajes
  errorMessage = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  // Toggle mostrar/ocultar contraseña
  toggleMostrarPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  // Método que se ejecuta al enviar el formulario
  onSubmit() {
    // Validación básica
    if (!this.credenciales.email || !this.credenciales.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      this.toastService.warning(this.errorMessage);
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    console.log('Intentando login con:', this.credenciales.email);

    // Llamar al backend
    this.authService.login(this.credenciales).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.isLoading = false;
        
        // Guardar token y usuario
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Toast de éxito
        this.toastService.success('¡Bienvenido ' + response.user.nombre + '!');
        
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
        this.isLoading = false;
        
        if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
          this.toastService.error(this.errorMessage);
        } else {
          this.errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
          this.toastService.error(this.errorMessage);
        }
      }
    });
  }
}