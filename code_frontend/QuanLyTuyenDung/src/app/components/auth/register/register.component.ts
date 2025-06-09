import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest } from '../../../models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-box">
        <h2>Đăng ký tài khoản</h2>
        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="firstName">Họ</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  [(ngModel)]="registerRequest.firstName"
                  required
                  #firstName="ngModel"
                  class="form-control"
                  [class.is-invalid]="firstName.invalid && firstName.touched"
                >
                <div class="invalid-feedback" *ngIf="firstName.invalid && firstName.touched">
                  Vui lòng nhập họ
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="lastName">Tên</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  [(ngModel)]="registerRequest.lastName"
                  required
                  #lastName="ngModel"
                  class="form-control"
                  [class.is-invalid]="lastName.invalid && lastName.touched"
                >
                <div class="invalid-feedback" *ngIf="lastName.invalid && lastName.touched">
                  Vui lòng nhập tên
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="registerRequest.email"
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
            <label for="phone">Số điện thoại</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              [(ngModel)]="registerRequest.phone"
              pattern="[0-9]{10}"
              #phone="ngModel"
              class="form-control"
              [class.is-invalid]="phone.invalid && phone.touched"
            >
            <div class="invalid-feedback" *ngIf="phone.invalid && phone.touched">
              Vui lòng nhập số điện thoại hợp lệ (10 số)
            </div>
          </div>

          <div class="form-group">
            <label for="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="registerRequest.password"
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
              [disabled]="registerForm.invalid || isLoading"
            >
              {{ isLoading ? 'Đang đăng ký...' : 'Đăng ký' }}
            </button>
          </div>

          <div class="alert alert-danger" *ngIf="error">
            {{ error }}
          </div>

          <div class="text-center mt-3">
            Đã có tài khoản?<a routerLink="/login"> Đăng nhập ngay</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
      padding: 2rem 0;
    }

    .register-box {
      width: 100%;
      max-width: 600px;
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

    @media (max-width: 768px) {
      .register-box {
        margin: 1rem;
      }
    }
  `]
})
export class RegisterComponent {
  registerRequest: RegisterRequest = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
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

    this.authService.register(this.registerRequest).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        this.isLoading = false;
      }
    });
  }
} 