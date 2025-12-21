import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [
      ReactiveFormsModule, 
      CommonModule,
      RouterLink     
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup; 
  loading: boolean = false;
  submitted: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
  
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }


  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
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
    // Simulate Login
    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;
    setTimeout(() => {
        this.loading = false;

        if (username === 'admin' && password === '123456') {
            
            // Başarılı Giriş
            this.authService.login();
            this.router.navigate(['/notes']);
            this.errorMessage = ''; // Hata mesajını temizle

        } else {
            // Başarısız Giriş
            this.errorMessage = 'Hatalı Kullanıcı Adı veya Şifre.';
            this.loginForm.reset(); // Formu sıfırla
            this.submitted = false;
        }
        
    }, 1000);
  }
}