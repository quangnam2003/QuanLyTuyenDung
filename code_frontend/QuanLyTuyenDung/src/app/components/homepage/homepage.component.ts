import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService, Job, Company } from '../../services/mock-data.service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  searchQuery = '';
  loading = false;
  error: string | null = null;
  isSearching = false;
  searchResultsCount = 0;
  featuredJobs: Job[] = [];
  latestJobs: Job[] = [];
  featuredCompanies: Company[] = [];

  constructor(private mockDataService: MockDataService) { }

  ngOnInit() {
    this.loadFeaturedJobs();
    this.loadLatestJobs();
    this.loadFeaturedCompanies();
  }

  loadFeaturedJobs() {
    this.loading = true;
    this.error = null;

    try {
      this.featuredJobs = this.mockDataService.getFeaturedJobs();
      this.loading = false;
    } catch (error) {
      this.error = 'Không thể tải danh sách việc làm nổi bật. Vui lòng thử lại sau.';
      this.loading = false;
    }
  }

  loadLatestJobs() {
    try {
      this.latestJobs = this.mockDataService.getLatestJobs();
    } catch (error) {
      console.error('Error loading latest jobs:', error);
    }
  }

  loadFeaturedCompanies() {
    try {
      this.featuredCompanies = this.mockDataService.getFeaturedCompanies();
    } catch (error) {
      console.error('Error loading featured companies:', error);
    }
  }

  onSearch() {
    if (!this.searchQuery.trim()) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.isSearching = true;

    try {
      const results = this.mockDataService.searchJobs(this.searchQuery);
      this.featuredJobs = results;
      this.searchResultsCount = results.length;
      this.loading = false;
    } catch (error) {
      this.error = 'Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.';
      this.loading = false;
    }
  }

  onSearchKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.isSearching = false;
    this.searchResultsCount = 0;
    this.loadFeaturedJobs();
  }

  viewJobDetails(job: Job) {
    console.log('Viewing job details:', job);
    // TODO: Navigate to job details page
    // this.router.navigate(['/jobs', job.id]);
  }

  viewCompanyDetails(company: Company) {
    console.log('Viewing company details:', company);
    // TODO: Navigate to company details page
    // this.router.navigate(['/companies', company.id]);
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
