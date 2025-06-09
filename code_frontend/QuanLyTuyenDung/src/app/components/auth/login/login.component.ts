import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-box">
        <h2>Đăng nhập</h2>
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="loginRequest.email"
              required
              email
              #email="ngModel"
              class="form-control"
              [class.is-invalid]="email.invalid && email.touched"
            >
            <div class="invalid-feedback" *ngIf="email.invalid && email.touched">
              Vui lòng nhập email hợp lệ
            </div>
          </div>

          <div class="form-group">
            <label for="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="loginRequest.password"
              required
              minlength="6"
              #password="ngModel"
              class="form-control"
              [class.is-invalid]="password.invalid && password.touched"
            >
            <div class="invalid-feedback" *ngIf="password.invalid && password.touched">
              Mật khẩu phải có ít nhất 6 ký tự
            </div>
          </div>

          <div class="form-group">
            <button
              type="submit"
              class="btn btn-primary w-100"
              [disabled]="loginForm.invalid || isLoading"
            >
              {{ isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
            </button>
          </div>

          <div class="alert alert-danger" *ngIf="error">
            {{ error }}
          </div>

          <div class="text-center mt-3">
            Chưa có tài khoản?<a routerLink="/register"> Đăng ký ngay</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .login-box {
      width: 100%;
      max-width: 400px;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    h2 {
      text-align: center;
      margin-bottom: 2rem;
      color: #333;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #495057;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      transition: border-color 0.15s ease-in-out;
    }

    .form-control:focus {
      border-color: #80bdff;
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
    }

    .is-invalid {
      border-color: #dc3545;
    }

    .invalid-feedback {
      display: block;
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .btn-primary {
      background-color: #007bff;
      border-color: #007bff;
      color: white;
      padding: 0.75rem;
      font-size: 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.15s ease-in-out;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0069d9;
      border-color: #0062cc;
    }

    .btn-primary:disabled {
      background-color: #6c757d;
      border-color: #6c757d;
      cursor: not-allowed;
    }

    .alert {
      padding: 0.75rem 1.25rem;
      margin-bottom: 1rem;
      border: 1px solid transparent;
      border-radius: 4px;
    }

    .alert-danger {
      color: #721c24;
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }

    a {
      color: #007bff;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  loginRequest: LoginRequest = {
    email: '',
    password: ''
  };

  isLoading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.error = null;

    this.authService.login(this.loginRequest).subscribe({
      next: (response: any) => {
        if (response.role === 'Admin') {
          this.router.navigate(['/admin']);
        } else if (response.role === 'HR') {
          this.router.navigate(['/hr']);
        } else {
          this.router.navigate(['/user/dashboard']);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
        this.isLoading = false;
      }
    });
  }
} 