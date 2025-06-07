import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../../services/application.service';
import { InterviewService } from '../../../services/interview.service';
import { JobService } from '../../../services/job.service';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>HR Dashboard</h1>
        <p>Tổng quan hoạt động tuyển dụng hôm nay</p>
      </div>

      <!-- Quick Stats -->
      <div class="stats-grid">
        <div class="stat-card applications">
          <div class="stat-icon">
            <i class="bi bi-file-text"></i>
          </div>
          <div class="stat-content">
            <h3>{{stats.totalApplications}}</h3>
            <p>Đơn ứng tuyển</p>
            <small class="stat-change positive" *ngIf="stats.applicationsChange > 0">
              <i class="bi bi-arrow-up"></i> +{{stats.applicationsChange}} từ hôm qua
            </small>
          </div>
          <a routerLink="/hr/applications" class="stat-link">Xem chi tiết →</a>
        </div>

        <div class="stat-card interviews">
          <div class="stat-icon">
            <i class="bi bi-calendar-check"></i>
          </div>
          <div class="stat-content">
            <h3>{{stats.todayInterviews}}</h3>
            <p>Phỏng vấn hôm nay</p>
            <small class="stat-change">
              {{stats.upcomingInterviews}} cuộc phỏng vấn sắp tới
            </small>
          </div>
          <a routerLink="/hr/interviews" class="stat-link">Xem lịch →</a>
        </div>

        <div class="stat-card candidates">
          <div class="stat-icon">
            <i class="bi bi-people"></i>
          </div>
          <div class="stat-content">
            <h3>{{stats.activeCandidates}}</h3>
            <p>Ứng viên đang xử lý</p>
            <small class="stat-change">
              {{stats.newCandidates}} ứng viên mới
            </small>
          </div>
          <a routerLink="/hr/candidates" class="stat-link">Quản lý →</a>
        </div>

        <div class="stat-card jobs">
          <div class="stat-icon">
            <i class="bi bi-briefcase"></i>
          </div>
          <div class="stat-content">
            <h3>{{stats.activeJobs}}</h3>
            <p>Vị trí đang tuyển</p>
            <small class="stat-change">
              {{stats.urgentJobs}} vị trí cần gấp
            </small>
          </div>
          <a routerLink="/hr/jobs" class="stat-link">Xem việc làm →</a>
        </div>
      </div>

      <div class="dashboard-content">
        <!-- Recent Applications -->
        <div class="dashboard-section">
          <div class="section-header">
            <h2>Đơn ứng tuyển mới nhất</h2>
            <a routerLink="/hr/applications" class="view-all-btn">Xem tất cả</a>
          </div>
          <div class="applications-list" *ngIf="recentApplications.length > 0; else noApplications">
            <div class="application-card" *ngFor="let application of recentApplications">
              <div class="candidate-info">
                <div class="candidate-avatar">
                  <i class="bi bi-person-circle"></i>
                </div>
                <div class="candidate-details">
                  <h4>{{application.candidateName}}</h4>
                  <p class="job-title">{{application.jobTitle}}</p>
                  <small class="application-date">
                    Ứng tuyển {{application.appliedDate | date:'dd/MM/yyyy HH:mm'}}
                  </small>
                </div>
              </div>
              <div class="application-status">
                <span class="status-badge" [ngClass]="getStatusClass(application.status)">
                  {{getStatusText(application.status)}}
                </span>
                <div class="application-actions">
                  <button class="btn-action view" (click)="viewApplication(application.id)">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="btn-action approve" (click)="approveApplication(application.id)">
                    <i class="bi bi-check-circle"></i>
                  </button>
                  <button class="btn-action reject" (click)="rejectApplication(application.id)">
                    <i class="bi bi-x-circle"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <ng-template #noApplications>
            <div class="empty-state">
              <i class="bi bi-file-text"></i>
              <p>Chưa có đơn ứng tuyển mới</p>
            </div>
          </ng-template>
        </div>

        <!-- Today's Interviews -->
        <div class="dashboard-section">
          <div class="section-header">
            <h2>Lịch phỏng vấn hôm nay</h2>
            <a routerLink="/hr/interviews" class="view-all-btn">Xem lịch đầy đủ</a>
          </div>
          <div class="interviews-list" *ngIf="todayInterviews.length > 0; else noInterviews">
            <div class="interview-card" *ngFor="let interview of todayInterviews">
              <div class="interview-time">
                <div class="time">{{interview.scheduledDate | date:'HH:mm'}}</div>
                <div class="duration">{{interview.duration}}p</div>
              </div>
              <div class="interview-info">
                <h4>{{interview.candidateName}}</h4>
                <p class="interview-type">{{interview.type}} - {{interview.jobTitle}}</p>
                <p class="interviewer">
                  <i class="bi bi-person"></i>
                  {{interview.interviewers[0]?.name}}
                  <span *ngIf="interview.interviewers.length > 1">
                    +{{interview.interviewers.length - 1}} người khác
                  </span>
                </p>
              </div>
              <div class="interview-actions">
                <button class="btn-action join" (click)="joinInterview(interview.id)">
                  <i class="bi bi-camera-video"></i>
                </button>
                <button class="btn-action reschedule" (click)="rescheduleInterview(interview.id)">
                  <i class="bi bi-calendar3"></i>
                </button>
              </div>
            </div>
          </div>
          <ng-template #noInterviews>
            <div class="empty-state">
              <i class="bi bi-calendar-check"></i>
              <p>Không có cuộc phỏng vấn nào hôm nay</p>
            </div>
          </ng-template>
        </div>

        <!-- Performance Chart -->
        <div class="dashboard-section">
          <div class="section-header">
            <h2>Hiệu suất tuyển dụng</h2>
            <select class="period-selector" [(ngModel)]="selectedPeriod" (change)="updateChart()">
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="90days">3 tháng qua</option>
            </select>
          </div>
          <div class="chart-container">
            <div class="performance-metrics">
              <div class="metric">
                <h4>{{chartData.totalApplications}}</h4>
                <p>Tổng đơn ứng tuyển</p>
              </div>
              <div class="metric">
                <h4>{{chartData.interviewsScheduled}}</h4>
                <p>Phỏng vấn đã lên lịch</p>
              </div>
              <div class="metric">
                <h4>{{chartData.offersExtended}}</h4>
                <p>Offer đã gửi</p>
              </div>
              <div class="metric">
                <h4>{{chartData.hiresCompleted}}</h4>
                <p>Tuyển dụng thành công</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="dashboard-section">
          <div class="section-header">
            <h2>Thao tác nhanh</h2>
          </div>
          <div class="quick-actions">
            <button class="action-btn schedule-interview" routerLink="/hr/interviews/new">
              <i class="bi bi-calendar-plus"></i>
              <span>Lên lịch phỏng vấn</span>
            </button>
            <button class="action-btn review-applications" routerLink="/hr/applications?status=New">
              <i class="bi bi-file-text"></i>
              <span>Xem đơn ứng tuyển mới</span>
            </button>
            <button class="action-btn add-candidate" routerLink="/hr/candidates/new">
              <i class="bi bi-person-plus"></i>
              <span>Thêm ứng viên</span>
            </button>
            <button class="action-btn generate-report" routerLink="/hr/reports">
              <i class="bi bi-graph-up"></i>
              <span>Tạo báo cáo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      color: #2c5282;
      margin: 0 0 0.5rem;
      font-size: 2rem;
    }

    .dashboard-header p {
      color: #6c757d;
      margin: 0;
      font-size: 1.1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .stat-card.applications::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: #007bff;
    }

    .stat-card.interviews::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: #28a745;
    }

    .stat-card.candidates::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: #ffc107;
    }

    .stat-card.jobs::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: #6f42c1;
    }

    .stat-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .stat-card.applications .stat-icon { color: #007bff; }
    .stat-card.interviews .stat-icon { color: #28a745; }
    .stat-card.candidates .stat-icon { color: #ffc107; }
    .stat-card.jobs .stat-icon { color: #6f42c1; }

    .stat-content h3 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
      color: #2c5282;
    }

    .stat-content p {
      color: #6c757d;
      margin: 0 0 0.5rem;
      font-size: 1.1rem;
    }

    .stat-change {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .stat-change.positive {
      color: #28a745;
    }

    .stat-link {
      color: #007bff;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      margin-top: 1rem;
      display: inline-block;
    }

    .stat-link:hover {
      text-decoration: underline;
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .dashboard-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .dashboard-section:nth-child(3),
    .dashboard-section:nth-child(4) {
      grid-column: 1 / -1;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      color: #2c5282;
      margin: 0;
      font-size: 1.3rem;
    }

    .view-all-btn {
      color: #007bff;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .view-all-btn:hover {
      text-decoration: underline;
    }

    .period-selector {
      padding: 0.5rem;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .application-card,
    .interview-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
    }

    .application-card:hover,
    .interview-card:hover {
      border-color: #007bff;
      background-color: #f8f9ff;
    }

    .candidate-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .candidate-avatar {
      font-size: 2.5rem;
      color: #6c757d;
    }

    .candidate-details h4 {
      margin: 0 0 0.25rem;
      color: #2c5282;
      font-size: 1.1rem;
    }

    .job-title {
      color: #6c757d;
      margin: 0 0 0.25rem;
      font-size: 0.9rem;
    }

    .application-date {
      color: #999;
      font-size: 0.8rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .status-badge.new { background: #e3f2fd; color: #1976d2; }
    .status-badge.reviewing { background: #fff3e0; color: #f57c00; }
    .status-badge.shortlisted { background: #e8f5e8; color: #388e3c; }
    .status-badge.rejected { background: #ffebee; color: #d32f2f; }

    .application-actions,
    .interview-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-action {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
    }

    .btn-action.view { background: #e3f2fd; color: #1976d2; }
    .btn-action.approve { background: #e8f5e8; color: #388e3c; }
    .btn-action.reject { background: #ffebee; color: #d32f2f; }
    .btn-action.join { background: #e8f5e8; color: #388e3c; }
    .btn-action.reschedule { background: #fff3e0; color: #f57c00; }

    .btn-action:hover {
      transform: scale(1.1);
    }

    .interview-time {
      text-align: center;
      min-width: 60px;
    }

    .interview-time .time {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2c5282;
    }

    .interview-time .duration {
      font-size: 0.8rem;
      color: #6c757d;
    }

    .interview-info {
      flex: 1;
      margin-left: 1rem;
    }

    .interview-info h4 {
      margin: 0 0 0.25rem;
      color: #2c5282;
      font-size: 1.1rem;
    }

    .interview-type {
      color: #6c757d;
      margin: 0 0 0.25rem;
      font-size: 0.9rem;
    }

    .interviewer {
      color: #999;
      margin: 0;
      font-size: 0.8rem;
    }

    .performance-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-top: 1rem;
    }

    .metric {
      text-align: center;
      padding: 1.5rem;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
    }

    .metric h4 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
      color: #2c5282;
    }

    .metric p {
      color: #6c757d;
      margin: 0;
      font-size: 0.9rem;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      background: white;
      color: #6c757d;
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .action-btn:hover {
      border-color: #007bff;
      color: #007bff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,123,255,0.15);
    }

    .action-btn i {
      font-size: 2rem;
    }

    .action-btn span {
      font-weight: 500;
      text-align: center;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #6c757d;
    }

    .empty-state i {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #dee2e6;
    }

    @media (max-width: 768px) {
      .dashboard-content {
        grid-template-columns: 1fr;
      }

      .dashboard-section:nth-child(3),
      .dashboard-section:nth-child(4) {
        grid-column: 1;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .application-card,
      .interview-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .candidate-info {
        width: 100%;
      }

      .application-actions,
      .interview-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  `]
})
export class HRDashboardComponent implements OnInit {
  stats = {
    totalApplications: 0,
    applicationsChange: 0,
    todayInterviews: 0,
    upcomingInterviews: 0,
    activeCandidates: 0,
    newCandidates: 0,
    activeJobs: 0,
    urgentJobs: 0
  };

  recentApplications: any[] = [];
  todayInterviews: any[] = [];
  selectedPeriod = '7days';
  
  chartData = {
    totalApplications: 0,
    interviewsScheduled: 0,
    offersExtended: 0,
    hiresCompleted: 0
  };

  constructor(
    private applicationService: ApplicationService,
    private interviewService: InterviewService,
    private jobService: JobService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load statistics
    this.applicationService.getApplicationStats().subscribe({
      next: (stats) => {
        this.stats = { ...this.stats, ...stats };
      },
      error: (error) => console.error('Error loading application stats:', error)
    });

    // Load recent applications
    this.applicationService.getApplicationsByStatus('New').subscribe({
      next: (applications) => {
        this.recentApplications = applications.slice(0, 5);
      },
      error: (error) => console.error('Error loading recent applications:', error)
    });

    // Load today's interviews
    const today = new Date().toISOString().split('T')[0];
    this.interviewService.getInterviewsByDate(today).subscribe({
      next: (interviews) => {
        this.todayInterviews = interviews;
      },
      error: (error) => console.error('Error loading today interviews:', error)
    });

    // Load chart data
    this.updateChart();
  }

  updateChart(): void {
    // Load performance data based on selected period
    // This would call a specific API endpoint for chart data
    this.chartData = {
      totalApplications: 156,
      interviewsScheduled: 45,
      offersExtended: 12,
      hiresCompleted: 8
    };
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'New': return 'new';
      case 'Reviewing': return 'reviewing';
      case 'Shortlisted': return 'shortlisted';
      case 'Rejected': return 'rejected';
      default: return 'new';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'New': return 'Mới';
      case 'Reviewing': return 'Đang xem xét';
      case 'Shortlisted': return 'Được chọn';
      case 'Interview': return 'Phỏng vấn';
      case 'Offered': return 'Đã offer';
      case 'Hired': return 'Đã tuyển';
      case 'Rejected': return 'Từ chối';
      default: return status;
    }
  }

  viewApplication(id: number): void {
    // Navigate to application detail
  }

  approveApplication(id: number): void {
    this.applicationService.updateApplicationStatus(id, 'Shortlisted').subscribe({
      next: () => {
        this.loadDashboardData();
      },
      error: (error) => console.error('Error approving application:', error)
    });
  }

  rejectApplication(id: number): void {
    this.applicationService.updateApplicationStatus(id, 'Rejected').subscribe({
      next: () => {
        this.loadDashboardData();
      },
      error: (error) => console.error('Error rejecting application:', error)
    });
  }

  joinInterview(id: number): void {
    // Join interview meeting
  }

  rescheduleInterview(id: number): void {
    // Show reschedule modal
  }
}