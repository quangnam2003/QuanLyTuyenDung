import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService, Company } from '../../services/mock-data.service';

@Component({
  selector: 'app-user-companies',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="companies-page">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="main-title">Khám phá công ty</h1>
            <p class="subtitle">Tìm hiểu về các công ty hàng đầu đang tuyển dụng nhân tài</p>
          </div>
          <div class="header-stats">
            <div class="stat-card">
              <div class="stat-number">{{companies.length}}</div>
              <div class="stat-label">Công ty</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{getTotalJobs()}}</div>
              <div class="stat-label">Việc làm</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Companies Grid -->
      <div class="companies-container">
        <div class="companies-grid">
          <div class="company-card" 
               *ngFor="let company of companies" 
               (click)="viewCompanyDetails(company)"
               [class.hot-company]="company.jobCount > 10">
            
            <!-- Company Header -->
            <div class="card-header">
              <div class="company-avatar">
                <div class="avatar-bg">
                  <i class="fas fa-building"></i>
                </div>
                <div class="company-badge" *ngIf="company.jobCount > 10">
                  <i class="fas fa-fire"></i>
                  <span>Hot</span>
                </div>
              </div>
              <div class="company-basic-info">
                <h3 class="company-name">{{company.name}}</h3>
                <div class="company-category">{{company.industry}}</div>
              </div>
            </div>

            <!-- Company Description -->
            <div class="card-body">
              <p class="company-description">{{company.description}}</p>
              
              <!-- Company Details -->
              <div class="company-info-grid">
                <div class="info-item">
                  <div class="info-icon">
                    <i class="fas fa-map-marker-alt"></i>
                  </div>
                  <div class="info-content">
                    <div class="info-label">Địa điểm</div>
                    <div class="info-value">{{company.location}}</div>
                  </div>
                </div>
                
                <div class="info-item">
                  <div class="info-icon">
                    <i class="fas fa-users"></i>
                  </div>
                  <div class="info-content">
                    <div class="info-label">Quy mô</div>
                    <div class="info-value">{{company.size}}</div>
                  </div>
                </div>
                
                <div class="info-item">
                  <div class="info-icon">
                    <i class="fas fa-briefcase"></i>
                  </div>
                  <div class="info-content">
                    <div class="info-label">Tuyển dụng</div>
                    <div class="info-value">{{company.jobCount}} vị trí</div>
                  </div>
                </div>
              </div>

              <!-- Benefits -->
              <div class="benefits-section" *ngIf="company.benefits && company.benefits.length > 0">
                <div class="benefits-title">Phúc lợi nổi bật</div>
                <div class="benefits-tags">
                  <span class="benefit-tag" *ngFor="let benefit of company.benefits.slice(0, 3)">
                    {{benefit}}
                  </span>
                  <span class="more-tag" *ngIf="company.benefits.length > 3">
                    +{{company.benefits.length - 3}}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .companies-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow-x: hidden;
    }

    .companies-page::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="80" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="60" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="30" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="90" r="1" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
      pointer-events: none;
    }

    .page-header {
      padding: 80px 20px 60px;
      position: relative;
      z-index: 1;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 40px;
    }

    .header-text {
      flex: 1;
    }

    .main-title {
      font-size: 48px;
      font-weight: 800;
      color: white;
      margin: 0 0 16px 0;
      text-shadow: 0 4px 20px rgba(0,0,0,0.3);
      line-height: 1.1;
    }

    .subtitle {
      font-size: 20px;
      color: rgba(255,255,255,0.9);
      margin: 0;
      font-weight: 400;
      line-height: 1.4;
    }

    .header-stats {
      display: flex;
      gap: 24px;
    }

    .stat-card {
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 20px;
      padding: 24px;
      text-align: center;
      min-width: 120px;
    }

    .stat-number {
      font-size: 32px;
      font-weight: 700;
      color: white;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: rgba(255,255,255,0.8);
      font-weight: 500;
    }

    .companies-container {
      padding: 0 20px 80px;
      position: relative;
      z-index: 1;
    }

    .companies-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 32px;
    }

    .company-card {
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      position: relative;
      border: 1px solid rgba(255,255,255,0.2);
    }

    .company-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    .company-card:hover::before {
      transform: scaleX(1);
    }

    .company-card:hover {
      transform: translateY(-12px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }

    .hot-company {
      position: relative;
      overflow: visible;
    }

    .hot-company::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, #ff6b6b, #ffa726, #42a5f5, #ab47bc);
      border-radius: 26px;
      z-index: -1;
      animation: gradient-border 3s ease infinite;
    }

    @keyframes gradient-border {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    .card-header {
      padding: 32px 32px 0;
      display: flex;
      align-items: flex-start;
      gap: 20px;
    }

    .company-avatar {
      position: relative;
    }

    .avatar-bg {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .avatar-bg i {
      font-size: 36px;
      color: white;
    }

    .company-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: linear-gradient(135deg, #ff6b6b, #ff8a65);
      color: white;
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .company-basic-info {
      flex: 1;
    }

    .company-name {
      font-size: 24px;
      font-weight: 700;
      color: #2d3748;
      margin: 0 0 8px 0;
      line-height: 1.2;
    }

    .company-category {
      background: linear-gradient(135deg, #667eea, #764ba2);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-body {
      padding: 24px 32px;
    }

    .company-description {
      color: #718096;
      font-size: 15px;
      line-height: 1.6;
      margin: 0 0 24px 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .company-info-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f7fafc;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
    }

    .info-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .info-icon i {
      color: white;
      font-size: 16px;
    }

    .info-content {
      flex: 1;
    }

    .info-label {
      font-size: 12px;
      color: #a0aec0;
      margin-bottom: 2px;
      font-weight: 500;
    }

    .info-value {
      font-size: 14px;
      color: #2d3748;
      font-weight: 600;
    }

    .benefits-section {
      margin-bottom: 8px;
    }

    .benefits-title {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 12px;
    }

    .benefits-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .benefit-tag {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .more-tag {
      background: #e2e8f0;
      color: #718096;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }



    /* Responsive Design */
    @media (max-width: 1024px) {
      .companies-grid {
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 24px;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 32px;
      }

      .main-title {
        font-size: 40px;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        padding: 60px 20px 40px;
      }

      .main-title {
        font-size: 32px;
      }

      .subtitle {
        font-size: 16px;
      }

      .companies-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .card-header {
        padding: 24px 24px 0;
      }

      .card-body {
        padding: 20px 24px;
      }

      .header-stats {
        flex-direction: row;
        justify-content: center;
      }

      .stat-card {
        min-width: 100px;
        padding: 20px;
      }
    }

    @media (max-width: 480px) {
      .companies-container {
        padding: 0 16px 60px;
      }

      .page-header {
        padding: 40px 16px 30px;
      }

      .main-title {
        font-size: 28px;
      }

      .companies-grid {
        gap: 16px;
      }

      .company-card {
        border-radius: 20px;
      }

      .avatar-bg {
        width: 60px;
        height: 60px;
      }

      .avatar-bg i {
        font-size: 28px;
      }

      .company-name {
        font-size: 20px;
      }
    }
  `]
})
export class UserCompaniesComponent implements OnInit {
  companies: Company[] = [];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.companies = this.mockDataService.getAllCompanies();
  }

  getTotalJobs(): number {
    return this.companies.reduce((total, company) => total + company.jobCount, 0);
  }

  viewCompanyDetails(company: Company): void {
    console.log('Viewing company details:', company);
    // TODO: Navigate to company detail page
  }
}
