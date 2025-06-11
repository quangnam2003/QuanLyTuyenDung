import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { JobService } from '../../services/job.service';
import { Job } from '../../interfaces/job.interface';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  searchQuery: string = '';
  featuredJobs: Job[] = [];
  loading: boolean = true;
  error: string | null = null;
  currentUser: User | null = null;
  isSearching: boolean = false;
  searchResultsCount: number = 0;

  constructor(private jobService: JobService, private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
  }

  ngOnInit(): void {
    this.loadFeaturedJobs();
  }

  loadFeaturedJobs(): void {
    this.loading = true;
    this.error = null;
    this.isSearching = false;
    
    this.jobService.getFeaturedJobs().subscribe({
      next: (jobs) => {
        this.featuredJobs = jobs;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải danh sách việc làm. Vui lòng thử lại sau.';
        this.loading = false;
        console.error('Error loading jobs:', err);
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.loading = true;
      this.error = null;
      this.isSearching = true;
      
      this.jobService.searchJobs(this.searchQuery.trim()).subscribe({
        next: (jobs) => {
          this.featuredJobs = jobs;
          this.searchResultsCount = jobs.length;
          this.loading = false;
          
          if (jobs.length === 0) {
            this.error = `Không tìm thấy công việc nào với từ khóa "${this.searchQuery}"`;
          }
        },
        error: (err) => {
          this.error = 'Không thể tìm kiếm việc làm. Vui lòng thử lại sau.';
          this.loading = false;
          console.error('Error searching jobs:', err);
        }
      });
    } else {
      // Nếu không có từ khóa tìm kiếm, hiển thị lại việc làm nổi bật
      this.loadFeaturedJobs();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadFeaturedJobs();
  }

  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  viewJobDetails(job: Job): void {
    // TODO: Navigate to job details page
    console.log('Viewing job:', job);
    // Có thể thêm router navigation tại đây:
    // this.router.navigate(['/jobs', job.id]);
  }
}
