import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { JobService } from '../../services/job.service';
import { Job } from '../../interfaces/job.interface';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="jobs-page">
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

      <!-- Search & Filter Section -->
      <section class="search-filter-section">
        <div class="container">
          <h1>Tìm việc làm phù hợp</h1>
          <div class="search-filter-container">
            <div class="search-bar">
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                (keypress)="onSearchKeyPress($event)"
                (input)="onSearchInput()"
                placeholder="Tìm kiếm theo tên công việc, công ty...">
              <button (click)="applyFilters()" [disabled]="loading">
                <i class="bi bi-search" *ngIf="!loading"></i>
                <i class="bi bi-arrow-clockwise spin" *ngIf="loading"></i>
                {{ loading ? 'Đang tìm...' : 'Tìm kiếm' }}
              </button>
            </div>
            <div class="filter-bar">
              <select [(ngModel)]="selectedType" (change)="applyFilters()">
                <option value="">Tất cả loại hình</option>
                <option *ngFor="let type of availableTypes" [value]="type">{{ type }}</option>
              </select>
              <select [(ngModel)]="selectedLocation" (change)="applyFilters()">
                <option value="">Tất cả địa điểm</option>
                <option *ngFor="let location of availableLocations" [value]="location">{{ location }}</option>
              </select>
              <select [(ngModel)]="selectedCompany" (change)="applyFilters()">
                <option value="">Tất cả công ty</option>
                <option *ngFor="let company of availableCompanies" [value]="company">{{ company }}</option>
              </select>
              <button (click)="clearAllFilters()" class="clear-btn" [disabled]="loading">
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
              {{ getResultsTitle() }}
              <span class="results-count" *ngIf="!loading">
                ({{ filteredJobs.length }} việc làm)
              </span>
            </h2>
            <div class="sort-options">
              <label>Sắp xếp:</label>
              <select [(ngModel)]="sortBy" (change)="onSortChange()">
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="title">Tên A-Z</option>
                <option value="company">Công ty A-Z</option>
                <option value="salary">Lương cao nhất</option>
              </select>
            </div>
          </div>

          <!-- Active Filters Display -->
          <div class="active-filters" *ngIf="hasActiveFilters()">
            <span class="filter-label">Bộ lọc hiện tại:</span>
            <span class="filter-tag" *ngIf="searchQuery">
              Từ khóa: "{{ searchQuery }}"
              <i class="bi bi-x" (click)="clearSearchQuery()"></i>
            </span>
            <span class="filter-tag" *ngIf="selectedType">
              Loại: {{ selectedType }}
              <i class="bi bi-x" (click)="clearTypeFilter()"></i>
            </span>
            <span class="filter-tag" *ngIf="selectedLocation">
              Địa điểm: {{ selectedLocation }}
              <i class="bi bi-x" (click)="clearLocationFilter()"></i>
            </span>
            <span class="filter-tag" *ngIf="selectedCompany">
              Công ty: {{ selectedCompany }}
              <i class="bi bi-x" (click)="clearCompanyFilter()"></i>
            </span>
            <button class="clear-all-filters-btn" (click)="clearAllFilters()">
              <i class="bi bi-x-circle"></i> Xóa tất cả
            </button>
          </div>

          <!-- Loading -->
          <div *ngIf="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>{{ loadingMessage }}</p>
          </div>

          <!-- Error -->
          <div *ngIf="error" class="error">
            <i class="bi bi-exclamation-triangle"></i>
            <p>{{ error }}</p>
            <button (click)="retryLoadData()" class="retry-btn">Thử lại</button>
          </div>

          <!-- Jobs List -->
          <div class="jobs-grid" *ngIf="!loading && !error && filteredJobs.length > 0">
            <div class="job-card" *ngFor="let job of filteredJobs; trackBy: trackByJobId">
              <div class="job-card-header">
                <h3>{{ job.title }}</h3>
                <span class="job-type" [ngClass]="getJobTypeClass(job.type)">
                  {{ job.type }}
                </span>
              </div>
              
              <div class="job-company">
                <i class="bi bi-building"></i>
                <span>{{ job.company }}</span>
              </div>
              
              <div class="job-details">
                <div class="job-location">
                  <i class="bi bi-geo-alt"></i>
                  <span>{{ job.location }}</span>
                </div>
                <div class="job-salary" *ngIf="job.salary">
                  <i class="bi bi-cash-stack"></i>
                  <span>{{ formatSalary(job.salary) }}</span>
                </div>
                <div class="job-date">
                  <i class="bi bi-clock"></i>
                  <span>{{ formatDate(job.createdAt) }}</span>
                </div>
              </div>
              
              <div class="job-description" *ngIf="job.description">
                <p>{{ job.description }}</p>
              </div>
              
              <div class="job-footer">
                <div class="job-tags" *ngIf="job.requirements">
                  <span class="tag">{{ getFirstRequirement(job.requirements) }}</span>
                </div>
                <button (click)="viewJobDetails(job)" class="apply-btn">
                  <i class="bi bi-eye"></i>
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div *ngIf="!loading && !error && filteredJobs.length === 0" class="no-results">
            <div class="empty-state">
              <div class="empty-icon">
                <i class="bi bi-briefcase" *ngIf="!hasActiveFilters()"></i>
                <i class="bi bi-search" *ngIf="hasActiveFilters()"></i>
              </div>
              <h3>{{ getNoResultsTitle() }}</h3>
              <p>{{ getNoResultsMessage() }}</p>
              <div class="empty-actions">
                <button (click)="clearAllFilters()" class="clear-all-btn" *ngIf="hasActiveFilters()">
                  <i class="bi bi-arrow-clockwise"></i>
                  Xóa bộ lọc và tìm kiếm
                </button>
                <button (click)="retryLoadData()" class="retry-btn" *ngIf="!hasActiveFilters()">
                  <i class="bi bi-arrow-clockwise"></i>
                  Tải lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./jobs.component.css']
})
export class JobsComponent implements OnInit {
  // Data properties
  allJobs: Job[] = []; // Lưu tất cả jobs từ API
  filteredJobs: Job[] = []; // Jobs sau khi filter
  availableTypes: string[] = [];
  availableLocations: string[] = [];
  availableCompanies: string[] = [];

  // State properties
  loading = false;
  error: string | null = null;
  loadingMessage = 'Đang tải danh sách việc làm...';

  // Filter properties
  searchQuery = '';
  selectedType = '';
  selectedLocation = '';
  selectedCompany = '';
  sortBy = 'newest';

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  // Load jobs from API
  loadJobs(): void {
    this.loading = true;
    this.error = null;
    this.loadingMessage = 'Đang tải danh sách việc làm...';

    // Set timeout to avoid infinite loading
    const timeoutId = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.error = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và backend API.';
        this.allJobs = [];
        this.filteredJobs = [];
        this.extractFilterOptions();
      }
    }, 10000); // 10 second timeout

    this.jobService.getAllJobs().subscribe({
      next: (response: any) => {
        clearTimeout(timeoutId);
        console.log('API Response:', response);
        
        // Ensure response is an array
        let jobs: Job[] = [];
        if (Array.isArray(response)) {
          jobs = response;
        } else if (response && Array.isArray(response.data)) {
          jobs = response.data;
        } else if (response && typeof response === 'object') {
          // If response is an object, try to extract jobs array
          jobs = [];
          console.warn('API returned object instead of array:', response);
        } else {
          jobs = [];
          console.warn('API returned unexpected format:', response);
        }
        
        this.allJobs = jobs;
        this.extractFilterOptions();
        this.applyFilters();
        this.loading = false;
        
        console.log('Processed jobs:', this.allJobs.length);
        console.log('Filtered jobs:', this.filteredJobs.length);
      },
      error: (err) => {
        clearTimeout(timeoutId);
        console.error('Error loading jobs:', err);
        
        // Set empty state when API fails
        this.allJobs = [];
        this.filteredJobs = [];
        this.extractFilterOptions();
        this.error = 'Không thể tải dữ liệu từ server. Vui lòng kiểm tra backend API có đang chạy không.';
        this.loading = false;
      }
    });
  }



  // Extract filter options from actual jobs data
  extractFilterOptions(): void {
    // Ensure allJobs is an array
    if (!Array.isArray(this.allJobs)) {
      console.warn('allJobs is not an array:', this.allJobs);
      this.allJobs = [];
    }

    try {
      // Extract unique job types
      this.availableTypes = [...new Set(
        this.allJobs
          .map(job => job.type)
          .filter(type => type && type.trim())
      )];
      
      // Extract unique locations
      this.availableLocations = [...new Set(
        this.allJobs
          .map(job => job.location)
          .filter(location => location && location.trim())
      )];
      
      // Extract unique companies
      this.availableCompanies = [...new Set(
        this.allJobs
          .map(job => job.company)
          .filter(company => company && company.trim())
      )];
      
      // Sort alphabetically
      this.availableTypes.sort();
      this.availableLocations.sort();
      this.availableCompanies.sort();
      
      console.log('Filter options extracted:', {
        types: this.availableTypes.length,
        locations: this.availableLocations.length,
        companies: this.availableCompanies.length
      });
    } catch (error) {
      console.error('Error extracting filter options:', error);
      this.availableTypes = [];
      this.availableLocations = [];
      this.availableCompanies = [];
    }
  }

  // Apply filters and search
  applyFilters(): void {
    // Ensure allJobs is an array
    if (!Array.isArray(this.allJobs)) {
      this.allJobs = [];
    }

    let filtered = [...this.allJobs];

    try {
      // Apply search query
      if (this.searchQuery && this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(job => {
          if (!job) return false;
          
          const title = (job.title || '').toLowerCase();
          const company = (job.company || '').toLowerCase();
          const description = (job.description || '').toLowerCase();
          const location = (job.location || '').toLowerCase();
          
          return title.includes(query) ||
                 company.includes(query) ||
                 description.includes(query) ||
                 location.includes(query);
        });
      }

      // Apply type filter
      if (this.selectedType) {
        filtered = filtered.filter(job => job && job.type === this.selectedType);
      }

      // Apply location filter
      if (this.selectedLocation) {
        filtered = filtered.filter(job => job && job.location === this.selectedLocation);
      }

      // Apply company filter
      if (this.selectedCompany) {
        filtered = filtered.filter(job => job && job.company === this.selectedCompany);
      }

      this.filteredJobs = filtered;
      this.applySorting();
      
      console.log('Filters applied:', {
        total: this.allJobs.length,
        filtered: this.filteredJobs.length,
        searchQuery: this.searchQuery,
        selectedType: this.selectedType,
        selectedLocation: this.selectedLocation,
        selectedCompany: this.selectedCompany
      });
    } catch (error) {
      console.error('Error applying filters:', error);
      this.filteredJobs = [];
    }
  }

  // Search with API (for advanced search)
  searchWithAPI(): void {
    if (!this.searchQuery || !this.searchQuery.trim()) {
      this.applyFilters();
      return;
    }

    this.loading = true;
    this.loadingMessage = 'Đang tìm kiếm...';

    this.jobService.searchJobs(this.searchQuery.trim()).subscribe({
      next: (jobs) => {
        this.allJobs = jobs || [];
        this.extractFilterOptions();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error searching jobs:', err);
        // Fallback to local search if API search fails
        this.applyFilters();
        this.loading = false;
      }
    });
  }

  // Input debouncing for search
  private searchTimeout: any;
  onSearchInput(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  // Sort handling
  onSortChange(): void {
    this.applySorting();
  }

  applySorting(): void {
    switch (this.sortBy) {
      case 'newest':
        this.filteredJobs.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.postedDate || '').getTime();
          const dateB = new Date(b.createdAt || b.postedDate || '').getTime();
          return dateB - dateA;
        });
        break;
      case 'oldest':
        this.filteredJobs.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.postedDate || '').getTime();
          const dateB = new Date(b.createdAt || b.postedDate || '').getTime();
          return dateA - dateB;
        });
        break;
      case 'title':
        this.filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'company':
        this.filteredJobs.sort((a, b) => a.company.localeCompare(b.company));
        break;
      case 'salary':
        this.filteredJobs.sort((a, b) => this.extractSalaryValue(b.salary || '') - this.extractSalaryValue(a.salary || ''));
        break;
    }
  }

  // Filter clearing methods
  clearAllFilters(): void {
    this.searchQuery = '';
    this.selectedType = '';
    this.selectedLocation = '';
    this.selectedCompany = '';
    this.applyFilters();
  }

  clearSearchQuery(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  clearTypeFilter(): void {
    this.selectedType = '';
    this.applyFilters();
  }

  clearLocationFilter(): void {
    this.selectedLocation = '';
    this.applyFilters();
  }

  clearCompanyFilter(): void {
    this.selectedCompany = '';
    this.applyFilters();
  }

  // Event handlers
  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.searchWithAPI();
    }
  }

  retryLoadData(): void {
    this.loadJobs();
  }

  // Helper methods
  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.selectedType || this.selectedLocation || this.selectedCompany);
  }

  getResultsTitle(): string {
    if (this.hasActiveFilters()) {
      return 'Kết quả tìm kiếm';
    }
    return 'Tất cả việc làm';
  }

  getNoResultsTitle(): string {
    if (this.hasActiveFilters()) {
      return 'Không tìm thấy việc làm phù hợp';
    }
    return 'Chưa có việc làm nào nổi bật';
  }

  getNoResultsMessage(): string {
    if (this.hasActiveFilters()) {
      return 'Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm được công việc phù hợp với bạn.';
    }
    return 'Hiện tại chưa có việc làm nào được đăng tuyển. Hãy quay lại sau để khám phá các cơ hội nghề nghiệp mới!';
  }

  trackByJobId(index: number, job: Job): number {
    return job.id || index;
  }

  getJobTypeClass(type: string): string {
    return type.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  getFirstRequirement(requirements: string): string {
    if (!requirements) return '';
    const firstReq = requirements.split(',')[0] || requirements.split('.')[0];
    return firstReq.trim().substring(0, 30) + (firstReq.length > 30 ? '...' : '');
  }

  formatSalary(salary: string): string {
    if (!salary) return '';
    // Basic salary formatting - can be enhanced based on your salary format
    return salary.includes('VND') ? salary : salary + ' VND';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  }

  extractSalaryValue(salary: string): number {
    if (!salary) return 0;
    // Extract numeric value from salary string for sorting
    const match = salary.match(/[\d,]+/);
    if (match) {
      return parseInt(match[0].replace(/,/g, ''));
    }
    return 0;
  }

  viewJobDetails(job: Job): void {
    console.log('Viewing job details:', job);
    // TODO: Navigate to job details page
    // this.router.navigate(['/jobs', job.id]);
  }
} 