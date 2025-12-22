// src/app/register/register.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true, 
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  registerForm!: FormGroup; 
  loading: boolean = false;
  submitted: boolean = false;

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (!password || !confirmPassword) return null;
    return password.value !== confirmPassword.value ? { matching: true } : null;
  }

  get f(): { [key: string]: AbstractControl } { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    if (this.registerForm.invalid) return;

    this.loading = true;
    
    this.authService.register(this.registerForm.value).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        // The user is now logged in automatically! Navigate them to the notes page.
        alert('Registration successful! Welcome.');
        this.router.navigate(['/notes']);
      },
      error: (err) => {
        console.error(err);
        const errorMessage = err.error?.message || 'Registration failed. The email or username may already be in use.';
        alert(errorMessage);
      }
    });
  }
}