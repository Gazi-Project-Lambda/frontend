import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true, 
  imports: [
      ReactiveFormsModule, 
      CommonModule,
      RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup; 
  loading: boolean = false;
  submitted: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), this.passwordStrengthValidator]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Şifre güçlülük validatörü
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    
    if (!password) {
      return null;
    }

    const errors: ValidationErrors = {};

    // En az 6 karakter kontrolü
    if (password.length < 6) {
      errors['minlength'] = true;
    }

    // En az 1 büyük harf kontrolü
    if (!/[A-Z]/.test(password)) {
      errors['noUppercase'] = true;
    }

    // En az 1 şekil karakter kontrolü (nokta, virgül, vs.)
    if (!/[.,;:!?@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors['noSpecialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ matching: true });
      return { matching: true };
    } else {
      if (confirmPassword.hasError('matching')) {
        confirmPassword.setErrors(null);
      }
      return null;
    }
  }

  get f(): { [key: string]: AbstractControl } { 
    return this.registerForm.controls; 
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    
    // Simulate Registration API Call
    setTimeout(() => {
      console.log('Registration Data:', this.registerForm.value);
      this.loading = false;
      // Redirect to login after successful registration
      this.router.navigate(['/login']);
    }, 1500);
  }
}