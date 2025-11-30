import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [
      ReactiveFormsModule, 
      CommonModule        
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup; 
  loading: boolean = false;
  submitted: boolean = false;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
  
    this.loginForm = this.formBuilder.group({
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
   
  }
}