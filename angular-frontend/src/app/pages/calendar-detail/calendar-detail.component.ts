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
  showEventModal: boolean = false;
  
  // Control de calendario
  currentDate: Date = new Date();
  calendarDays: CalendarDay[] = [];
  monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
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
    this.loadCalendar();
    this.loadEvents();
  }

  loadCalendar(): void {
    this.calendarService.getCalendar(this.calendarId).subscribe({
      next: (data) => {
        this.calendar = data;
      },
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
      },
      error: (err) => {
        console.error('Error al cargar eventos:', err);
      }
    });
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    
    // Día de la semana del primer día (0 = domingo)
    const startingDayOfWeek = firstDay.getDay();
    
    const days: CalendarDay[] = [];
    
    // Días del mes anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
        events: []
      });
    }
    
    // Días del mes actual
    const today = new Date();
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      
      // Filtrar eventos de este día
      const dayEvents = this.events.filter(event => {
        const eventDate = new Date(event.fechaInicio);
        return eventDate.getDate() === day && 
               eventDate.getMonth() === month && 
               eventDate.getFullYear() === year;
      });
      
      days.push({
        date,
        day,
        isCurrentMonth: true,
        isToday,
        events: dayEvents
      });
    }
    
    // Días del mes siguiente
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: false,
        events: []
      });
    }
    
    this.calendarDays = days;
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.generateCalendar();
  }

  openEventModal(day?: CalendarDay): void {
    if (day && day.isCurrentMonth) {
      this.selectedDate = day.date;
      // Pre-rellenar con la fecha seleccionada
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

    const eventData = {
      ...this.newEvent,
      userId: Number(userId)
    };

    this.eventService.createEvent(this.calendarId, eventData).subscribe({
      next: (response) => {
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
    this.newEvent = {
      titulo: '',
      descripcion: '',
      fechaInicio: '',
      fechaFin: '',
      color: 'blue'
    };
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

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  get currentMonthYear(): string {
    return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }
}