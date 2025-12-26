import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { RouterLink, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { finalize } from 'rxjs/operators';
import { ToastService } from '../services/toast.service'; // Import

@Component({
  selector: 'app-register',
  standalone: true, 
  imports: [
    ReactiveFormsModule, 
    CommonModule, 
    RouterLink,
    TranslateModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  public translate = inject(TranslateService);
  private toastService = inject(ToastService); // Inject

  registerForm!: FormGroup; 
  loading: boolean = false;
  submitted: boolean = false;
  currentLang: string = 'tr';

  ngOnInit(): void {
    const savedLang = localStorage.getItem('app-language') || 'tr';
    this.translate.use(savedLang);
    this.currentLang = savedLang;

    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  switchLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLang = lang;
    localStorage.setItem('app-language', lang);
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (!password || !confirmPassword) return null;
    return password.value !== confirmPassword.value ? { matching: true } : null;
  }

  get f(): { [key: string]: AbstractControl } { 
    return this.registerForm.controls; 
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.registerForm.invalid) return;

    this.loading = true;
    
    this.authService.register(this.registerForm.value).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.translate.get('REGISTER.SUCCESS').subscribe((text: string) => {
          this.toastService.show(text, 'success'); // Toast
        });
        this.router.navigate(['/notes']);
      },
      error: (err) => {
        console.error(err);
        this.translate.get('REGISTER.ERRORS.REGISTRATION_FAILED').subscribe((text: string) => {
          const errorMessage = err.error?.message || text;
          this.toastService.show(errorMessage, 'error'); // Toast
        });
      }
    });
  }
}