import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarService } from '../../services/calendar.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-join-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './join-calendar.component.html'
})
export class JoinCalendarComponent implements OnInit {
  inviteCode: string = '';
  isLoading: boolean = true;
  calendarName: string = '';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private calendarService: CalendarService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.inviteCode = this.route.snapshot.paramMap.get('inviteCode') || '';
    
    // Verificar si hay usuario logueado
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.toastService.warning('Debes iniciar sesión para unirte a un calendario');
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: `/join/${this.inviteCode}` } 
      });
      return;
    }

    this.joinCalendar();
  }

  joinCalendar(): void {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    
    this.calendarService.joinCalendar(this.inviteCode, user.id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.calendarName = response.calendar.nombre;
        this.toastService.success(`¡Te has unido a "${this.calendarName}"!`);
        
        // Redirigir al calendario después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/calendar', response.calendar.id]);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al unirse:', err);
        
        if (err.error && err.error.error) {
          this.errorMessage = err.error.error;
        } else {
          this.errorMessage = 'Error al unirse al calendario';
        }
        
        this.toastService.error(this.errorMessage);
      }
    });
  }

  goToCalendars(): void {
    this.router.navigate(['/calendars']);
  }
}