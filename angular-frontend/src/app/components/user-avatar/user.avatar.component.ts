import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-avatar.component.html',
  styles: []
})
export class UserAvatarComponent implements OnInit {
  usuario: any = null;
  isLoggedIn = false;
  showMenu = false;

  constructor(
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.cargarUsuario();
  }

  cargarUsuario() {
    const userString = localStorage.getItem('user');
    if (userString) {
      this.usuario = JSON.parse(userString);
      this.isLoggedIn = true;
    }
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  closeMenu() {
    this.showMenu = false;
  }

  editarFoto() {
    this.closeMenu();
    this.toastService.info('Próximamente: Cambiar foto de perfil');
  }

  irACalendarios() {
    this.closeMenu();
    this.router.navigate(['/calendars']);
  }

  cerrarSesion() {
    this.closeMenu();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.toastService.success('Sesión cerrada correctamente');
    
    this.isLoggedIn = false;
    this.usuario = null;
    
    setTimeout(() => {
      this.router.navigate(['/']);
      window.location.reload(); // Recargar para actualizar el avatar
    }, 1000);
  }
}