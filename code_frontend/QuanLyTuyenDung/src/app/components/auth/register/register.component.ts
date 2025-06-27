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
          <!-- Step 1: Basic Information -->
          <div *ngIf="currentStep === 1">
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
              <label>Vai trò</label>
              <div class="role-options">
                <div class="role-option" [class.selected]="registerRequest.role === 'USER'" (click)="selectRole('USER')">
                  <i class="bi bi-person"></i>
                  <span>Người tìm việc</span>
                </div>
                <div class="role-option" [class.selected]="registerRequest.role === 'HR'" (click)="selectRole('HR')">
                  <i class="bi bi-building"></i>
                  <span>Nhà tuyển dụng</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <button
                type="button"
                class="btn btn-primary w-100"
                [disabled]="!canProceed()"
                (click)="nextStep()"
              >
                {{ registerRequest.role === 'HR' ? 'Tiếp theo' : 'Đăng ký' }}
              </button>
            </div>
          </div>

          <!-- Step 2: Company Information (for HR only) -->
          <div *ngIf="currentStep === 2">
            <h3 class="mb-4">Thông tin công ty</h3>
            
            <div class="form-group">
              <label for="companyName">Tên công ty</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                [(ngModel)]="registerRequest.company!.name"
                required
                #companyName="ngModel"
                class="form-control"
                [class.is-invalid]="companyName.invalid && companyName.touched"
              >
              <div class="invalid-feedback" *ngIf="companyName.invalid && companyName.touched">
                Vui lòng nhập tên công ty
              </div>
            </div>

            <div class="form-group">
              <label for="industry">Lĩnh vực</label>
              <select
                id="industry"
                name="industry"
                [(ngModel)]="registerRequest.company!.industry"
                required
                #industry="ngModel"
                class="form-control"
                [class.is-invalid]="industry.invalid && industry.touched"
              >
                <option value="">Chọn lĩnh vực</option>
                <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                <option value="Tài chính - Ngân hàng">Tài chính - Ngân hàng</option>
                <option value="Y tế - Dược phẩm">Y tế - Dược phẩm</option>
                <option value="Giáo dục - Đào tạo">Giáo dục - Đào tạo</option>
                <option value="Sản xuất">Sản xuất</option>
                <option value="Bán lẻ">Bán lẻ</option>
                <option value="Du lịch - Nhà hàng">Du lịch - Nhà hàng</option>
              </select>
              <div class="invalid-feedback" *ngIf="industry.invalid && industry.touched">
                Vui lòng chọn lĩnh vực
              </div>
            </div>

            <div class="form-group">
              <label for="location">Địa điểm</label>
              <input
                type="text"
                id="location"
                name="location"
                [(ngModel)]="registerRequest.company!.location"
                required
                #location="ngModel"
                class="form-control"
                [class.is-invalid]="location.invalid && location.touched"
              >
              <div class="invalid-feedback" *ngIf="location.invalid && location.touched">
                Vui lòng nhập địa điểm
              </div>
            </div>

            <div class="form-group">
              <label for="size">Quy mô công ty</label>
              <select
                id="size"
                name="size"
                [(ngModel)]="registerRequest.company!.size"
                required
                #size="ngModel"
                class="form-control"
                [class.is-invalid]="size.invalid && size.touched"
              >
                <option value="">Chọn quy mô</option>
                <option value="Startup">Startup (1-50 nhân viên)</option>
                <option value="SME">SME (51-200 nhân viên)</option>
                <option value="Enterprise">Enterprise (200+ nhân viên)</option>
              </select>
              <div class="invalid-feedback" *ngIf="size.invalid && size.touched">
                Vui lòng chọn quy mô công ty
              </div>
            </div>

            <div class="form-group">
              <label for="website">Website công ty (không bắt buộc)</label>
              <input
                type="url"
                id="website"
                name="website"
                [(ngModel)]="registerRequest.company!.website"
                #website="ngModel"
                class="form-control"
                placeholder="https://..."
              >
            </div>

            <div class="form-group">
              <label for="description">Mô tả công ty</label>
              <textarea
                id="description"
                name="description"
                [(ngModel)]="registerRequest.company!.description"
                required
                #description="ngModel"
                class="form-control"
                rows="4"
                [class.is-invalid]="description.invalid && description.touched"
              ></textarea>
              <div class="invalid-feedback" *ngIf="description.invalid && description.touched">
                Vui lòng nhập mô tả công ty
              </div>
            </div>

            <div class="form-group d-flex gap-3">
              <button
                type="button"
                class="btn btn-secondary flex-1"
                (click)="previousStep()"
              >
                Quay lại
              </button>
              <button
                type="submit"
                class="btn btn-primary flex-1"
                [disabled]="isLoading || !canSubmit()"
              >
                {{ isLoading ? 'Đang đăng ký...' : 'Đăng ký' }}
              </button>
            </div>
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

    h3 {
      color: #333;
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #495057;
      font-weight: 500;
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

    .role-options {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .role-option {
      flex: 1;
      padding: 1rem;
      border: 2px solid #ced4da;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .role-option:hover {
      border-color: #80bdff;
      background-color: #f8f9fa;
    }

    .role-option.selected {
      border-color: #007bff;
      background-color: #e7f1ff;
    }

    .role-option i {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: #495057;
    }

    .role-option.selected i {
      color: #007bff;
    }

    .role-option span {
      display: block;
      font-weight: 500;
    }

    .btn {
      padding: 0.75rem;
      font-size: 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      font-weight: 500;
    }

    .btn-primary {
      background-color: #007bff;
      border-color: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0069d9;
      border-color: #0062cc;
    }

    .btn-primary:disabled {
      background-color: #6c757d;
      border-color: #6c757d;
      cursor: not-allowed;
      opacity: 0.65;
    }

    .btn-secondary {
      background-color: #6c757d;
      border-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #5a6268;
      border-color: #545b62;
    }

    .d-flex {
      display: flex;
    }

    .gap-3 {
      gap: 1rem;
    }

    .flex-1 {
      flex: 1;
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
  currentStep = 1;
  registerRequest: RegisterRequest = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'USER',
    company: undefined
  };

  isLoading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  selectRole(role: 'USER' | 'HR'): void {
    this.registerRequest.role = role;
    if (role === 'HR' && !this.registerRequest.company) {
      this.registerRequest.company = {
        name: '',
        description: '',
        industry: '',
        location: '',
        website: '',
        size: ''
      };
    } else if (role === 'USER') {
      this.registerRequest.company = undefined;
    }
  }

  canProceed(): boolean {
    const basicFieldsValid = !!(
      this.registerRequest.firstName &&
      this.registerRequest.lastName &&
      this.registerRequest.email &&
      this.registerRequest.password &&
      this.registerRequest.password.length >= 6 &&
      this.registerRequest.role
    );

    if (this.registerRequest.role === 'USER') {
      return basicFieldsValid;
    }

    return basicFieldsValid;
  }

  canSubmit(): boolean {
    if (!this.registerRequest.company) return false;

    return !!(
      this.registerRequest.company.name &&
      this.registerRequest.company.description &&
      this.registerRequest.company.industry &&
      this.registerRequest.company.location &&
      this.registerRequest.company.size
    );
  }

  nextStep(): void {
    if (this.registerRequest.role === 'USER') {
      this.onSubmit();
    } else {
      this.currentStep = 2;
    }
  }

  previousStep(): void {
    this.currentStep = 1;
  }

  onSubmit(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.error = null;

    // Validate password
    if (this.registerRequest.password.length < 6) {
      this.error = 'Mật khẩu phải có ít nhất 6 ký tự';
      this.isLoading = false;
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerRequest.email)) {
      this.error = 'Email không hợp lệ';
      this.isLoading = false;
      return;
    }

    // Validate phone number if provided
    if (this.registerRequest.phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(this.registerRequest.phone)) {
        this.error = 'Số điện thoại không hợp lệ (phải có 10 chữ số)';
        this.isLoading = false;
        return;
      }
    }

    console.log('Sending register request:', this.registerRequest);

    this.authService.register(this.registerRequest).subscribe({
      next: (response) => {
        console.log('Register response:', response);
        // Chuyển hướng đến trang mặc định dựa vào role
        this.router.navigate([this.authService.getDefaultRoute()]);
      },
      error: (err) => {
        console.error('Register error:', err);
        if (err.status === 400) {
          // Bad Request - Validation errors
          this.error = err.error?.message || 'Dữ liệu không hợp lệ';
        } else if (err.status === 409) {
          // Conflict - Email already exists
          this.error = 'Email đã được sử dụng';
        } else if (err.status === 500) {
          // Server error
          this.error = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
        } else {
          // Other errors
          this.error = 'Đăng ký thất bại. Vui lòng thử lại.';
        }
        this.isLoading = false;
      }
    });
  }
} 