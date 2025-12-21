import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface AuthResponse {
  authToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  
  private loginUrl = 'api/login'; 
  private registerUrl = 'api/users';

  register(user: any): Observable<any> {
    return this.http.post(this.registerUrl, user);
  }

  login(credentials: any): Observable<AuthResponse> {
    console.log('🚀 AuthService: Sending login request...', credentials);
    
    return this.http.post<AuthResponse>(this.loginUrl, credentials).pipe(
      tap(response => {
        console.log('✅ AuthService: Received response:', response);
        if(response.authToken) {
          localStorage.setItem('access_token', response.authToken);
          localStorage.setItem('refresh_token', response.refreshToken);
        }
      }),
      catchError(error => {
        console.error('🔥 AuthService: Error:', error);
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