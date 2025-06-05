import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDashboardService } from '../../../services/user-dashboard.service';

@Component({
  selector: 'app-user-applications',
  template: `
    <div class="applications-container">
      <h2>Đơn ứng tuyển của bạn</h2>
      
      <!-- Hiển thị thông báo lỗi -->
      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
        <button (click)="loadApplications()">Thử lại</button>
      </div>

      <!-- Hiển thị loading -->
      <div *ngIf="isLoading" class="loading">
        Đang tải dữ liệu...
      </div>

      <!-- Hiển thị danh sách ứng tuyển -->
      <table *ngIf="applications.length > 0 && !isLoading && !errorMessage">
        <thead>
          <tr>
            <th>Công ty</th>
            <th>Vị trí</th>
            <th>Thời gian ứng tuyển</th>
            <th>Xác thực từ công ty</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let app of applications">
            <td>{{app.company}}</td>
            <td>{{app.position}}</td>
            <td>{{app.appliedAt | date:'dd/MM/yyyy HH:mm'}}</td>
            <td class="status-cell">
              <span *ngIf="app.verified" class="verified">&#10003;</span>
              <span *ngIf="!app.verified" class="not-verified">&#10007;</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Hiển thị khi không có dữ liệu -->
      <div *ngIf="applications.length === 0 && !isLoading && !errorMessage" class="no-data">
        <p>Bạn chưa ứng tuyển công ty nào.</p>
      </div>
    </div>
  `,
  styles: [`
    .applications-container { max-width: 900px; margin: 0 auto; padding: 2rem; }
    h2 { color: #2c3e50; margin-bottom: 2rem; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f5f6fa; color: #3498db; }
    .status-cell { text-align: center; }
    .verified { color: #27ae60; font-size: 1.5rem; }
    .not-verified { color: #e74c3c; font-size: 1.5rem; }
    .error-message { 
      background: #f8d7da; 
      color: #721c24; 
      padding: 1rem; 
      border-radius: 4px; 
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .error-message button {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    .error-message button:hover {
      background: #c82333;
    }
    .loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
    .no-data {
      text-align: center;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
      color: #666;
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class UserApplicationsComponent implements OnInit {
  applications: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private dashboardService: UserDashboardService) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.dashboardService.getRecentApplications().subscribe({
      next: (data) => {
        this.applications = data || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Không thể tải danh sách ứng tuyển. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Error loading applications:', error);
      }
    });
  }
} 