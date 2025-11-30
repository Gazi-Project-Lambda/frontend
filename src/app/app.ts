
import { Component } from '@angular/core';
import { LoginComponent } from './login/login.component'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
       
      LoginComponent 
  ],
  template: `
    <app-login></app-login> 
  `,
  styleUrl: './app.css' 
})
export class App {
  title = 'angular-login';
}