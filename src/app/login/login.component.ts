import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm!: FormGroup; 
  loading: boolean = false;
  submitted: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    // Note: Use 'email' here because your HTML input likely uses formControlName="username" or "email"
    // Let's align with the HTML provided earlier which had formControlName="username"
    this.loginForm = this.formBuilder.group({
      // Mapping the UI "username" field to the "email" logic expected by backend
      username: ['', Validators.required], 
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f(): { [key: string]: AbstractControl } { 
    return this.loginForm.controls; 
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';

    // Create the credentials object. 
    // The mock service expects 'email' or 'username'.
    const credentials = {
      email: this.loginForm.value.username, // Send the input as email
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/notes']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Hatalı Kullanıcı Adı veya Şifre.';
        console.error('Login Component Error:', error);
      }
    });
  }
}