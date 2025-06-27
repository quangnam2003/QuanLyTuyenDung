import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Application {
  id: number;
  companyName: string;
  position: string;
  status: string;
  date: string;
  logo?: string;
  nextStep?: string;
}

@Component({
  selector: 'app-user-applications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="applications-container">
      <div class="page-header">
        <h1>Đơn ứng tuyển của tôi</h1>
        <p class="subtitle">Theo dõi trạng thái đơn ứng tuyển của bạn</p>
      </div>

      <div class="applications-list" *ngIf="applications.length > 0">
        <div class="application-card" *ngFor="let app of applications">
          <div class="company-logo" *ngIf="app.logo">
            <img [src]="app.logo" [alt]="app.companyName">
          </div>
          <div class="application-info">
            <h3>{{app.position}}</h3>
            <p class="company-name">{{app.companyName}}</p>
            <div class="application-meta">
              <span class="date"><i class="fas fa-calendar"></i> Nộp ngày: {{app.date}}</span>
              <span class="status" [ngClass]="app.status.toLowerCase()">{{app.status}}</span>
            </div>
            <p class="next-step" *ngIf="app.nextStep">
              <i class="fas fa-info-circle"></i> {{app.nextStep}}
            </p>
          </div>
          <div class="actions">
            <button class="btn-view" (click)="viewDetails(app.id)">
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="applications.length === 0">
        <i class="fas fa-file-alt empty-icon"></i>
        <p>Bạn chưa có đơn ứng tuyển nào</p>
        <a routerLink="/user/jobs" class="btn-primary">Tìm việc ngay</a>
      </div>
    </div>
  `,
  styles: [`
    .applications-container {
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .page-header h1 {
      font-size: 28px;
      color: #2B3674;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #707EAE;
      font-size: 16px;
    }

    .application-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 16px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .company-logo {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      overflow: hidden;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .company-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .application-info {
      flex: 1;
    }

    .application-info h3 {
      font-size: 18px;
      color: #2B3674;
      margin: 0 0 4px 0;
    }

    .company-name {
      color: #707EAE;
      font-size: 14px;
      margin: 0 0 12px 0;
    }

    .application-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 8px;
    }

    .date {
      color: #707EAE;
      font-size: 14px;
    }

    .date i {
      margin-right: 4px;
    }

    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .status.đã-nộp { background: #E8F5E9; color: #2E7D32; }
    .status.đang-xử-lý { background: #FFF3E0; color: #EF6C00; }
    .status.phỏng-vấn { background: #E3F2FD; color: #1565C0; }
    .status.từ-chối { background: #FFEBEE; color: #C62828; }

    .next-step {
      color: #2B3674;
      font-size: 14px;
      margin: 8px 0 0 0;
    }

    .next-step i {
      margin-right: 4px;
      color: #1565C0;
    }

    .actions {
      min-width: 120px;
    }

    .btn-view {
      background: transparent;
      color: #2B3674;
      border: 1px solid #E6E8F0;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-view:hover {
      background: #f8f9fa;
      border-color: #2B3674;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    }

    .empty-icon {
      font-size: 48px;
      color: #707EAE;
      margin-bottom: 16px;
    }

    .empty-state p {
      color: #2B3674;
      margin-bottom: 24px;
    }

    .btn-primary {
      background: #2B3674;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      transition: background 0.2s;
    }

    .btn-primary:hover {
      background: #1a2142;
    }
  `]
})
export class UserApplicationsComponent implements OnInit {
  applications: Application[] = [
    {
      id: 1,
      companyName: 'FPT Software',
      position: 'Frontend Developer',
      status: 'Đã nộp',
      date: '20/03/2024',
      nextStep: 'Chờ phản hồi từ nhà tuyển dụng'
    },
    {
      id: 2,
      companyName: 'Viettel Solutions',
      position: 'Software Engineer',
      status: 'Đang xử lý',
      date: '18/03/2024',
      nextStep: 'Đang xem xét hồ sơ của bạn'
    },
    {
      id: 3,
      companyName: 'VNG Corporation',
      position: 'Full Stack Developer',
      status: 'Phỏng vấn',
      date: '15/03/2024',
      nextStep: 'Phỏng vấn lúc 14:00 ngày 25/03/2024'
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  viewDetails(id: number): void {
    console.log('Xem chi tiết đơn ứng tuyển:', id);
    // Implement view details logic
  }
} 