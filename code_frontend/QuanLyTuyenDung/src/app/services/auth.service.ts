import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError, map } from 'rxjs';
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
  private memoryUser: AuthResponse | null = null;
  private memoryToken: string | null = null;
  private storageAvailable = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkStorageAvailability();
    this.loadUserFromStorage();
  }

  private checkStorageAvailability(): void {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      this.storageAvailable = true;
      console.log('localStorage is available');
    } catch (e) {
      this.storageAvailable = false;
      console.warn('localStorage is not available, falling back to memory storage');
    }
  }

  private loadUserFromStorage(): void {
    if (this.storageAvailable) {
      try {
        const userStr = localStorage.getItem('currentUser');
        const token = localStorage.getItem('token');
        
        if (userStr && token) {
          const user = JSON.parse(userStr);
          this.memoryUser = user;
          this.memoryToken = token;
          this.currentUserSubject.next(user);
          console.log('User loaded from storage:', { email: user.email, role: user.role });
        }
      } catch (e) {
        console.error('Error loading user from storage:', e);
        this.clearUserFromStorage();
      }
    }
  }

  get currentUserValue(): AuthResponse | null {
    return this.currentUserSubject.value || this.memoryUser;
  }

  private normalizeResponse(response: any): AuthResponse {
    console.log('=== NORMALIZING RESPONSE ===');
    console.log('Raw response:', response);
    console.log('Response type:', typeof response);
    console.log('Response keys:', Object.keys(response));

    // Handle both lowercase and uppercase property names
    const normalized = {
      id: response.id || response.Id || 0,
      email: response.email || response.Email || '',
      fullName: response.fullName || response.FullName || '',
      role: (response.role || response.Role || 'USER').toUpperCase(),
      token: response.token || response.Token || '',
      companyId: response.companyId || response.CompanyId,
      createdAt: response.createdAt || response.CreatedAt,
      isAuthenticated: true,
      isAdmin: ((response.role || response.Role || '').toUpperCase() === 'ADMIN'),
      isHR: ((response.role || response.Role || '').toUpperCase() === 'HR'),
      isUser: ((response.role || response.Role || '').toUpperCase() === 'USER'),
      userRole: (response.role || response.Role || 'USER').toUpperCase()
    };

    console.log('Normalized response:', normalized);
    return normalized;
  }

  private saveUserToStorage(user: AuthResponse): void {
    if (!user || !user.token) {
      console.error('Invalid user data or missing token');
      return;
    }

    // Always save in memory
    this.memoryUser = user;
    this.memoryToken = user.token;
    this.currentUserSubject.next(user);

    // Try to save in localStorage if available
    if (this.storageAvailable) {
      try {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('token', user.token);
        console.log('User saved to storage:', { email: user.email, role: user.role });
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
  }

  private clearUserFromStorage(): void {
    this.memoryUser = null;
    this.memoryToken = null;
    this.currentUserSubject.next(null);

    if (this.storageAvailable) {
      try {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      } catch (e) {
        console.error('Error clearing storage:', e);
      }
    }
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    console.log('=== LOGIN DEBUG ===');
    console.log('1. Login request:', { email: loginRequest.email, passwordLength: loginRequest.password.length });

    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http.post<any>(`${this.apiUrl}/login`, loginRequest, { headers }).pipe(
      tap(response => {
        console.log('2. Raw server response:', response);
        console.log('3. Response type:', typeof response);
        console.log('4. Response keys:', Object.keys(response));
      }),
      map(response => {
        console.log('5. Processing response...');
        
        if (!response) {
          console.error('6. Empty response from server');
          throw new Error('Empty response from server');
        }

        const normalizedResponse = this.normalizeResponse(response);
        console.log('7. Normalized response:', normalizedResponse);

        if (!normalizedResponse.token) {
          console.error('8. No token found in normalized response');
          throw new Error('No token in response');
        }

        console.log('9. Saving user to storage...');
        this.saveUserToStorage(normalizedResponse);
        
        console.log('10. Login successful');
        return normalizedResponse;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });

        if (error.status === 0) {
          return throwError(() => new Error('Không thể kết nối đến máy chủ'));
        }
        
        if (error.status === 401) {
          return throwError(() => new Error('Email hoặc mật khẩu không đúng'));
        }

        return throwError(() => error);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/register`, request).pipe(
      map(response => {
        const normalizedResponse = this.normalizeResponse(response);
        if (normalizedResponse.token) {
          this.saveUserToStorage(normalizedResponse);
        }
        return normalizedResponse;
      }),
      catchError(error => {
        console.error('Register error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.clearUserFromStorage();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const token = this.memoryToken || (this.storageAvailable ? localStorage.getItem('token') : null);
    console.log('Getting token:', { hasToken: !!token });
    return token;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.currentUserValue;
    const isAuth = !!token && !!user;
    console.log('Authentication check:', { 
      hasToken: !!token, 
      hasUser: !!user,
      userRole: user?.role,
      isAuth 
    });
    return isAuth;
  }

  isAdmin(): boolean {
    const user = this.currentUserValue;
    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
    console.log('Admin check:', { role: user?.role, isAdmin });
    return isAdmin;
  }

  isHR(): boolean {
    const user = this.currentUserValue;
    const isHR = user?.role?.toUpperCase() === 'HR';
    console.log('HR check:', { role: user?.role, isHR });
    return isHR;
  }

  isUser(): boolean {
    const user = this.currentUserValue;
    const isUser = user?.role?.toUpperCase() === 'USER';
    console.log('User check:', { role: user?.role, isUser });
    return isUser;
  }

  getDefaultRoute(): string {
    const user = this.currentUserValue;
    if (!user) {
      console.log('No user found, returning to login');
      return '/login';
    }

    const role = user.role?.toUpperCase();
    console.log('Getting default route for role:', role);
    
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'HR':
        return '/hr/dashboard';
      case 'USER':
      default:
        return '/user/dashboard';
    }
  }
} 