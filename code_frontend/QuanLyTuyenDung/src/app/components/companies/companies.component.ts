import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CompanyService, Company } from '../../services/company.service';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="companies-page">
      <!-- Header -->
      <header class="top-bar-home">
        <div class="container topbar-flex">
          <div class="logo" style="display: flex; align-items: center; gap: 15px;">
            <img src="/topcv.png" alt="logo" style="width: 60px;"/>
            <span class="brand-title">Quản Lý Tuyển Dụng</span>
          </div>
          <nav class="main-nav-home">
            <a routerLink="/" routerLinkActive="active">Trang chủ</a>
            <a routerLink="/jobs" routerLinkActive="active">Việc làm</a>
            <a routerLink="/companies" routerLinkActive="active">Công ty</a>
          </nav>
          <div class="auth-buttons">
            <a routerLink="/login" class="btn-login">Đăng nhập</a>
            <a routerLink="/register" class="btn-register">Đăng ký</a>
          </div>
        </div>
      </header>

      <!-- Search Section -->
      <section class="search-section">
        <div class="container">
          <h1>Khám phá các công ty hàng đầu</h1>
          <div class="search-container">
            <div class="search-bar">
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                (keypress)="onSearchKeyPress($event)"
                placeholder="Tìm kiếm theo tên công ty, lĩnh vực...">
              <button (click)="searchCompanies()" [disabled]="loading">
                <i class="bi bi-search" *ngIf="!loading"></i>
                <i class="bi bi-arrow-clockwise spin" *ngIf="loading"></i>
                Tìm kiếm
              </button>
            </div>
            <div class="filter-bar">
              <select [(ngModel)]="selectedIndustry" (change)="filterCompanies()">
                <option value="">Tất cả lĩnh vực</option>
                <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                <option value="Tài chính - Ngân hàng">Tài chính - Ngân hàng</option>
                <option value="Y tế - Dược phẩm">Y tế - Dược phẩm</option>
                <option value="Giáo dục - Đào tạo">Giáo dục - Đào tạo</option>
                <option value="Sản xuất">Sản xuất</option>
                <option value="Bán lẻ">Bán lẻ</option>
                <option value="Du lịch - Nhà hàng">Du lịch - Nhà hàng</option>
              </select>
              <select [(ngModel)]="selectedSize" (change)="filterCompanies()">
                <option value="">Tất cả quy mô</option>
                <option value="Startup">Startup (1-50 nhân viên)</option>
                <option value="SME">SME (51-200 nhân viên)</option>
                <option value="Enterprise">Enterprise (200+ nhân viên)</option>
              </select>
              <button (click)="clearFilters()" class="clear-btn">
                <i class="bi bi-x-circle"></i> Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Results Section -->
      <section class="results-section">
        <div class="container">
          <div class="results-header">
            <h2>
              {{ isSearching ? 'Kết quả tìm kiếm' : 'Tất cả công ty' }}
              <span class="results-count" *ngIf="!loading">
                ({{ companies.length }} công ty)
              </span>
            </h2>
            <div class="sort-options">
              <label>Sắp xếp:</label>
              <select [(ngModel)]="sortBy" (change)="sortCompanies()">
                <option value="name">Tên A-Z</option>
                <option value="newest">Mới nhất</option>
                <option value="jobCount">Số việc làm</option>
                <option value="industry">Lĩnh vực</option>
              </select>
            </div>
          </div>

          <!-- Loading -->
          <div *ngIf="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>Đang tải danh sách công ty...</p>
          </div>

          <!-- Error -->
          <div *ngIf="error" class="error">
            <i class="bi bi-exclamation-triangle"></i>
            <p>{{ error }}</p>
            <button (click)="loadCompanies()" class="retry-btn">Thử lại</button>
          </div>

          <!-- Companies Grid -->
          <div class="companies-grid" *ngIf="!loading && !error && companies.length > 0">
            <div class="company-card" *ngFor="let company of companies">
              <div class="company-header">
                <div class="company-logo">
                  <img *ngIf="company.logo" [src]="company.logo" [alt]="company.name">
                  <div *ngIf="!company.logo" class="default-logo">
                    <i class="bi bi-building"></i>
                  </div>
                </div>
                <div class="company-basic-info">
                  <h3>{{ company.name }}</h3>
                  <div class="company-industry">
                    <i class="bi bi-briefcase"></i>
                    <span>{{ company.industry }}</span>
                  </div>
                </div>
              </div>
              
              <div class="company-details">
                <div class="company-location">
                  <i class="bi bi-geo-alt"></i>
                  <span>{{ company.location }}</span>
                </div>
                <div class="company-size" *ngIf="company.size">
                  <i class="bi bi-people"></i>
                  <span>{{ company.size }}</span>
                </div>
                <div class="company-jobs" *ngIf="company.jobCount">
                  <i class="bi bi-briefcase-fill"></i>
                  <span>{{ company.jobCount }} việc làm đang tuyển</span>
                </div>
              </div>
              
              <div class="company-description" *ngIf="company.description">
                <p>{{ company.description }}</p>
              </div>
              
              <div class="company-footer">
                <div class="company-actions">
                  <button (click)="viewCompanyJobs(company)" class="jobs-btn">
                    <i class="bi bi-search"></i>
                    Xem việc làm
                  </button>
                  <button (click)="viewCompanyDetails(company)" class="details-btn">
                    <i class="bi bi-info-circle"></i>
                    Thông tin chi tiết
                  </button>
                </div>
                <div class="company-website" *ngIf="company.website">
                  <a [href]="company.website" target="_blank" class="website-link">
                    <i class="bi bi-globe"></i>
                    Website
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div *ngIf="!loading && !error && companies.length === 0" class="no-results">
            <i class="bi bi-building"></i>
            <h3>{{ isSearching ? 'Không tìm thấy công ty phù hợp' : 'Chưa có công ty nào' }}</h3>
            <p>{{ isSearching ? 'Hãy thử tìm kiếm với từ khóa khác' : 'Hiện tại chưa có công ty nào được đăng ký. Hãy quay lại sau để khám phá các công ty mới!' }}</p>
            <button (click)="clearFilters()" class="clear-all-btn" *ngIf="isSearching">
              <i class="bi bi-arrow-clockwise"></i>
              Xóa bộ lọc và tìm kiếm
            </button>
            <button (click)="loadCompanies()" class="retry-btn" *ngIf="!isSearching">
              <i class="bi bi-arrow-clockwise"></i>
              Tải lại
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {
  companies: Company[] = [];
  loading = true;
  error: string | null = null;
  searchQuery = '';
  selectedIndustry = '';
  selectedSize = '';
  sortBy = 'name';
  isSearching = false;

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loading = true;
    this.error = null;
    
    // Set timeout to avoid infinite loading
    const timeoutId = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.companies = [];
        this.error = null; // Don't show error for empty state
      }
    }, 10000); // 10 second timeout
    
    this.companyService.getAllCompanies().subscribe({
      next: (companies: any) => {
        clearTimeout(timeoutId);
        
        // Ensure companies is an array
        if (Array.isArray(companies)) {
          this.companies = companies;
        } else if (companies && Array.isArray(companies.data)) {
          this.companies = companies.data;
        } else {
          this.companies = [];
        }
        
        this.loading = false;
        this.sortCompanies();
        console.log('Companies loaded:', this.companies.length);
      },
      error: (err) => {
        clearTimeout(timeoutId);
        console.error('Error loading companies:', err);
        this.companies = [];
        this.error = null; // Show empty state instead of error
        this.loading = false;
      }
    });
  }

  searchCompanies(): void {
    if (this.searchQuery.trim()) {
      this.loading = true;
      this.error = null;
      this.isSearching = true;
      
      this.companyService.searchCompanies(this.searchQuery.trim()).subscribe({
        next: (companies) => {
          this.companies = companies;
          this.loading = false;
          this.applyFilters();
        },
        error: (err) => {
          this.error = 'Không thể tìm kiếm công ty. Vui lòng thử lại.';
          this.loading = false;
          console.error('Error searching companies:', err);
        }
      });
    } else {
      this.loadCompanies();
      this.isSearching = false;
    }
  }

  filterCompanies(): void {
    this.loadCompanies(); // Reload and then apply filters
  }

  applyFilters(): void {
    let filteredCompanies = [...this.companies];
    
    if (this.selectedIndustry) {
      filteredCompanies = filteredCompanies.filter(company => 
        company.industry === this.selectedIndustry
      );
    }
    
    if (this.selectedSize) {
      filteredCompanies = filteredCompanies.filter(company => 
        company.size === this.selectedSize
      );
    }
    
    this.companies = filteredCompanies;
    this.sortCompanies();
  }

  sortCompanies(): void {
    switch (this.sortBy) {
      case 'name':
        this.companies.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        this.companies.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        break;
      case 'jobCount':
        this.companies.sort((a, b) => (b.jobCount || 0) - (a.jobCount || 0));
        break;
      case 'industry':
        this.companies.sort((a, b) => a.industry.localeCompare(b.industry));
        break;
    }
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedIndustry = '';
    this.selectedSize = '';
    this.isSearching = false;
    this.loadCompanies();
  }

  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.searchCompanies();
    }
  }

  viewCompanyJobs(company: Company): void {
    console.log('Viewing jobs for company:', company.name);
    // TODO: Navigate to jobs page with company filter
    // this.router.navigate(['/jobs'], { queryParams: { company: company.name } });
  }

  viewCompanyDetails(company: Company): void {
    console.log('Viewing company details:', company);
    // TODO: Navigate to company details page
    // this.router.navigate(['/companies', company.id]);
  }
} 