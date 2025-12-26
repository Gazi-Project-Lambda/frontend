import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts$ | async" 
           class="toast-card" 
           [ngClass]="toast.type"
           (click)="toastService.remove(toast.id)">
        
        <div class="icon-area">
          <i class="ri-checkbox-circle-fill" *ngIf="toast.type === 'success'"></i>
          <i class="ri-error-warning-fill" *ngIf="toast.type === 'error'"></i>
          <i class="ri-information-fill" *ngIf="toast.type === 'info'"></i>
        </div>
        
        <div class="message-area">
          {{ toast.message }}
        </div>

        <div class="close-btn">
          <i class="ri-close-line"></i>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./toast.component.css']
})
export class ToastComponent {
  public toastService = inject(ToastService);
}