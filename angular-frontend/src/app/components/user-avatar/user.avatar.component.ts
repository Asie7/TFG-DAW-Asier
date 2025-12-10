import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-avatar.component.html',
})
export class UserAvatarComponent implements OnInit {
  userName: string = 'Usuario';
  userEmail: string = '';
  userAvatar: string = '';
  isMenuOpen: boolean = false;
  showAvatarModal: boolean = false; // ← AÑADE ESTO

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName = user.nombre || 'Usuario';
      this.userEmail = user.email || '';
      this.userAvatar = user.avatar || '';
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  goToCalendars(): void {
    this.router.navigate(['/calendars']);
    this.closeMenu();
  }

  openFileSelector(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadAvatar(file);
      }
    };
    input.click();
    this.closeMenu();
  }

  uploadAvatar(file: File): void {
    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.toastService.warning('La imagen no puede superar 2MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      this.toastService.error('Solo se permiten imágenes');
      return;
    }

    // Convertir a base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.updateAvatarOnServer(base64);
    };
    reader.readAsDataURL(file);
  }

  updateAvatarOnServer(avatar: string): void {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.toastService.error('No se encontró usuario logueado');
      return;
    }

    const user = JSON.parse(userStr);
    const userId = user.id;

    this.authService.updateAvatar(userId, avatar).subscribe({
      next: (response) => {
        // Actualizar localStorage
        user.avatar = avatar;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Actualizar vista
        this.userAvatar = avatar;
        
        this.toastService.success('Avatar actualizado correctamente');
      },
      error: (err) => {
        console.error('Error al actualizar avatar:', err);
        this.toastService.error('Error al actualizar el avatar');
      }
    });
  }

  viewAvatarFullSize(): void {
    if (this.userAvatar) {
      this.showAvatarModal = true;
    }
  }

  closeAvatarModal(): void {
    this.showAvatarModal = false;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/']);
    this.toastService.success('Sesión cerrada correctamente');
  }
  isLoggedIn(): boolean {
  const userStr = localStorage.getItem('user');
  return !!userStr;
}
removeAvatar(): void {
  if (!confirm('¿Estás seguro de eliminar tu foto de perfil?')) return;

  const userStr = localStorage.getItem('user');
  if (!userStr) return;

  const user = JSON.parse(userStr);
  const userId = user.id;

  this.authService.updateAvatar(userId, '').subscribe({
    next: (response) => {
      // Actualizar localStorage
      user.avatar = '';
      localStorage.setItem('user', JSON.stringify(user));
      
      // Actualizar vista
      this.userAvatar = '';
      
      this.toastService.success('Foto eliminada correctamente');
      this.closeMenu();
    },
    error: (err) => {
      console.error('Error al eliminar avatar:', err);
      this.toastService.error('Error al eliminar la foto');
    }
  });
}


}