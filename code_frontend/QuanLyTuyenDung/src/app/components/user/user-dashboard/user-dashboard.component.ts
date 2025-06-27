import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface RecentApplication {
  companyName: string;
  position: string;
  status: string;
  date: string;
}

interface JobSuggestion {
  companyName: string;
  position: string;
  location: string;
  salary: string;
  matchPercentage: number;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="welcome-section">
        <h1>Xin chào, {{userName}}</h1>
        <p class="subtitle">Đây là trang tổng quan của bạn</p>
      </div>

      <!-- Recent Applications Section -->
      <div class="dashboard-section recent-applications">
        <div class="section-header">
          <h2>Đã nộp các CV công ty gần đây</h2>
          <a routerLink="/user/applications" class="view-all">Xem tất cả →</a>
        </div>
        <div class="applications-list">
          <div class="application-item" *ngFor="let app of recentApplications">
            <div class="application-content">
              <div class="company-info">
                <div class="company-logo">
                  <i class="fas fa-building"></i>
                </div>
                <div class="company-details">
                  <h3>{{app.companyName}}</h3>
                  <p class="position">{{app.position}}</p>
                </div>
              </div>
              <div class="status-info">
                <span class="status-badge" [ngClass]="app.status.toLowerCase()">
                  {{app.status}}
                </span>
                <span class="date">
                  <i class="far fa-calendar-alt"></i>
                  {{app.date}}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Job Suggestions Section -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2>Gợi ý công ty có thể nộp CV</h2>
        </div>
        <div class="suggestions-grid">
          <div class="suggestion-card" *ngFor="let job of jobSuggestions">
            <div class="card-content">
              <div class="job-info">
                <h3>{{job.position}}</h3>
                <p class="company">{{job.companyName}}</p>
                <div class="job-details">
                  <span class="location">
                    <i class="fas fa-map-marker-alt"></i> {{job.location}}
                  </span>
                  <span class="salary">
                    <i class="fas fa-money-bill-wave"></i> {{job.salary}}
                  </span>
                </div>
              </div>
              <div class="match-rate">
                <div class="percentage-circle">
                  <span class="percentage">{{job.matchPercentage}}%</span>
                  <span class="label">Phù hợp</span>
                </div>
              </div>
            </div>
            <button class="apply-btn">Ứng tuyển ngay</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-section {
      margin-bottom: 40px;
    }

    .welcome-section h1 {
      font-size: 32px;
      color: #2B3674;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .subtitle {
      color: #707EAE;
      font-size: 16px;
    }

    .dashboard-section {
      background: white;
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 32px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }

    .recent-applications {
      background: linear-gradient(to right, #ffffff, #f8f9ff);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .section-header h2 {
      font-size: 20px;
      color: #2B3674;
      font-weight: 600;
      margin: 0;
    }

    .view-all {
      color: #4318FF;
      text-decoration: none;
      font-weight: 500;
      display: flex;
      align-items: center;
      transition: color 0.2s;
    }

    .view-all:hover {
      color: #2B3674;
    }

    /* Applications List Styling */
    .applications-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .application-item {
      background: white;
      border: 1px solid #E6E8F0;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .application-item:hover {
      border-color: #4318FF;
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(67, 24, 255, 0.1);
    }

    .application-content {
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .company-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .company-logo {
      width: 48px;
      height: 48px;
      background: #F4F7FE;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .company-logo i {
      font-size: 24px;
      color: #4318FF;
    }

    .company-details h3 {
      color: #2B3674;
      font-size: 16px;
      margin: 0 0 4px 0;
      font-weight: 600;
    }

    .position {
      color: #707EAE;
      font-size: 14px;
      margin: 0;
    }

    .status-info {
      text-align: right;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.đã-nộp { 
      background: #E8F5E9; 
      color: #2E7D32; 
    }
    
    .status-badge.đang-xử-lý { 
      background: #FFF3E0; 
      color: #EF6C00; 
    }
    
    .status-badge.phỏng-vấn { 
      background: #E3F2FD; 
      color: #1565C0; 
    }

    .date {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #707EAE;
      font-size: 12px;
    }

    .date i {
      font-size: 14px;
    }

    /* Job Suggestions Styling */
    .suggestions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .suggestion-card {
      background: white;
      border: 1px solid #E6E8F0;
      border-radius: 16px;
      padding: 20px;
      transition: all 0.3s ease;
    }

    .suggestion-card:hover {
      border-color: #4318FF;
      transform: translateY(-4px);
      box-shadow: 0 4px 15px rgba(67, 24, 255, 0.1);
    }

    .card-content {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .job-info h3 {
      color: #2B3674;
      font-size: 18px;
      margin: 0 0 8px 0;
      font-weight: 600;
    }

    .company {
      color: #707EAE;
      font-size: 14px;
      margin: 0 0 16px 0;
    }

    .job-details {
      display: flex;
      gap: 16px;
      color: #707EAE;
      font-size: 14px;
    }

    .job-details i {
      margin-right: 6px;
      color: #4318FF;
    }

    .match-rate {
      text-align: center;
    }

    .percentage-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #F4F7FE;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border: 2px solid #4318FF;
    }

    .percentage {
      font-size: 24px;
      font-weight: bold;
      color: #2B3674;
      line-height: 1;
    }

    .label {
      font-size: 12px;
      color: #707EAE;
      margin-top: 4px;
    }

    .apply-btn {
      width: 100%;
      background: #4318FF;
      color: white;
      border: none;
      padding: 12px;
      border-radius: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .apply-btn:hover {
      background: #2B3674;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .welcome-section h1 {
        font-size: 24px;
      }

      .suggestions-grid {
        grid-template-columns: 1fr;
      }

      .application-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .status-info {
        text-align: left;
        flex-direction: row;
        align-items: center;
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class UserDashboardComponent implements OnInit {
  userName = 'Nam Nguyễn Quang';
  
  recentApplications: RecentApplication[] = [
    {
      companyName: 'FPT Software',
      position: 'Frontend Developer',
      status: 'Đã nộp',
      date: '20/03/2024'
    },
    {
      companyName: 'Viettel Solutions',
      position: 'Software Engineer',
      status: 'Đang xử lý',
      date: '18/03/2024'
    },
    {
      companyName: 'VNG Corporation',
      position: 'Full Stack Developer',
      status: 'Phỏng vấn',
      date: '15/03/2024'
    }
  ];

  jobSuggestions: JobSuggestion[] = [
    {
      companyName: 'VNPT Technology',
      position: 'Frontend Developer',
      location: 'Hà Nội',
      salary: '15-20 triệu',
      matchPercentage: 95
    },
    {
      companyName: 'Momo',
      position: 'React Developer',
      location: 'Hồ Chí Minh',
      salary: '20-25 triệu',
      matchPercentage: 90
    },
    {
      companyName: 'Tiki Corporation',
      position: 'Angular Developer',
      location: 'Hà Nội',
      salary: '18-22 triệu',
      matchPercentage: 85
    }
  ];

  constructor() {}

  ngOnInit(): void {}
} 