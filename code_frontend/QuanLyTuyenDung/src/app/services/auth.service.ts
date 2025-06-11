import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/Users`;
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

  public get currentUserValue(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => {
          localStorage.setItem('currentUser', JSON.stringify(response));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response);
        })
      );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request)
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