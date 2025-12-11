import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CalendarService } from '../../services/calendar.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { UserAvatarComponent } from '../../components/user-avatar/user.avatar.component';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-calendars',
  standalone: true,
  imports: [CommonModule, FormsModule, UserAvatarComponent, ThemeToggleComponent],
  templateUrl: './calendars.component.html',
  styles: []
})
export class CalendarsComponent implements OnInit {
  // Usuario logueado
  usuario: any = null;

  // Lista de calendarios 
  calendarios: any[] = [];

  // Estados de carga
  isLoading = false;
  showCreateModal = false;
  showInviteModal = false; // ← NUEVO

  // Datos del nuevo calendario
  nuevoCalendario = {
    nombre: '',
    descripcion: '',
    tipo: 'personal',
    color: 'blue'
  };

  // Datos de invitación
  inviteUrl: string = ''; // ← NUEVO
  currentCalendarId: number = 0; // ← NUEVO

  // Colores disponibles
  coloresDisponibles = [
    { nombre: 'Azul', valor: 'blue', clase: 'bg-blue-500' },
    { nombre: 'Verde', valor: 'green', clase: 'bg-green-500' },
    { nombre: 'Rojo', valor: 'red', clase: 'bg-red-500' },
    { nombre: 'Morado', valor: 'purple', clase: 'bg-purple-500' },
    { nombre: 'Amarillo', valor: 'yellow', clase: 'bg-yellow-500' },
    { nombre: 'Rosa', valor: 'pink', clase: 'bg-pink-500' }
  ];

  constructor(
    private router: Router,
    private calendarService: CalendarService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // Verificar si hay usuario logueado
    const userString = localStorage.getItem('user');
    if (!userString) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.usuario = JSON.parse(userString);
    this.cargarCalendarios();
  }

  // Cargar calendarios del usuario
  cargarCalendarios() {
    this.isLoading = true;
    
    this.calendarService.getCalendars(this.usuario.id).subscribe({
      next: (calendarios) => {
        console.log('Calendarios cargados:', calendarios);
        this.calendarios = calendarios.map((cal: any) => ({
          ...cal,
          // Mapear el color del backend a la clase CSS
          colorClase: this.getColorClase(cal.color)
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar calendarios:', error);
        this.isLoading = false;
        this.toastService.error('Error al cargar los calendarios');
      }
    });
  }

  // Obtener clase CSS según el color
  getColorClase(color: string): string {
    const colorMap: any = {
      'blue': 'bg-blue-500',
      'green': 'bg-green-500',
      'red': 'bg-red-500',
      'purple': 'bg-purple-500',
      'yellow': 'bg-yellow-500',
      'pink': 'bg-pink-500'
    };
    return colorMap[color] || 'bg-blue-500';
  }

  // Abrir modal de crear calendario
  abrirModalCrear() {
    this.showCreateModal = true;
    // Resetear formulario
    this.nuevoCalendario = {
      nombre: '',
      descripcion: '',
      tipo: 'personal',
      color: 'blue'
    };
  }

  // Cerrar modal
  cerrarModal() {
    this.showCreateModal = false;
  }

  // Crear nuevo calendario
  crearCalendario() {
    if (!this.nuevoCalendario.nombre.trim()) {
      this.toastService.warning('El nombre del calendario es obligatorio');
      return;
    }

    this.isLoading = true;

    const calendarData = {
      ...this.nuevoCalendario,
      userId: this.usuario.id
    };

    this.calendarService.createCalendar(calendarData).subscribe({
      next: (response) => {
        console.log('Calendario creado:', response);
        this.isLoading = false;
        this.cerrarModal();
        
        // Toast de éxito
        this.toastService.success('Calendario "' + response.calendar.nombre + '" creado exitosamente');
        
        // Recargar lista de calendarios
        this.cargarCalendarios();
      },
      error: (error) => {
        console.error('Error al crear calendario:', error);
        this.isLoading = false;
        this.toastService.error('Error al crear el calendario');
      }
    });
  }

  // Eliminar calendario
  eliminarCalendario(id: number, nombre: string, event: Event) {
    event.stopPropagation(); // Evitar que se abra el calendario al hacer clic en eliminar
    
    const confirmar = confirm(`¿Estás seguro de eliminar el calendario "${nombre}"?`);
    if (!confirmar) return;

    this.calendarService.deleteCalendar(id).subscribe({
      next: () => {
        console.log('Calendario eliminado:', id);
        
        // Eliminar de la lista local
        this.calendarios = this.calendarios.filter(cal => cal.id !== id);
        
        // Toast de éxito
        this.toastService.success('Calendario "' + nombre + '" eliminado correctamente');
      },
      error: (error) => {
        console.error('Error al eliminar calendario:', error);
        this.toastService.error('Error al eliminar el calendario');
      }
    });
  }

  // Abrir un calendario específico
  abrirCalendario(calendarioId: number): void {
    this.router.navigate(['/calendars', calendarioId]);
  }

  // ← NUEVOS MÉTODOS PARA INVITACIONES
  mostrarModalInvitacion(calendarId: number, event: Event): void {
    event.stopPropagation();
    this.currentCalendarId = calendarId;
    
    this.calendarService.generateInviteCode(calendarId).subscribe({
      next: (response) => {
        this.inviteUrl = response.inviteUrl;
        this.showInviteModal = true;
      },
      error: (err) => {
        console.error('Error al generar código:', err);
        this.toastService.error('Error al generar enlace de invitación');
      }
    });
  }

  cerrarModalInvitacion(): void {
    this.showInviteModal = false;
    this.inviteUrl = '';
  }

  copiarEnlace(): void {
    navigator.clipboard.writeText(this.inviteUrl).then(() => {
      this.toastService.success('¡Enlace copiado al portapapeles!');
    }).catch(err => {
      console.error('Error al copiar:', err);
      this.toastService.error('Error al copiar el enlace');
    });
  }

  // Cerrar sesión
  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 1000);
  }
}