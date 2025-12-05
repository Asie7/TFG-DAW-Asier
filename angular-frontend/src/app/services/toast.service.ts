import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  
  private nextId = 1;

  constructor() {}

  // Mostrar toast de éxito
  success(message: string, duration: number = 3000) {
    this.show(message, 'success', duration);
  }

  // Mostrar toast de error
  error(message: string, duration: number = 4000) {
    this.show(message, 'error', duration);
  }

  // Mostrar toast de advertencia
  warning(message: string, duration: number = 3500) {
    this.show(message, 'warning', duration);
  }

  // Mostrar toast de información
  info(message: string, duration: number = 3000) {
    this.show(message, 'info', duration);
  }

  // Método general para mostrar toast
  private show(message: string, type: Toast['type'], duration: number) {
    const toast: Toast = {
      id: this.nextId++,
      message,
      type,
      duration
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Auto-remover después del tiempo especificado
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }
  }

  // Remover un toast específico
  remove(id: number) {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(t => t.id !== id));
  }

  // Limpiar todos los toasts
  clear() {
    this.toastsSubject.next([]);
  }
}