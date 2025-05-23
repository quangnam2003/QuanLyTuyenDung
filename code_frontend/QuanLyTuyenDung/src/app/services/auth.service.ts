import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  fullName: string;
  role: string;
  token: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    let savedUser = null;
    try {
      savedUser = localStorage.getItem('currentUser');
    } catch (e) {
      // Storage access denied
    }
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('https://localhost:7029/api/Users/login', request)
      .pipe(
        tap(response => {
          try {
            localStorage.setItem('currentUser', JSON.stringify(response));
            localStorage.setItem('token', response.token);
          } catch (e) {
            // Storage access denied
          }
          this.currentUserSubject.next(response);
        })
      );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('https://localhost:7029/api/Users/register', request)
      .pipe(
        tap(response => {
          try {
            localStorage.setItem('currentUser', JSON.stringify(response));
            localStorage.setItem('token', response.token);
          } catch (e) {
            // Storage access denied
          }
          this.currentUserSubject.next(response);
        })
      );
  }

  logout(): void {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    } catch (e) {
      // Storage access denied
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value as any;
    return !!user && user.role === 'Admin';
  }

  isHR(): boolean {
    const user = this.currentUserSubject.value as any;
    return !!user && user.role === 'HR';
  }

  isRecruiter(): boolean {
    const user = this.currentUserSubject.value as any;
    return !!user && user.role === 'Recruiter';
  }

  isUser(): boolean {
    const user = this.currentUserSubject.value as any;
    return !!user && (user.role === 'User' || user.role === 'HR' || user.role === 'Recruiter');
  }
} 