import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService, Company } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-hr-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <div class="header-section">
        <h2>Hồ sơ công ty</h2>
        <button 
          type="button" 
          class="btn btn-outline-primary" 
          (click)="toggleEditMode()"
          *ngIf="company && !isLoading">
          {{ isEditMode ? 'Hủy chỉnh sửa' : 'Chỉnh sửa thông tin' }}
        </button>
      </div>
      
      <!-- Error Message -->
      <div class="alert alert-danger" *ngIf="error">
        {{ error }}
      </div>

      <!-- Success Message -->
      <div class="alert alert-success" *ngIf="successMessage">
        {{ successMessage }}
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="isLoading" class="text-center my-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
      </div>



      <!-- Company Information Display -->
      <div class="company-profile" *ngIf="company && !isLoading && !isEditMode">
        <!-- Company Logo and Basic Info -->
        <div class="company-header">
          <div class="logo-section">
            <img 
               [src]="company.logo || '/topcv.png'" 
               [alt]="company.name + ' logo'" 
               class="company-logo"
               onerror="this.src='/topcv.png'"
             >
          </div>
          <div class="basic-info">
            <h3 class="company-name">{{ company.name }}</h3>
            <p class="industry">{{ company.industry }}</p>
                         <p class="location">
               <i class="bi bi-geo-alt-fill"></i>
               {{ company.location }}
             </p>
          </div>
        </div>

        <!-- Company Details Grid -->
        <div class="details-grid">
          <div class="detail-item">
            <label>Quy mô công ty</label>
            <div class="value">{{ company.size }}</div>
          </div>

          <div class="detail-item">
            <label>Website</label>
            <div class="value">
              <a 
                [href]="company.website" 
                target="_blank" 
                rel="noopener noreferrer"
                *ngIf="company.website; else noWebsite">
                                 {{ company.website }}
                 <i class="bi bi-box-arrow-up-right"></i>
              </a>
              <ng-template #noWebsite>
                <span class="text-muted">Chưa cập nhật</span>
              </ng-template>
            </div>
          </div>

          <div class="detail-item">
            <label>Ngày thành lập</label>
            <div class="value">{{ company.createdAt | date:'dd/MM/yyyy' }}</div>
          </div>

          <div class="detail-item">
            <label>Số việc làm đang tuyển</label>
            <div class="value">
              <span class="job-count">{{ company.jobCount }}</span> vị trí
            </div>
          </div>

          <div class="detail-item">
            <label>Thời gian làm việc</label>
            <div class="value">
              {{ company.workingDays || 'Chưa cập nhật' }}<br>
              <small class="text-muted">{{ company.workingHours || 'Chưa cập nhật' }}</small>
            </div>
          </div>

          <div class="detail-item">
            <label>Chính sách OT</label>
            <div class="value">{{ company.overtimePolicy || 'Chưa cập nhật' }}</div>
          </div>
        </div>

        <!-- Company Description -->
        <div class="description-section">
          <label>Mô tả công ty</label>
          <div class="description-text">{{ company.description }}</div>
        </div>

        <!-- Benefits Section -->
        <div class="benefits-section" *ngIf="company.benefits && company.benefits.length > 0">
          <label>Phúc lợi</label>
          <div class="benefits-list">
            <span 
              class="benefit-tag" 
              *ngFor="let benefit of company.benefits">
              {{ benefit }}
            </span>
          </div>
        </div>
      </div>

      <!-- Edit Form (when in edit mode) -->
      <form (ngSubmit)="onSubmit()" #settingsForm="ngForm" *ngIf="company && !isLoading && isEditMode">
        <div class="form-group">
          <label for="name">Tên công ty *</label>
          <input
            type="text"
            id="name"
            name="name"
            [(ngModel)]="company.name"
            required
            class="form-control"
            [class.is-invalid]="nameInput.invalid && (nameInput.dirty || nameInput.touched)"
            #nameInput="ngModel"
          >
          <div class="invalid-feedback" *ngIf="nameInput.invalid && (nameInput.dirty || nameInput.touched)">
            Vui lòng nhập tên công ty
          </div>
        </div>

        <div class="form-group">
          <label for="industry">Ngành nghề *</label>
          <input
            type="text"
            id="industry"
            name="industry"
            [(ngModel)]="company.industry"
            required
            class="form-control"
            [class.is-invalid]="industryInput.invalid && (industryInput.dirty || industryInput.touched)"
            #industryInput="ngModel"
          >
          <div class="invalid-feedback" *ngIf="industryInput.invalid && (industryInput.dirty || industryInput.touched)">
            Vui lòng nhập ngành nghề
          </div>
        </div>

        <div class="form-group">
          <label for="size">Quy mô *</label>
          <select
            id="size"
            name="size"
            [(ngModel)]="company.size"
            required
            class="form-control"
            [class.is-invalid]="sizeInput.invalid && (sizeInput.dirty || sizeInput.touched)"
            #sizeInput="ngModel"
          >
            <option value="">Chọn quy mô công ty</option>
            <option value="1-10">1-10 nhân viên</option>
            <option value="11-50">11-50 nhân viên</option>
            <option value="51-200">51-200 nhân viên</option>
            <option value="201-500">201-500 nhân viên</option>
            <option value="501-1000">501-1000 nhân viên</option>
            <option value="1000+">Trên 1000 nhân viên</option>
          </select>
          <div class="invalid-feedback" *ngIf="sizeInput.invalid && (sizeInput.dirty || sizeInput.touched)">
            Vui lòng chọn quy mô công ty
          </div>
        </div>

        <div class="form-group">
          <label for="location">Địa điểm *</label>
          <input
            type="text"
            id="location"
            name="location"
            [(ngModel)]="company.location"
            required
            class="form-control"
            [class.is-invalid]="locationInput.invalid && (locationInput.dirty || locationInput.touched)"
            #locationInput="ngModel"
          >
          <div class="invalid-feedback" *ngIf="locationInput.invalid && (locationInput.dirty || locationInput.touched)">
            Vui lòng nhập địa điểm
          </div>
        </div>

        <div class="form-group">
          <label for="website">Website công ty</label>
          <input
            type="url"
            id="website"
            name="website"
            [(ngModel)]="company.website"
            class="form-control"
            placeholder="https://"
            pattern="https?://.+"
            [class.is-invalid]="websiteInput.invalid && (websiteInput.dirty || websiteInput.touched)"
            #websiteInput="ngModel"
          >
          <div class="invalid-feedback" *ngIf="websiteInput.invalid && (websiteInput.dirty || websiteInput.touched)">
            Vui lòng nhập đúng định dạng URL (bắt đầu bằng http:// hoặc https://)
          </div>
        </div>

        <div class="form-group">
          <label for="description">Mô tả công ty *</label>
          <textarea
            id="description"
            name="description"
            [(ngModel)]="company.description"
            required
            class="form-control"
            rows="4"
            [class.is-invalid]="descriptionInput.invalid && (descriptionInput.dirty || descriptionInput.touched)"
            #descriptionInput="ngModel"
          ></textarea>
          <div class="invalid-feedback" *ngIf="descriptionInput.invalid && (descriptionInput.dirty || descriptionInput.touched)">
            Vui lòng nhập mô tả công ty
          </div>
        </div>

        <div class="form-group">
          <label>Logo công ty</label>
          <div class="logo-preview mb-2" *ngIf="company.logo">
            <img [src]="company.logo" alt="Company logo" class="img-thumbnail" style="max-height: 100px;">
          </div>
          <div class="logo-upload">
            <input
              type="file"
              (change)="onFileSelected($event)"
              accept="image/png,image/jpeg"
              class="form-control"
              #fileInput
            >
            <small class="text-muted">Định dạng hỗ trợ: PNG, JPG. Kích thước tối đa: 2MB</small>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="!settingsForm.form.valid || isLoading">
            {{ isLoading ? 'Đang lưu...' : 'Lưu thông tin' }}
          </button>
          <button type="button" class="btn btn-secondary ml-2" (click)="cancelEdit()">
            Hủy
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f0f0f0;
    }

    .header-section h2 {
      margin: 0;
      color: #333;
      font-size: 1.8rem;
      font-weight: 600;
    }

    /* Company Profile Display Styles */
    .company-profile {
      margin-top: 1rem;
    }

    .company-header {
      display: flex;
      align-items: flex-start;
      gap: 2rem;
      margin-bottom: 2.5rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      border: 1px solid #dee2e6;
    }

    .logo-section {
      flex-shrink: 0;
    }

    .company-logo {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 12px;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .basic-info {
      flex: 1;
    }

    .company-name {
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 0.5rem 0;
    }

    .industry {
      font-size: 1.1rem;
      color: #6c757d;
      margin: 0 0 0.5rem 0;
      font-weight: 500;
    }

    .location {
      font-size: 1rem;
      color: #495057;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .location i {
      color: #dc3545;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .detail-item {
      padding: 1.25rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #007bff;
    }

    .detail-item label {
      display: block;
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-item .value {
      font-size: 1rem;
      color: #2c3e50;
      font-weight: 500;
    }

    .detail-item .value a {
      color: #007bff;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .detail-item .value a:hover {
      text-decoration: underline;
    }

    .job-count {
      font-size: 1.2rem;
      font-weight: 700;
      color: #28a745;
    }

    .description-section,
    .benefits-section {
      margin-bottom: 2rem;
    }

    .description-section label,
    .benefits-section label {
      display: block;
      font-weight: 600;
      color: #495057;
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }

    .description-text {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #17a2b8;
      line-height: 1.6;
      color: #495057;
    }

    .benefits-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .benefit-tag {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
    }

    /* Form Styles (Edit Mode) */
    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 600;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .form-control.is-invalid {
      border-color: #dc3545;
    }

    .invalid-feedback {
      display: block;
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-primary {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }

    .btn-outline-primary {
      background: transparent;
      color: #007bff;
      border: 2px solid #007bff;
    }

    .btn-outline-primary:hover {
      background: #007bff;
      color: white;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .alert {
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .alert-danger {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .alert-success {
      background: #d1eddd;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .alert-info {
      background: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    .spinner-border {
      width: 3rem;
      height: 3rem;
    }

    .text-center {
      text-align: center;
    }

    .text-muted {
      color: #6c757d !important;
    }

    .ml-2 {
      margin-left: 0.5rem;
    }

    pre {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      font-size: 0.8rem;
      overflow-x: auto;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .settings-container {
        margin: 1rem;
        padding: 1rem;
      }

      .header-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .company-header {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .company-logo {
        width: 100px;
        height: 100px;
      }

      .company-name {
        font-size: 1.5rem;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }

      .benefits-list {
        justify-content: center;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class HRSettingsComponent implements OnInit {
  company: Company | null = null;
  originalCompany: Company | null = null; // Store original data for cancel functionality
  error: string | null = null;
  successMessage: string | null = null;
  isLoading = false;
  isEditMode = false;
  selectedFile: File | null = null;

  constructor(
    private companyService: CompanyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCompanyData();
  }



  loadCompanyData(): void {
    this.isLoading = true;
    this.error = null;
    
    console.log('Loading company data...');
    
    this.companyService.getCurrentUserCompany().subscribe({
      next: (company) => {
        console.log('Company data loaded successfully:', company);
        this.company = company;
        this.originalCompany = { ...company }; // Store original data
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading company data:', error);
        this.error = error.message || 'Không thể tải thông tin công ty';
        this.isLoading = false;
      }
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode && this.originalCompany) {
      // Reset to original data when entering edit mode
      this.company = { ...this.originalCompany };
    }
  }

  cancelEdit(): void {
    if (this.originalCompany) {
      this.company = { ...this.originalCompany };
    }
    this.isEditMode = false;
    this.selectedFile = null;
    this.clearMessages();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/image\/(png|jpeg)/)) {
        this.error = 'Vui lòng chọn file PNG hoặc JPG';
        return;
      }
      
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.error = 'Kích thước file không được vượt quá 2MB';
        return;
      }
      
      this.selectedFile = file;
      this.error = null;
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (this.company) {
          this.company.logo = e.target?.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (!this.company) {
      this.error = 'Không có dữ liệu công ty để cập nhật';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    const updateData = {
      name: this.company.name,
      industry: this.company.industry,
      size: this.company.size,
      location: this.company.location,
      website: this.company.website,
      description: this.company.description,
      ...(this.selectedFile && { logo: this.selectedFile })
    };

    // For now, just simulate a successful update with mock data
    setTimeout(() => {
      this.successMessage = 'Thông tin công ty đã được cập nhật thành công!';
      this.originalCompany = { ...this.company! }; // Update original data
      this.isEditMode = false;
      this.isLoading = false;
      this.selectedFile = null;
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        this.successMessage = null;
      }, 3000);
    }, 1000);
  }

  private clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }
}