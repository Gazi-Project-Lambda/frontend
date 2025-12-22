import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// A single, consistent interface for both login and register responses
interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  
  // Use local proxy paths for development to avoid CORS issues.
  // The proxy will forward these to https://notes-fwm8.onrender.com
  private baseUrl = '/api/Auth'; 
  private loginUrl = `${this.baseUrl}/login`; 
  private registerUrl = `${this.baseUrl}/register`;

  register(user: any): Observable<AuthResponse> {
    const { confirmPassword, ...registerPayload } = user;
    console.log('🚀 AuthService: Sending register request...', registerPayload);

    return this.http.post<AuthResponse>(this.registerUrl, registerPayload).pipe(
      tap(response => {
        console.log('✅ AuthService: Registration successful:', response);
        if (response.token) {
          localStorage.setItem('access_token', response.token);
        }
      }),
      catchError(error => {
        console.error('🔥 AuthService: Registration Error:', error);
        return throwError(() => error);
      })
    );
  }

  login(credentials: any): Observable<AuthResponse> {
    console.log('🚀 AuthService: Sending login request...', credentials);
    
    return this.http.post<AuthResponse>(this.loginUrl, credentials).pipe(
      tap(response => {
        console.log('✅ AuthService: Received login response:', response);
        // CHANGE: Check for 'token' instead of 'authToken'
        if(response.token) {
          // CHANGE: Use response.token to set the item
          localStorage.setItem('access_token', response.token);
          // The API doesn't send a refresh token on login, so we remove it.
        }
      }),
      catchError(error => {
        console.error('🔥 AuthService: Login Error:', error);
        return throwError(() => error);
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
}