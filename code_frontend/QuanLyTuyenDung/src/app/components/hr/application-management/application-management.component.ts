import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';
import { Application } from '../../../models/application.model';

@Component({
  selector: 'app-application-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="application-management">
      <div class="page-header">
        <div class="header-content">
          <h1>Quản lý đơn ứng tuyển</h1>
          <p>Xem xét và quản lý tất cả đơn ứng tuyển</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline-primary" (click)="exportApplications()">
            <i class="bi bi-download"></i> Xuất Excel
          </button>
          <button class="btn btn-primary" (click)="showBulkActions = !showBulkActions">
            <i class="bi bi-check2-square"></i> Thao tác hàng loạt
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Trạng thái:</label>
          <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="form-select">
            <option value="">Tất cả</option>
            <option value="New">Mới</option>
            <option value="Reviewing">Đang xem xét</option>
            <option value="Shortlisted">Được chọn</option>
            <option value="Interview">Phỏng vấn</option>
            <option value="Offered">Đã offer</option>
            <option value="Hired">Đã tuyển</option>
            <option value="Rejected">Từ chối</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Công việc:</label>
          <select [(ngModel)]="selectedJob" (change)="applyFilters()" class="form-select">
            <option value="">Tất cả công việc</option>
            <option *ngFor="let job of availableJobs" [value]="job.id">{{job.title}}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Ngày ứng tuyển:</label>
          <input type="date" [(ngModel)]="dateFrom" (change)="applyFilters()" class="form-control">
          <span>đến</span>
          <input type="date" [(ngModel)]="dateTo" (change)="applyFilters()" class="form-control">
        </div>
        <div class="filter-group">
          <label>Tìm kiếm:</label>
          <div class="search-box">
            <input type="text" [(ngModel)]="searchQuery" (input)="onSearch()" 
                   placeholder="Tên ứng viên, email..." class="form-control">
            <i class="bi bi-search search-icon"></i>
          </div>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div class="bulk-actions" *ngIf="showBulkActions">
        <div class="bulk-controls">
          <label class="select-all">
            <input type="checkbox" 
                   [checked]="allSelected" 
                   (change)="toggleSelectAll($event)">
            Chọn tất cả ({{selectedApplications.length}})
          </label>
          <div class="bulk-buttons" *ngIf="selectedApplications.length > 0">
            <button class="btn btn-success" (click)="bulkApprove()">
              <i class="bi bi-check-circle"></i> Chấp nhận
            </button>
            <button class="btn btn-warning" (click)="bulkShortlist()">
              <i class="bi bi-star"></i> Shortlist
            </button>
            <button class="btn btn-danger" (click)="bulkReject()">
              <i class="bi bi-x-circle"></i> Từ chối
            </button>
          </div>
        </div>
      </div>

      <!-- Applications List -->
      <div class="applications-container" *ngIf="!loading; else loadingTemplate">
        <div class="applications-grid" *ngIf="filteredApplications.length > 0; else noApplications">
          <div class="application-card" *ngFor="let application of paginatedApplications" 
               [class.selected]="isSelected(application.id!)">
            
            <!-- Selection checkbox -->
            <div class="selection-checkbox" *ngIf="showBulkActions">
              <input type="checkbox" 
                     [checked]="isSelected(application.id!)"
                     (change)="toggleSelection(application.id!, $event)">
            </div>

            <!-- Candidate Info -->
            <div class="candidate-section">
              <div class="candidate-avatar">
                <i class="bi bi-person-circle"></i>
              </div>
              <div class="candidate-info">
                <h3>{{application.candidateName}}</h3>
                <p class="candidate-contact">
                  <i class="bi bi-envelope"></i> {{application.candidateEmail}}
                </p>
                <p class="candidate-contact">
                  <i class="bi bi-phone"></i> {{application.candidatePhone}}
                </p>
              </div>
            </div>

            <!-- Job Info -->
            <div class="job-section">
              <h4>{{application.jobTitle}}</h4>
              <p class="application-date">
                <i class="bi bi-calendar"></i>
                Ứng tuyển: {{application.appliedDate | date:'dd/MM/yyyy HH:mm'}}
              </p>
              <p class="application-source">
                <i class="bi bi-geo-alt"></i>
                Nguồn: {{application.source}}
              </p>
            </div>

            <!-- Status and Actions -->
            <div class="status-section">
              <div class="status-info">
                <span class="status-badge" [ngClass]="getStatusClass(application.status)">
                  {{getStatusText(application.status)}}
                </span>
                <div class="priority-badge" [ngClass]="application.priority.toLowerCase()">
                  {{application.priority}}
                </div>
              </div>
              
              <div class="application-actions">
                <button class="btn-action view" (click)="viewApplication(application)" 
                        title="Xem chi tiết">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn-action download" (click)="downloadResume(application)" 
                        title="Tải CV">
                  <i class="bi bi-download"></i>
                </button>
                <button class="btn-action interview" (click)="scheduleInterview(application)" 
                        title="Lên lịch phỏng vấn">
                  <i class="bi bi-calendar-plus"></i>
                </button>
                <div class="dropdown">
                  <button class="btn-action more" (click)="toggleDropdown(application.id!)" 
                          title="Thêm">
                    <i class="bi bi-three-dots"></i>
                  </button>
                  <div class="dropdown-menu" *ngIf="showDropdown === application.id!">
                    <button (click)="updateStatus(application, 'Shortlisted')">
                      <i class="bi bi-star"></i> Shortlist
                    </button>
                    <button (click)="updateStatus(application, 'Rejected')">
                      <i class="bi bi-x-circle"></i> Từ chối
                    </button>
                    <button (click)="addNote(application)">
                      <i class="bi bi-sticky"></i> Thêm ghi chú
                    </button>
                    <button (click)="assignToHR(application)">
                      <i class="bi bi-person-check"></i> Phân công
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Match Score -->
            <div class="match-section" *ngIf="application.matchPercentage">
              <div class="match-score">
                <div class="score-circle" [style.background]="getScoreColor(application.matchPercentage)">
                  {{application.matchPercentage}}%
                </div>
                <span>Phù hợp</span>
              </div>
            </div>

            <!-- Quick Info -->
            <div class="quick-info">
              <div class="info-item" *ngIf="application.expectedSalary">
                <i class="bi bi-currency-dollar"></i>
                <span>{{application.expectedSalary}}</span>
              </div>
              <div class="info-item" *ngIf="application.noticePeriod">
                <i class="bi bi-clock"></i>
                <span>{{application.noticePeriod}}</span>
              </div>
              <div class="info-item" *ngIf="application.tags.length > 0">
                <div class="tags">
                  <span class="tag" *ngFor="let tag of application.tags.slice(0, 2)">{{tag}}</span>
                  <span class="more-tags" *ngIf="application.tags.length > 2">
                    +{{application.tags.length - 2}}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-section" *ngIf="totalPages > 1">
          <div class="pagination-info">
            Hiển thị {{(currentPage - 1) * pageSize + 1}} - 
            {{Math.min(currentPage * pageSize, filteredApplications.length)}} 
            trong tổng số {{filteredApplications.length}} đơn ứng tuyển
          </div>
          <div class="pagination-controls">
            <button class="btn btn-outline-primary" 
                    [disabled]="currentPage === 1" 
                    (click)="changePage(currentPage - 1)">
              <i class="bi bi-chevron-left"></i> Trước
            </button>
            <span class="page-info">{{currentPage}} / {{totalPages}}</span>
            <button class="btn btn-outline-primary" 
                    [disabled]="currentPage === totalPages" 
                    (click)="changePage(currentPage + 1)">
              Sau <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

        <ng-template #noApplications>
          <div class="empty-state">
            <i class="bi bi-file-text"></i>
            <h3>Không tìm thấy đơn ứng tuyển</h3>
            <p>Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        </ng-template>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </ng-template>
    </div>

    <!-- Application Detail Modal -->
    <div class="modal" *ngIf="selectedApplication" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Chi tiết đơn ứng tuyển</h2>
          <button class="btn-close" (click)="closeModal()">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="modal-body">
          <!-- Application details will be shown here -->
          <div class="application-detail">
            <div class="detail-section">
              <h3>Thông tin ứng viên</h3>
              <p><strong>Họ tên:</strong> {{selectedApplication.candidateName}}</p>
              <p><strong>Email:</strong> {{selectedApplication.candidateEmail}}</p>
              <p><strong>Điện thoại:</strong> {{selectedApplication.candidatePhone}}</p>
            </div>
            <div class="detail-section">
              <h3>Thông tin công việc</h3>
              <p><strong>Vị trí:</strong> {{selectedApplication.jobTitle}}</p>
              <p><strong>Ngày ứng tuyển:</strong> {{selectedApplication.appliedDate | date:'dd/MM/yyyy HH:mm'}}</p>
              <p><strong>Trạng thái:</strong> {{getStatusText(selectedApplication.status)}}</p>
            </div>
            <!-- Add more details as needed -->
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeModal()">Đóng</button>
          <button class="btn btn-primary" (click)="scheduleInterview(selectedApplication)">
            Lên lịch phỏng vấn
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .application-management {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e9ecef;
    }

    .header-content h1 {
      color: #2c5282;
      margin: 0 0 0.5rem;
      font-size: 2rem;
    }

    .header-content p {
      color: #6c757d;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .filters-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      align-items: end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 500;
      color: #495057;
      font-size: 0.9rem;
    }

    .search-box {
      position: relative;
    }

    .search-icon {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
    }

    .bulk-actions {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      border: 1px solid #dee2e6;
    }

    .bulk-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .select-all {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }

    .bulk-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .applications-grid {
      display: grid;
      gap: 1.5rem;
    }

    .application-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      display: grid;
      grid-template-columns: auto 1fr auto auto auto;
      gap: 1.5rem;
      align-items: center;
      position: relative;
    }

    .application-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .application-card.selected {
      border: 2px solid #007bff;
      background-color: #f8f9ff;
    }

    .selection-checkbox {
      display: flex;
      align-items: center;
    }

    .candidate-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 250px;
    }

    .candidate-avatar {
      font-size: 3rem;
      color: #6c757d;
    }

    .candidate-info h3 {
      margin: 0 0 0.5rem;
      color: #2c5282;
      font-size: 1.2rem;
    }

    .candidate-contact {
      margin: 0.25rem 0;
      color: #6c757d;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .job-section {
      min-width: 200px;
    }

    .job-section h4 {
      margin: 0 0 0.5rem;
      color: #2c5282;
      font-size: 1.1rem;
    }

    .application-date,
    .application-source {
      margin: 0.25rem 0;
      color: #6c757d;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      min-width: 120px;
    }

    .status-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .status-badge {
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      text-align: center;
    }

    .status-badge.new { background: #e3f2fd; color: #1976d2; }
    .status-badge.reviewing { background: #fff3e0; color: #f57c00; }
    .status-badge.shortlisted { background: #e8f5e8; color: #388e3c; }
    .status-badge.interview { background: #f3e5f5; color: #7b1fa2; }
    .status-badge.offered { background: #e0f2f1; color: #00695c; }
    .status-badge.hired { background: #e8f5e8; color: #2e7d32; }
    .status-badge.rejected { background: #ffebee; color: #d32f2f; }

    .priority-badge {
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .priority-badge.low { background: #e8f5e8; color: #388e3c; }
    .priority-badge.medium { background: #fff3e0; color: #f57c00; }
    .priority-badge.high { background: #ffebee; color: #d32f2f; }
    .priority-badge.urgent { background: #fce4ec; color: #c2185b; }

    .application-actions {
      display: flex;
      gap: 0.5rem;
      position: relative;
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
    .btn-action.download { background: #e8f5e8; color: #388e3c; }
    .btn-action.interview { background: #fff3e0; color: #f57c00; }
    .btn-action.more { background: #f5f5f5; color: #6c757d; }

    .btn-action:hover {
      transform: scale(1.1);
    }

    .dropdown {
      position: relative;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 160px;
      z-index: 1000;
    }

    .dropdown-menu button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .dropdown-menu button:hover {
      background-color: #f8f9fa;
    }

    .match-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .match-score {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .score-circle {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .quick-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 150px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #6c757d;
    }

    .tags {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
    }

    .tag {
      background: #f8f9fa;
      color: #6c757d;
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
      font-size: 0.7rem;
    }

    .more-tags {
      background: #e9ecef;
      color: #6c757d;
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
      font-size: 0.7rem;
    }

    .pagination-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .page-info {
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6c757d;
    }

    .empty-state i {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: #dee2e6;
    }

    .empty-state h3 {
      margin-bottom: 0.5rem;
    }

    .loading-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #dee2e6;
    }

    .modal-header h2 {
      margin: 0;
      color: #2c5282;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6c757d;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #dee2e6;
    }

    .detail-section {
      margin-bottom: 1.5rem;
    }

    .detail-section h3 {
      color: #2c5282;
      margin-bottom: 0.5rem;
    }

    .detail-section p {
      margin: 0.25rem 0;
    }

    /* Form Styles */
    .form-control, .form-select {
      padding: 0.5rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .form-control:focus, .form-select:focus {
      border-color: #80bdff;
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn-outline-primary {
      background: white;
      color: #007bff;
      border: 1px solid #007bff;
    }

    .btn-outline-primary:hover {
      background: #007bff;
      color: white;
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-warning {
      background: #ffc107;
      color: #212529;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .application-card {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .candidate-section,
      .job-section,
      .status-section,
      .match-section,
      .quick-info {
        min-width: auto;
      }

      .application-actions {
        justify-content: center;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 1rem;
      }

      .filters-section {
        grid-template-columns: 1fr;
      }

      .bulk-controls {
        flex-direction: column;
        gap: 1rem;
      }

      .pagination-section {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class ApplicationManagementComponent implements OnInit {
  applications: Application[] = [];
  filteredApplications: Application[] = [];
  paginatedApplications: Application[] = [];
  availableJobs: any[] = [];
  selectedApplication: Application | null = null;

  // Filters
  selectedStatus = '';
  selectedJob = '';
  dateFrom = '';
  dateTo = '';
  searchQuery = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // UI State
  loading = true;
  showBulkActions = false;
  selectedApplications: number[] = [];
  allSelected = false;
  showDropdown: number | null = null;

  constructor(private applicationService: ApplicationService) { }

  ngOnInit(): void {
    this.loadApplications();
    this.loadAvailableJobs();
  }

  loadApplications(): void {
    this.loading = true;
    this.applicationService.getAllApplications().subscribe({
      next: (applications) => {
        this.applications = applications;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.loading = false;
      }
    });
  }

  loadAvailableJobs(): void {
    // Load jobs for filter dropdown
    // This would call JobService.getAllJobs()
    this.availableJobs = [
      { id: 1, title: 'Frontend Developer' },
      { id: 2, title: 'Backend Developer' },
      { id: 3, title: 'Full Stack Developer' }
    ];
  }

  applyFilters(): void {
    let filtered = [...this.applications];

    if (this.selectedStatus) {
      filtered = filtered.filter(app => app.status === this.selectedStatus);
    }

    if (this.selectedJob) {
      filtered = filtered.filter(app => app.jobId.toString() === this.selectedJob);
    }

    if (this.dateFrom) {
      const fromDate = new Date(this.dateFrom);
      filtered = filtered.filter(app => new Date(app.appliedDate) >= fromDate);
    }

    if (this.dateTo) {
      const toDate = new Date(this.dateTo);
      filtered = filtered.filter(app => new Date(app.appliedDate) <= toDate);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.candidateName.toLowerCase().includes(query) ||
        app.candidateEmail.toLowerCase().includes(query) ||
        app.jobTitle.toLowerCase().includes(query)
      );
    }

    this.filteredApplications = filtered;
    this.updatePagination();
  }

  onSearch(): void {
    this.applyFilters();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredApplications.length / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedApplications();
  }

  updatePaginatedApplications(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedApplications = this.filteredApplications.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedApplications();
  }

  // Selection methods
  toggleSelectAll(event: any): void {
    this.allSelected = event.target.checked;
    if (this.allSelected) {
      this.selectedApplications = this.filteredApplications.map(app => app.id!);
    } else {
      this.selectedApplications = [];
    }
  }

  toggleSelection(applicationId: number, event: any): void {
    if (event.target.checked) {
      this.selectedApplications.push(applicationId);
    } else {
      this.selectedApplications = this.selectedApplications.filter(id => id !== applicationId);
    }
    this.allSelected = this.selectedApplications.length === this.filteredApplications.length;
  }

  isSelected(applicationId: number): boolean {
    return this.selectedApplications.includes(applicationId);
  }

  // Bulk actions
  bulkApprove(): void {
    if (confirm('Bạn có chắc chắn muốn chấp nhận các đơn ứng tuyển đã chọn?')) {
      this.applicationService.bulkUpdateStatus(this.selectedApplications, 'Shortlisted').subscribe({
        next: () => {
          this.loadApplications();
          this.selectedApplications = [];
          this.allSelected = false;
        },
        error: (error) => console.error('Error bulk approving:', error)
      });
    }
  }

  bulkShortlist(): void {
    if (confirm('Bạn có chắc chắn muốn shortlist các đơn ứng tuyển đã chọn?')) {
      this.applicationService.bulkUpdateStatus(this.selectedApplications, 'Shortlisted').subscribe({
        next: () => {
          this.loadApplications();
          this.selectedApplications = [];
          this.allSelected = false;
        },
        error: (error) => console.error('Error bulk shortlisting:', error)
      });
    }
  }

  bulkReject(): void {
    if (confirm('Bạn có chắc chắn muốn từ chối các đơn ứng tuyển đã chọn?')) {
      this.applicationService.bulkUpdateStatus(this.selectedApplications, 'Rejected').subscribe({
        next: () => {
          this.loadApplications();
          this.selectedApplications = [];
          this.allSelected = false;
        },
        error: (error) => console.error('Error bulk rejecting:', error)
      });
    }
  }

  // Individual actions
  viewApplication(application: Application): void {
    this.selectedApplication = application;
  }

  downloadResume(application: Application): void {
    if (application.resumeUrl) {
      window.open(application.resumeUrl, '_blank');
    }
  }

  scheduleInterview(application: Application): void {
    // Navigate to interview scheduling
    console.log('Schedule interview for:', application.candidateName);
  }

  updateStatus(application: Application, status: string): void {
    this.applicationService.updateApplicationStatus(application.id!, status).subscribe({
      next: () => {
        this.loadApplications();
        this.showDropdown = null;
      },
      error: (error) => console.error('Error updating status:', error)
    });
  }

  addNote(application: Application): void {
    const note = prompt('Thêm ghi chú cho ứng viên:');
    if (note) {
      this.applicationService.addHRNote(application.id!, note).subscribe({
        next: () => {
          this.loadApplications();
          this.showDropdown = null;
        },
        error: (error) => console.error('Error adding note:', error)
      });
    }
  }

  assignToHR(application: Application): void {
    // Show HR selection modal
    console.log('Assign to HR:', application.candidateName);
    this.showDropdown = null;
  }

  toggleDropdown(applicationId: number): void {
    this.showDropdown = this.showDropdown === applicationId ? null : applicationId;
  }

  exportApplications(): void {
    this.applicationService.exportApplications('excel').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'applications.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Error exporting:', error)
    });
  }

  closeModal(): void {
    this.selectedApplication = null;
  }

  // Utility methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'New': return 'new';
      case 'Reviewing': return 'reviewing';
      case 'Shortlisted': return 'shortlisted';
      case 'Interview': return 'interview';
      case 'Offered': return 'offered';
      case 'Hired': return 'hired';
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

  getScoreColor(score: number): string {
    if (score >= 80) return 'linear-gradient(45deg, #4caf50, #8bc34a)';
    if (score >= 60) return 'linear-gradient(45deg, #ff9800, #ffc107)';
    return 'linear-gradient(45deg, #f44336, #ff5722)';
  }

  Math = Math; // Expose Math to template
}