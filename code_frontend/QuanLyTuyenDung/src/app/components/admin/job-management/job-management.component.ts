import { Component, OnInit } from '@angular/core';
import { JobService } from '../../../services/job.service';
import { Job } from '../../../interfaces/job.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-job-management',
  templateUrl: './job-management.component.html',
  styleUrls: ['./job-management.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class JobManagementComponent implements OnInit {
  // Data properties
  allJobs: Job[] = [];
  filteredJobs: Job[] = [];
  
  // State properties
  loading = false;
  error: string | null = null;
  
  // Search and filter properties
  searchQuery = '';
  selectedType = '';
  selectedLocation = '';
  selectedCompany = '';
  selectedStatus = '';
  sortBy = 'newest';
  
  // Filter options
  availableTypes: string[] = [];
  availableLocations: string[] = [];
  availableCompanies: string[] = [];
  availableStatuses: string[] = ['Active', 'Closed', 'Pending'];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(private jobService: JobService) { }

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading = true;
    this.error = null;
    
    // Set timeout to avoid infinite loading
    const timeoutId = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.error = 'Không thể kết nối đến server. Vui lòng kiểm tra backend API.';
        this.allJobs = [];
        this.filteredJobs = [];
      }
    }, 10000);

    this.jobService.getAllJobs().subscribe({
      next: (response: any) => {
        clearTimeout(timeoutId);
        console.log('Jobs loaded:', response);
        
        // Ensure response is an array
        let jobs: Job[] = [];
        if (Array.isArray(response)) {
          jobs = response;
        } else if (response && Array.isArray(response.data)) {
          jobs = response.data;
        } else {
          jobs = [];
        }
        
        this.allJobs = jobs;
        this.extractFilterOptions();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        clearTimeout(timeoutId);
        console.error('Error loading jobs:', err);
        this.allJobs = [];
        this.filteredJobs = [];
        this.error = 'Không thể tải danh sách công việc. Vui lòng kiểm tra kết nối.';
        this.loading = false;
      }
    });
  }

  // Extract filter options from jobs data
  extractFilterOptions(): void {
    if (!Array.isArray(this.allJobs)) {
      this.allJobs = [];
      return;
    }

    try {
      // Extract unique types
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
    } catch (error) {
      console.error('Error extracting filter options:', error);
    }
  }

  // Apply filters and search
  applyFilters(): void {
    if (!Array.isArray(this.allJobs)) {
      this.allJobs = [];
    }

    let filtered = [...this.allJobs];

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

    // Apply status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(job => job && job.status === this.selectedStatus);
    }

    this.filteredJobs = filtered;
    this.applySorting();
    this.calculatePagination();
  }

  // Sort jobs
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

  // Pagination
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredJobs.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  get paginatedJobs(): Job[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredJobs.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Actions
  editJob(job: Job): void {
    console.log('Edit job:', job);
    // TODO: Navigate to edit page or open modal
    // this.router.navigate(['/admin/jobs/edit', job.id]);
  }

  deleteJob(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      this.loading = true;
      
      this.jobService.deleteJob(id).subscribe({
        next: () => {
          this.allJobs = this.allJobs.filter(job => job.id !== id);
          this.applyFilters();
          this.loading = false;
          alert('Xóa công việc thành công');
        },
        error: (error) => {
          console.error('Error deleting job:', error);
          this.loading = false;
          alert('Có lỗi xảy ra khi xóa công việc');
        }
      });
    }
  }

  viewJobDetails(job: Job): void {
    console.log('View job details:', job);
    // TODO: Navigate to job details page
    // this.router.navigate(['/admin/jobs/details', job.id]);
  }

  // Event handlers
  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.applyFilters();
    }
  }

  onSearchInput(): void {
    // Debounce search
    clearTimeout((this as any).searchTimeout);
    (this as any).searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.selectedType = '';
    this.selectedLocation = '';
    this.selectedCompany = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  // Helper methods
  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.selectedType || this.selectedLocation || 
              this.selectedCompany || this.selectedStatus);
  }

  extractSalaryValue(salary: string): number {
    if (!salary) return 0;
    const match = salary.match(/[\d,]+/);
    if (match) {
      return parseInt(match[0].replace(/,/g, ''));
    }
    return 0;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'badge bg-success';
      case 'closed':
        return 'badge bg-danger';
      case 'pending':
        return 'badge bg-warning';
      default:
        return 'badge bg-secondary';
    }
  }

  getJobTypeClass(type: string): string {
    return 'badge bg-info';
  }
} 