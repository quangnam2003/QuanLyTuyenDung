import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { JobService } from '../../services/job.service';
import { Job } from '../../interfaces/job.interface';
import { RouterModule } from '@angular/router';

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

  constructor(private jobService: JobService) { }

  ngOnInit(): void {
    this.loadFeaturedJobs();
  }

  loadFeaturedJobs(): void {
    this.loading = true;
    this.error = null;
    
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
      
      this.jobService.searchJobs(this.searchQuery).subscribe({
        next: (jobs) => {
          this.featuredJobs = jobs;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Không thể tìm kiếm việc làm. Vui lòng thử lại sau.';
          this.loading = false;
          console.error('Error searching jobs:', err);
        }
      });
    }
  }

  viewJobDetails(job: Job): void {
    // TODO: Navigate to job details page
    console.log('Viewing job:', job);
  }
}
