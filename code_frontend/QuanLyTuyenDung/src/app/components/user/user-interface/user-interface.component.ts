import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../interfaces/user.interface';
import { JobService } from '../../../services/job.service';
import { Job } from '../../../models/job.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-interface',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="user-interface">
      <!-- User Header -->
      <header class="user-header">
        <div class="container">
          <div class="user-welcome">
            <h2>Xin chào, {{currentUser?.fullName || 'Người dùng'}}</h2>
            <p class="user-role">Tài khoản người dùng</p>
          </div>
          <nav class="user-nav">
            <ul>
              <li><a routerLink="/user/dashboard" routerLinkActive="active">Tổng quan</a></li>
              <li><a routerLink="/user/profile" routerLinkActive="active">Hồ sơ của tôi</a></li>
              <li><a routerLink="/user/applications" routerLinkActive="active">Đơn ứng tuyển</a></li>
              <li><a routerLink="/user/saved-jobs" routerLinkActive="active">Việc làm đã lưu</a></li>
              <li><a routerLink="/user/settings" routerLinkActive="active">Cài đặt</a></li>
              <li><a href="#" (click)="logout()">Đăng xuất</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <!-- Main Content -->
      <main class="user-main">
        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .user-interface {
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .user-header {
      background-color: #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .user-welcome {
      margin-bottom: 1rem;
    }

    .user-welcome h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
    }

    .user-role {
      color: #666;
      margin: 0.5rem 0 0;
    }

    .user-nav ul {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 1rem;
    }

    .user-nav a {
      text-decoration: none;
      color: #2c3e50;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.3s;
    }

    .user-nav a:hover {
      background-color: #f8f9fa;
      color: #3498db;
    }

    .user-nav a.active {
      background-color: #3498db;
      color: white;
    }

    .user-main {
      padding: 2rem 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .stat-card h3 {
      margin: 0 0 1rem;
      color: #2c3e50;
      font-size: 1.1rem;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #3498db;
      margin: 0 0 1rem;
    }

    .stat-card a {
      color: #3498db;
      text-decoration: none;
    }

    .stat-card a:hover {
      text-decoration: underline;
    }

    .recent-applications,
    .recommended-jobs {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .recent-applications h3,
    .recommended-jobs h3 {
      margin: 0 0 1.5rem;
      color: #2c3e50;
    }

    .applications-list {
      display: grid;
      gap: 1rem;
    }

    .application-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .application-info h4 {
      margin: 0 0 0.5rem;
      color: #2c3e50;
    }

    .company {
      color: #666;
      margin: 0 0 0.5rem;
    }

    .status {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .status.pending {
      background-color: #ffeeba;
      color: #856404;
    }

    .status.approved {
      background-color: #d4edda;
      color: #155724;
    }

    .status.rejected {
      background-color: #f8d7da;
      color: #721c24;
    }

    .application-date {
      color: #666;
      font-size: 0.875rem;
    }

    .jobs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .job-card {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
    }

    .job-card h4 {
      margin: 0 0 0.5rem;
      color: #2c3e50;
    }

    .job-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .btn-apply,
    .btn-save {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-apply {
      background-color: #3498db;
      color: white;
    }

    .btn-apply:hover {
      background-color: #2980b9;
    }

    .btn-save {
      background-color: #f8f9fa;
      color: #2c3e50;
      border: 1px solid #dee2e6;
    }

    .btn-save:hover {
      background-color: #e9ecef;
    }

    .no-data {
      text-align: center;
      color: #666;
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .user-nav ul {
        flex-direction: column;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .jobs-grid {
        grid-template-columns: 1fr;
      }

      .application-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
  `]
})
export class UserInterfaceComponent implements OnInit {
  currentUser: User | null = null;
  applicationCount: number = 0;
  savedJobsCount: number = 0;
  upcomingInterviews: number = 0;
  recentApplications: any[] = [];
  recommendedJobs: Job[] = [];
  isDashboardRoute: boolean = true;

  constructor(
    private authService: AuthService,
    private jobService: JobService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardData();
    this.isDashboardRoute = this.router.url.endsWith('/dashboard');
  }

  loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadDashboardData(): void {
    // TODO: Implement loading dashboard data from services
    // This is mock data for now
    this.applicationCount = 5;
    this.savedJobsCount = 3;
    this.upcomingInterviews = 2;
    
    this.recentApplications = [
      {
        jobTitle: 'Frontend Developer',
        company: 'Tech Company A',
        status: 'Pending',
        appliedDate: new Date()
      },
      {
        jobTitle: 'Backend Developer',
        company: 'Tech Company B',
        status: 'Approved',
        appliedDate: new Date()
      }
    ];

    // Load recommended jobs from database
    this.jobService.getRecommendedJobs().subscribe({
      next: (jobs) => {
        this.recommendedJobs = jobs;
      },
      error: (error) => {
        console.error('Error loading recommended jobs:', error);
      }
    });
  }

  applyForJob(job: Job): void {
    // TODO: Implement job application logic
    console.log('Applying for job:', job);
  }

  saveJob(job: Job): void {
    // TODO: Implement job saving logic
    job.isSaved = !job.isSaved;
    console.log('Saving job:', job);
  }

  logout(): void {
    this.authService.logout();
  }
}