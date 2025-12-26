import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
      RouterOutlet,
      ToastComponent
  ],
  template: `
    <app-toast></app-toast> <!-- Add to template -->
    <router-outlet></router-outlet> 
  `,
  styleUrl: './app.css' 
})
export class App {
  title = 'angular-login';
}