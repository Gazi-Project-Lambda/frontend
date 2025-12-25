import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [
    ReactiveFormsModule, 
    CommonModule, 
    RouterLink,
    TranslateModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  public translate = inject(TranslateService);

  loginForm!: FormGroup; 
  loading: boolean = false;
  submitted: boolean = false;
  errorMessage: string = '';
  currentLang: string = 'tr';  // Dil için değişken ekledik

  ngOnInit(): void {
    // Mevcut dili al
    const savedLang = localStorage.getItem('app-language') || 'tr';
    this.translate.use(savedLang);
    this.currentLang = savedLang;

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]], 
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Dil değiştirme fonksiyonu
  switchLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLang = lang;
    localStorage.setItem('app-language', lang);
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

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.router.navigate(['/notes']);
      },
      error: (error) => {
        this.translate.get('LOGIN.ERRORS.INVALID_CREDENTIALS').subscribe((text: string) => {
          this.errorMessage = typeof error.error === 'string' 
            ? error.error 
            : text;
        });
        console.error('Login Component Error:', error);
      }
    });
  }
}