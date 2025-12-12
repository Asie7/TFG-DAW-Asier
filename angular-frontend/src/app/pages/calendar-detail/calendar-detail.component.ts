import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CalendarService } from '../../services/calendar.service';
import { EventService, Event } from '../../services/event.service';
import { ToastService } from '../../services/toast.service';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}

interface Member {
  id: number;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    avatar: string;
  };
  rol: string;
  joinedAt: string;
}

@Component({
  selector: 'app-calendar-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar-detail.component.html'
})
export class CalendarDetailComponent implements OnInit {
  calendarId: number = 0;
  calendar: any = null;
  events: Event[] = [];
  members: Member[] = [];
  currentUserId: number = 0;
  showEventModal: boolean = false;
  showMembersPanel: boolean = false;

  // NUEVO: Modal de invitación
  showInviteModal: boolean = false;
  inviteUrl: string = '';

  // NUEVO: Filtro de eventos próximos
  filterUpcoming: 'week' | 'month' = 'week';
  upcomingEvents: Event[] = [];

  // Control de calendario
  currentDate: Date = new Date();
  calendarDays: CalendarDay[] = [];
  monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  // Cambiado para que la cuadrícula empiece en LUNES
  dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  
  // Formulario de evento
  selectedDate: Date | null = null;
  newEvent = {
    titulo: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    color: 'blue'
  };

  colorOptions = [
    { value: 'blue', label: 'Azul', class: 'bg-blue-500' },
    { value: 'red', label: 'Rojo', class: 'bg-red-500' },
    { value: 'green', label: 'Verde', class: 'bg-green-500' },
    { value: 'yellow', label: 'Amarillo', class: 'bg-yellow-500' },
    { value: 'purple', label: 'Morado', class: 'bg-purple-500' },
    { value: 'pink', label: 'Rosa', class: 'bg-pink-500' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private calendarService: CalendarService,
    private eventService: EventService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.calendarId = Number(this.route.snapshot.paramMap.get('id'));
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.currentUserId = user.id;
    }
    
    this.loadCalendar();
    this.loadEvents();
    this.loadMembers();
  }

  loadCalendar(): void {
    this.calendarService.getCalendar(this.calendarId).subscribe({
      next: (data) => { this.calendar = data; },
      error: (err) => {
        console.error('Error al cargar calendario:', err);
        this.toastService.error('Error al cargar el calendario');
      }
    });
  }

  loadEvents(): void {
    this.eventService.getEvents(this.calendarId).subscribe({
      next: (data) => {
        this.events = data;
        this.generateCalendar();
        this.getUpcomingEvents();
      },
      error: (err) => { console.error('Error al cargar eventos:', err); }
    });
  }

  /**
   * Obtiene eventos próximos según filtro:
   * - 'week' => rango desde el LUNES de esta semana hasta el DOMINGO de esta semana (no "próximos 7 días")
   * - 'month' => desde el día 1 hasta el último día del mes actual
   */
  getUpcomingEvents(): void {
    // Normalizamos "ahora" a inicio del día actual para comparaciones
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let startDate: Date;
    let endDate: Date;

    if (this.filterUpcoming === 'week') {
      // Calculamos lunes y domingo de la semana actual (semana que contiene 'now')
      const day = now.getDay(); // 0 (Dom) .. 6 (Sáb)
      const diffToMonday = (day + 6) % 7; // convierte domingo(0)->6, lunes(1)->0...
      startDate = new Date(now);
      startDate.setDate(now.getDate() - diffToMonday);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Mes actual: desde 1 hasta último día del mes
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    // Filtrar eventos en el rango (fechaInicio)
    this.upcomingEvents = this.events
      .filter(event => {
        const eventDate = new Date(event.fechaInicio);
        return eventDate >= startDate && eventDate <= endDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.fechaInicio).getTime();
        const dateB = new Date(b.fechaInicio).getTime();
        return dateA - dateB;
      })
      .slice(0, 5); // Solo los 5 primeros
  }

  changeFilter(filter: 'week' | 'month'): void {
    this.filterUpcoming = filter;
    this.getUpcomingEvents();
  }

  loadMembers(): void {
    this.calendarService.getMembers(this.calendarId).subscribe({
      next: (data) => {
        this.members = data;
        if (this.calendar && this.calendar.tipo === 'grupal' && this.members.length > 0) {
          this.showMembersPanel = true;
        }
      },
      error: (err) => { console.error('Error al cargar miembros:', err); }
    });
  }

  isOwner(): boolean {
    const ownerMember = this.members.find(m => m.rol === 'owner');
    return ownerMember ? ownerMember.usuario.id === this.currentUserId : false;
  }

  removeMember(memberId: number, memberName: string): void {
    if (!confirm(`¿Estás seguro de expulsar a ${memberName} del calendario?`)) return;

    this.calendarService.removeMember(memberId).subscribe({
      next: () => {
        this.toastService.success(`${memberName} ha sido expulsado del calendario`);
        this.loadMembers();
      },
      error: (err) => {
        console.error('Error al expulsar miembro:', err);
        this.toastService.error('Error al expulsar miembro');
      }
    });
  }

  toggleMembersPanel(): void {
    this.showMembersPanel = !this.showMembersPanel;
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  // NUEVO: Métodos del modal de invitación
  mostrarModalInvitacion(): void {
    this.calendarService.generateInviteCode(this.calendarId).subscribe({
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

  /**
   * Genera los días del calendario para el mes actual en this.currentDate
   * - Empieza la grid en LUNES
   * - Rellena días previos y siguientes para completar 6 filas (42 celdas)
   * - Asigna events a cada día comparando year/month/date
   */
  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Convertimos getDay() a índice donde Lunes = 0 ... Domingo = 6
    // getDay(): 0 = Dom, 1 = Lun, ... 6 = Sáb
    const firstDayIndex = (firstDay.getDay() + 6) % 7;

    const days: CalendarDay[] = [];

    // Días del mes anterior (para rellenar antes del 1)
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const date = new Date(year, month - 1, dayNum);
      days.push({
        date,
        day: dayNum,
        isCurrentMonth: false,
        isToday: false,
        events: []
      });
    }

    // Días del mes actual
    const today = new Date();
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);

      const dayEvents = this.events.filter(event => {
        const eventDate = new Date(event.fechaInicio);
        return (
          eventDate.getFullYear() === year &&
          eventDate.getMonth() === month &&
          eventDate.getDate() === d
        );
      });

      days.push({
        date,
        day: d,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        events: dayEvents
      });
    }

    // Completar hasta 42 celdas (6 filas x 7 columnas)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        day: i,
        isCurrentMonth: false,
        isToday: false,
        events: []
      });
    }

    this.calendarDays = days;

    // Actualizar lista de próximos eventos al regenerar calendario
    // (útil si cambias de mes / navegas)
    this.getUpcomingEvents();
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.generateCalendar();
  }

  openEventModal(day?: CalendarDay): void {
    if (day && day.isCurrentMonth) {
      this.selectedDate = day.date;
      const dateStr = this.formatDateForInput(day.date);
      this.newEvent.fechaInicio = dateStr;
      this.newEvent.fechaFin = dateStr;
    }
    this.showEventModal = true;
  }

  closeEventModal(): void {
    this.showEventModal = false;
    this.selectedDate = null;
    this.resetForm();
  }

  createEvent(): void {
    if (!this.newEvent.titulo || !this.newEvent.fechaInicio || !this.newEvent.fechaFin) {
      this.toastService.warning('Por favor completa todos los campos obligatorios');
      return;
    }

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.toastService.error('No se encontró usuario logueado');
      return;
    }

    const user = JSON.parse(userStr);
    const userId = user.id;

    const eventData = { ...this.newEvent, userId: Number(userId) };

    this.eventService.createEvent(this.calendarId, eventData).subscribe({
      next: () => {
        this.toastService.success('Evento creado exitosamente');
        this.closeEventModal();
        this.loadEvents();
      },
      error: (err) => {
        console.error('Error al crear evento:', err);
        this.toastService.error('Error al crear el evento');
      }
    });
  }

  deleteEvent(eventId: number, event: MouseEvent): void {
    event.stopPropagation();
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;

    this.eventService.deleteEvent(eventId).subscribe({
      next: () => {
        this.toastService.success('Evento eliminado');
        this.loadEvents();
      },
      error: (err) => {
        console.error('Error al eliminar evento:', err);
        this.toastService.error('Error al eliminar evento');
      }
    });
  }

  resetForm(): void {
    this.newEvent = { titulo: '', descripcion: '', fechaInicio: '', fechaFin: '', color: 'blue' };
  }

  goBack(): void {
    this.router.navigate(['/calendars']);
  }

  getColorClass(color: string): string {
    const colors: any = {
      blue: 'bg-blue-500',
      red: 'bg-red-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500'
    };
    return colors[color] || 'bg-gray-500';
  }

  getColorHex(color: string): string {
    const colorMap: any = {
      blue: '#3B82F6',
      red: '#EF4444',
      green: '#10B981',
      yellow: '#F59E0B',
      purple: '#8B5CF6',
      pink: '#EC4899'
    };
    return colorMap[color] || '#6B7280';
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Si es hoy
    if (date.toDateString() === today.toDateString()) {
      return `Hoy, ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    
    // Si es mañana
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Mañana, ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    // Otro día
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get currentMonthYear(): string {
    return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }
}
