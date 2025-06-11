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
        <div class="sidebar-header">
          <h2>User Portal</h2>
        </div>
        <ul class="nav-menu">
          <li>
            <a routerLink="/user/dashboard" routerLinkActive="active">
              <i class="bi bi-speedometer2"></i>
              <span>Tổng quan</span>
            </a>
          </li>
          <li>
            <a routerLink="/user/profile" routerLinkActive="active">
              <i class="bi bi-person"></i>
              <span>Hồ sơ của tôi</span>
            </a>
          </li>
          <li>
            <a routerLink="/user/applications" routerLinkActive="active">
              <i class="bi bi-file-text"></i>
              <span>Đơn ứng tuyển</span>
            </a>
          </li>
          <li>
            <a routerLink="/user/settings" routerLinkActive="active">
              <i class="bi bi-gear"></i>
              <span>Cài đặt</span>
            </a>
          </li>
          <li>
            <a href="#" (click)="logout()">
              <i class="bi bi-box-arrow-right"></i>
              <span>Đăng xuất</span>
            </a>
          </li>
        </ul>
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
      display: grid;
      grid-template-columns: 250px 1fr;
      min-height: 100vh;
    }
    .sidebar {
      background: #2c3e50;
      color: white;
      padding: 1rem;
    }
    .sidebar-header {
      padding: 1rem 0;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .sidebar-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }
    .nav-menu {
      list-style: none;
      padding: 0;
      margin: 1rem 0;
    }
    .nav-menu li a {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      border-radius: 4px;
      transition: all 0.3s ease;
    }
    .nav-menu li a:hover,
    .nav-menu li a.active {
      background: rgba(255,255,255,0.1);
      color: white;
    }
    .nav-menu li a i {
      font-size: 1.1rem;
    }
    .main-content {
      background: #f8f9fa;
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
        grid-template-columns: 1fr;
      }
      .sidebar {
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