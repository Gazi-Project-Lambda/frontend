import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Holds the list of active toasts
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  /**
   * Show a new toast notification
   * @param message Text to display
   * @param type 'success' | 'error' | 'info'
   * @param duration Time in ms before auto-dismiss (default 3000ms)
   */
  show(message: string, type: 'success' | 'error' | 'info' = 'success', duration: number = 3000): void {
    const id = Date.now();
    const newToast: ToastMessage = { id, message, type };
    
    // Add to current list
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, newToast]);

    // Auto remove
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  /**
   * Remove a specific toast by ID
   */
  remove(id: number): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.filter(t => t.id !== id);
    this.toastsSubject.next(updatedToasts);
  }
}