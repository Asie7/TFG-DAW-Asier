import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Event {
  id?: number;
  titulo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  color: string;
  creador?: {
    id: number;
    nombre: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Obtener eventos de un calendario
  getEvents(calendarId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/calendars/${calendarId}/events`);
  }

  // Crear evento
  createEvent(calendarId: number, eventData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/calendars/${calendarId}/events`, eventData);
  }

  // Eliminar evento
  deleteEvent(eventId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${eventId}`);
  }
}