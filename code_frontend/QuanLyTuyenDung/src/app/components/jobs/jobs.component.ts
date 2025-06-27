import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService, Job } from '../../services/mock-data.service';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css']
})
export class JobsComponent implements OnInit {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  searchQuery = '';
  selectedType = 'Tất cả loại hình';
  selectedLocation = 'Tất cả địa điểm';
  selectedCompany = 'Tất cả công ty';
  loading = false;
  error: string | null = null;

  jobTypes = ['Tất cả loại hình', 'Full-time', 'Part-time', 'Contract', 'Internship'];
  locations = ['Tất cả địa điểm', 'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng'];
  companies: string[] = ['Tất cả công ty'];

  constructor(private mockDataService: MockDataService) { }

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.loading = true;
    this.error = null;

    try {
      this.jobs = this.mockDataService.getAllJobs();
      this.filteredJobs = [...this.jobs];
      
      // Get unique companies
      const uniqueCompanies = [...new Set(this.jobs.map(job => job.company))];
      this.companies = ['Tất cả công ty', ...uniqueCompanies];
      
      this.loading = false;
    } catch (error) {
      this.error = 'Không thể tải danh sách việc làm. Vui lòng thử lại sau.';
      this.loading = false;
    }
  }

  onSearch() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  private applyFilters() {
    this.filteredJobs = this.jobs.filter(job => {
      const matchQuery = !this.searchQuery || 
        job.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchType = this.selectedType === 'Tất cả loại hình' || job.type === this.selectedType;
      const matchLocation = this.selectedLocation === 'Tất cả địa điểm' || job.location === this.selectedLocation;
      const matchCompany = this.selectedCompany === 'Tất cả công ty' || job.company === this.selectedCompany;

      return matchQuery && matchType && matchLocation && matchCompany;
    });
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedType = 'Tất cả loại hình';
    this.selectedLocation = 'Tất cả địa điểm';
    this.selectedCompany = 'Tất cả công ty';
    this.filteredJobs = [...this.jobs];
  }

  viewJobDetails(job: Job) {
    console.log('Viewing job details:', job);
    // TODO: Navigate to job details page
    // this.router.navigate(['/jobs', job.id]);
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Hôm qua';
    if (days < 7) return `${days} ngày trước`;
    if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
    if (days < 365) return `${Math.floor(days / 30)} tháng trước`;
    return `${Math.floor(days / 365)} năm trước`;
  }

  getJobTypeClass(type: string): string {
    switch (type.toLowerCase()) {
      case 'full-time':
        return 'job-type-fulltime';
      case 'part-time':
        return 'job-type-parttime';
      case 'contract':
        return 'job-type-contract';
      case 'internship':
        return 'job-type-internship';
      default:
        return '';
    }
  }
}