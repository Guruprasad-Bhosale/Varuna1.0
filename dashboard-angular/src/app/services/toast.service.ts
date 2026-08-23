import { Injectable, signal, inject, NgZone } from '@angular/core';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<ToastMessage[]>([]);
  private ngZone = inject(NgZone);

  show(message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3000) {
    const id = Math.random().toString(36).substring(2, 9);
    this.toasts.update(t => [...t, { id, message, type }]);
    
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.toasts.update(t => t.filter(toast => toast.id !== id));
      }, duration);
    });
  }
}
