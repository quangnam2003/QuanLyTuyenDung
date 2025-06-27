import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../interfaces/user.interface';
import { JobService } from '../../../services/job.service';
import { Job } from '../../../models/job.model';

@Component({
  selector: 'app-user-interface',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="user-layout">
      <!-- Sidebar -->
      <nav class="sidebar">
        <h1 class="portal-title">User Portal</h1>
        <nav class="nav-menu">
          <a routerLink="dashboard" routerLinkActive="active" class="nav-item">
            <i class="fas fa-chart-pie"></i>
            <span>Tổng quan</span>
          </a>
          <a routerLink="profile" routerLinkActive="active" class="nav-item">
            <i class="fas fa-user"></i>
            <span>Hồ sơ của tôi</span>
          </a>
          <a routerLink="applications" routerLinkActive="active" class="nav-item">
            <i class="fas fa-file-alt"></i>
            <span>Đơn ứng tuyển</span>
          </a>
          <a routerLink="companies" routerLinkActive="active" class="nav-item">
            <i class="fas fa-building"></i>
            <span>Công ty</span>
          </a>
          <a routerLink="/auth/logout" class="nav-item">
            <i class="fas fa-sign-out-alt"></i>
            <span>Đăng xuất</span>
          </a>
        </nav>
      </nav>

      <!-- Main -->
      <main class="main-content">
        <header class="top-bar">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" placeholder="Tìm kiếm...">
          </div>
          <div class="user-menu">
            <div class="user-info">
              <img src="assets/images/avatar.jpg" alt="User Avatar">
              <span>{{currentUser?.fullName || 'Người dùng'}}</span>
            </div>
            <button (click)="logout()" class="btn btn-outline-danger btn-sm" style="margin-left: 12px;">
              Đăng xuất
            </button>
          </div>
        </header>
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .user-layout {
      display: flex;
      height: 100vh;
    }

    .sidebar {
      width: 250px;
      background: #2B3674;
      color: white;
      padding: 20px;
      display: flex;
      flex-direction: column;
    }

    .portal-title {
      font-size: 24px;
      margin-bottom: 40px;
      font-weight: 600;
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #A3AED0;
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-item.active {
      background: #4318FF;
      color: white;
    }

    .nav-item i {
      font-size: 18px;
      width: 24px;
    }

    .main-content {
      flex: 1;
      padding: 20px;
      background: #F4F7FE;
      overflow-y: auto;
    }

    .top-bar {
      background: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f8f9fa;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      width: 300px;
    }
    .search-box input {
      border: none;
      background: none;
      outline: none;
      width: 100%;
    }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .user-info img {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      object-fit: cover;
    }
    .content {
      padding: 2rem;
    }
    @media (max-width: 768px) {
      .user-layout {
        flex-direction: column;
      }
      .sidebar {
        width: 80px;
        padding: 20px 10px;
      }
      .portal-title {
        display: none;
      }
      .nav-item {
        padding: 12px;
        justify-content: center;
      }
      .nav-item span {
        display: none;
      }
      .search-box {
        width: 200px;
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
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadDashboardData();
    this.isDashboardRoute = this.router.url.endsWith('/dashboard');
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
      next: (jobs: Job[]) => {
        this.recommendedJobs = jobs;
      },
      error: (error: Error) => {
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