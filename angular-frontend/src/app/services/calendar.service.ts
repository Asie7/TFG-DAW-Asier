import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Obtener todos los calendarios de un usuario
  getCalendars(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/calendars?userId=${userId}`);
  }

  // Crear nuevo calendario
  createCalendar(calendarData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/calendars`, calendarData);
  }

  // Eliminar calendario
  deleteCalendar(calendarId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/calendars/${calendarId}`);
  }

  // Obtener un calendario específico (lo haremos después)
  getCalendar(calendarId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/calendars/${calendarId}`);
  }
}