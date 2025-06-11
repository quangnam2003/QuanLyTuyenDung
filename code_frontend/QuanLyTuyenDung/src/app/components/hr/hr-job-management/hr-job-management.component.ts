import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { ApplicationService } from '../../../services/application.service';
import { Job } from '../../../models/job.model';

@Component({
  selector: 'app-hr-job-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="hr-job-management">
      <div class="page-header">
        <div class="header-content">
          <h1>Quản lý công việc tuyển dụng</h1>
          <p>Quản lý các vị trí tuyển dụng và theo dõi tiến độ</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline-primary" (click)="exportJobs()">
            <i class="bi bi-download"></i> Xuất báo cáo
          </button>
          <button class="btn btn-primary" (click)="showCreateModal = true">
            <i class="bi bi-plus-circle"></i> Tạo việc làm mới
          </button>
        </div>
      </div>

      <!-- Job Statistics -->
      <div class="job-stats">
        <div class="stat-card active">
          <div class="stat-icon">
            <i class="bi bi-briefcase"></i>
          </div>
          <div class="stat-content">
            <h3>{{jobStats.activeJobs}}</h3>
            <p>Đang tuyển dụng</p>
            <small class="trend">+{{jobStats.newJobsThisMonth}} tháng này</small>
          </div>
        </div>
        <div class="stat-card applications">
          <div class="stat-icon">
            <i class="bi bi-file-text"></i>
          </div>
          <div class="stat-content">
            <h3>{{jobStats.totalApplications}}</h3>
            <p>Tổng ứng tuyển</p>
            <small class="trend">+{{jobStats.newApplicationsToday}} hôm nay</small>
          </div>
        </div>
        <div class="stat-card urgent">
          <div class="stat-icon">
            <i class="bi bi-exclamation-triangle"></i>
          </div>
          <div class="stat-content">
            <h3>{{jobStats.urgentJobs}}</h3>
            <p>Cần ưu tiên</p>
            <small class="trend">Deadline sắp hết</small>
          </div>
        </div>
        <div class="stat-card filled">
          <div class="stat-icon">
            <i class="bi bi-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>{{jobStats.filledJobs}}</h3>
            <p>Đã hoàn thành</p>
            <small class="trend">{{jobStats.fillRate}}% tỷ lệ thành công</small>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="search-container">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" [(ngModel)]="searchQuery" (input)="onSearch()" 
                   placeholder="Tìm kiếm theo tên công việc, phòng ban...">
          </div>
          <button class="btn btn-outline-primary" (click)="showFilters = !showFilters">
            <i class="bi bi-funnel"></i> Lọc
          </button>
        </div>

        <div class="filter-options" *ngIf="showFilters">
          <div class="filter-grid">
            <div class="filter-group">
              <label>Trạng thái:</label>
              <select [(ngModel)]="filters.status" (change)="applyFilters()" class="form-select">
                <option value="">Tất cả</option>
                <option value="Active">Đang tuyển</option>
                <option value="Closed">Đã đóng</option>
                <option value="Draft">Bản nháp</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Phòng ban:</label>
              <select [(ngModel)]="filters.department" (change)="applyFilters()" class="form-select">
                <option value="">Tất cả</option>
                <option value="IT">IT</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Loại hình:</label>
              <select [(ngModel)]="filters.type" (change)="applyFilters()" class="form-select">
                <option value="">Tất cả</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Độ ưu tiên:</label>
              <select [(ngModel)]="filters.priority" (change)="applyFilters()" class="form-select">
                <option value="">Tất cả</option>
                <option value="High">Cao</option>
                <option value="Medium">Trung bình</option>
                <option value="Low">Thấp</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Jobs List -->
      <div class="jobs-container" *ngIf="!loading; else loadingTemplate">
        <div class="jobs-grid" *ngIf="filteredJobs.length > 0; else noJobs">
          <div class="job-card" *ngFor="let job of paginatedJobs" [class]="getJobCardClass(job)">
            <div class="job-header">
              <div class="job-title-section">
                <h3>{{job.title}}</h3>
                <div class="job-meta">
                  <span class="department">{{job.department}}</span>
                  <span class="job-type">{{job.type}}</span>
                  <span class="priority-badge" [class]="getPriorityClass(job)">
                    {{getPriorityText(job)}}
                  </span>
                </div>
              </div>
              <div class="job-actions">
                <button class="btn-action view" (click)="viewJob(job)" title="Xem chi tiết">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn-action edit" (click)="editJob(job)" title="Chỉnh sửa">
                  <i class="bi bi-pencil"></i>
                </button>
                <div class="dropdown">
                  <button class="btn-action more" (click)="toggleDropdown(job.id!)" title="Thêm">
                    <i class="bi bi-three-dots"></i>
                  </button>
                  <div class="dropdown-menu" *ngIf="showDropdown === job.id!">
                    <button (click)="duplicateJob(job)">
                      <i class="bi bi-files"></i> Sao chép
                    </button>
                    <button (click)="toggleJobStatus(job)">
                      <i class="bi bi-power"></i> 
                      {{job.status === 'Active' ? 'Tạm dừng' : 'Kích hoạt'}}
                    </button>
                    <button (click)="archiveJob(job)">
                      <i class="bi bi-archive"></i> Lưu trữ
                    </button>
                    <button (click)="deleteJob(job)" class="danger">
                      <i class="bi bi-trash"></i> Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="job-content">
              <div class="job-info">
                <p class="job-description">{{job.description | slice:0:150}}...</p>
                <div class="job-details">
                  <div class="detail-item">
                    <i class="bi bi-geo-alt"></i>
                    <span>{{job.location}}</span>
                  </div>
                  <div class="detail-item">
                    <i class="bi bi-currency-dollar"></i>
                    <span>{{job.salary}}</span>
                  </div>
                  <div class="detail-item">
                    <i class="bi bi-calendar"></i>
                    <span>Deadline: {{job.applicationDeadline | date:'dd/MM/yyyy'}}</span>
                  </div>
                </div>
              </div>

              <div class="job-stats-section">
                <div class="application-stats">
                  <h4>Ứng tuyển</h4>
                  <div class="stats-numbers">
                    <div class="stat-number">
                      <span class="number">{{getJobApplicationCount(job.id!)}}</span>
                      <span class="label">Tổng</span>
                    </div>
                    <div class="stat-number">
                      <span class="number">{{getJobShortlistedCount(job.id!)}}</span>
                      <span class="label">Shortlist</span>
                    </div>
                    <div class="stat-number">
                      <span class="number">{{getJobInterviewCount(job.id!)}}</span>
                      <span class="label">Phỏng vấn</span>
                    </div>
                  </div>
                </div>

                <div class="progress-section">
                  <h4>Tiến độ tuyển dụng</h4>
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width]="getJobProgress(job.id!) + '%'"></div>
                  </div>
                  <div class="progress-text">
                    {{getJobHiredCount(job.id!)}}/{{job.numberOfPositions}} vị trí
                  </div>
                </div>
              </div>
            </div>

            <div class="job-footer">
              <div class="job-status">
                <span class="status-badge" [class]="getStatusClass(job.status)">
                  {{getStatusText(job.status)}}
                </span>
                <span class="days-remaining" [class]="getDaysRemainingClass(job)">
                  {{getDaysRemaining(job)}}
                </span>
              </div>
              <div class="job-footer-actions">
                <button class="btn btn-outline-primary" (click)="viewApplications(job)">
                  <i class="bi bi-file-text"></i> Xem ứng tuyển
                </button>
                <button class="btn btn-primary" (click)="scheduleInterview(job)">
                  <i class="bi bi-calendar-plus"></i> Lên lịch PV
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-section" *ngIf="totalPages > 1">
          <div class="pagination-info">
            Hiển thị {{(currentPage - 1) * pageSize + 1}} - 
            {{Math.min(currentPage * pageSize, filteredJobs.length)}} 
            trong tổng số {{filteredJobs.length}} công việc
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

        <ng-template #noJobs>
          <div class="empty-state">
            <i class="bi bi-briefcase"></i>
            <h3>Không có công việc nào</h3>
            <p>Bắt đầu bằng cách tạo vị trí tuyển dụng đầu tiên</p>
            <button class="btn btn-primary" (click)="showCreateModal = true">
              <i class="bi bi-plus-circle"></i> Tạo việc làm mới
            </button>
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

    <!-- Create/Edit Job Modal -->
    <div class="modal" *ngIf="showCreateModal || showEditModal" (click)="closeModal()">
      <div class="modal-content large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{showCreateModal ? 'Tạo việc làm mới' : 'Chỉnh sửa việc làm'}}</h2>
          <button class="btn-close" (click)="closeModal()">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="modal-body">
          <form [formGroup]="jobForm" (ngSubmit)="saveJob()">
            <!-- Basic Information -->
            <div class="form-section">
              <h3>Thông tin cơ bản</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Tiêu đề công việc *</label>
                  <input type="text" formControlName="title" class="form-control" required>
                </div>
                <div class="form-group">
                  <label>Phòng ban *</label>
                  <select formControlName="department" class="form-select" required>
                    <option value="">Chọn phòng ban</option>
                    <option value="IT">IT</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Loại hình *</label>
                  <select formControlName="type" class="form-select" required>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Số lượng cần tuyển *</label>
                  <input type="number" formControlName="numberOfPositions" 
                         class="form-control" min="1" required>
                </div>
                <div class="form-group">
                  <label>Địa điểm *</label>
                  <input type="text" formControlName="location" class="form-control" required>
                </div>
                <div class="form-group">
                  <label>Mức lương *</label>
                  <input type="text" formControlName="salary" class="form-control" required>
                </div>
                <div class="form-group">
                  <label>Hạn ứng tuyển *</label>
                  <input type="date" formControlName="applicationDeadline" 
                         class="form-control" required>
                </div>
                <div class="form-group">
                  <label>Độ ưu tiên</label>
                  <select formControlName="priority" class="form-select">
                    <option value="Low">Thấp</option>
                    <option value="Medium">Trung bình</option>
                    <option value="High">Cao</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Job Description -->
            <div class="form-section">
              <h3>Mô tả công việc</h3>
              <div class="form-group">
                <label>Mô tả *</label>
                <textarea formControlName="description" class="form-control" 
                          rows="4" required placeholder="Mô tả chi tiết về công việc..."></textarea>
              </div>
              <div class="form-group">
                <label>Yêu cầu *</label>
                <textarea formControlName="requirements" class="form-control" 
                          rows="4" required placeholder="Yêu cầu về kinh nghiệm, kỹ năng..."></textarea>
              </div>
              <div class="form-group">
                <label>Quyền lợi</label>
                <textarea formControlName="benefits" class="form-control" 
                          rows="3" placeholder="Các quyền lợi và phúc lợi..."></textarea>
              </div>
            </div>

            <!-- Additional Requirements -->
            <div class="form-section">
              <h3>Yêu cầu bổ sung</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Kinh nghiệm yêu cầu</label>
                  <select formControlName="experienceRequired" class="form-select">
                    <option value="">Không yêu cầu</option>
                    <option value="0-1 years">0-1 năm</option>
                    <option value="1-3 years">1-3 năm</option>
                    <option value="3-5 years">3-5 năm</option>
                    <option value="5+ years">5+ năm</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Học vấn yêu cầu</label>
                  <select formControlName="education" class="form-select">
                    <option value="">Không yêu cầu</option>
                    <option value="High School">Trung học</option>
                    <option value="Bachelor">Cử nhân</option>
                    <option value="Master">Thạc sĩ</option>
                    <option value="PhD">Tiến sĩ</option>
                  </select>
                </div>
                <div class="form-group full-width">
                  <label>Kỹ năng yêu cầu</label>
                  <input type="text" formControlName="skills" class="form-control"
                         placeholder="JavaScript, Angular, Node.js (phân cách bằng dấu phẩy)">
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>
          <button type="button" class="btn btn-outline-primary" (click)="saveDraft()">
            Lưu nháp
          </button>
          <button type="submit" class="btn btn-primary" 
                  [disabled]="!jobForm.valid" 
                  (click)="saveJob()">
            {{showCreateModal ? 'Tạo việc làm' : 'Cập nhật'}}
          </button>
        </div>
      </div>
    </div>

    <!-- Job Detail Modal -->
    <div class="modal" *ngIf="selectedJob" (click)="closeDetailModal()">
      <div class="modal-content extra-large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{selectedJob.title}}</h2>
          <button class="btn-close" (click)="closeDetailModal()">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="job-detail-tabs">
            <button class="tab-btn" [class.active]="activeTab === 'overview'" 
                    (click)="setActiveTab('overview')">
              Tổng quan
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'applications'" 
                    (click)="setActiveTab('applications')">
              Ứng tuyển ({{getJobApplicationCount(selectedJob.id!)}})
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'analytics'" 
                    (click)="setActiveTab('analytics')">
              Phân tích
            </button>
          </div>

          <!-- Overview Tab -->
          <div class="tab-content" *ngIf="activeTab === 'overview'">
            <div class="job-detail-grid">
              <div class="detail-section">
                <h3>Thông tin cơ bản</h3>
                <p><strong>Phòng ban:</strong> {{selectedJob.department}}</p>
                <p><strong>Loại hình:</strong> {{selectedJob.type}}</p>
                <p><strong>Số lượng:</strong> {{selectedJob.numberOfPositions}} vị trí</p>
                <p><strong>Địa điểm:</strong> {{selectedJob.location}}</p>
                <p><strong>Mức lương:</strong> {{selectedJob.salary}}</p>
                <p><strong>Hạn ứng tuyển:</strong> {{selectedJob.applicationDeadline | date:'dd/MM/yyyy'}}</p>
              </div>

              <div class="detail-section">
                <h3>Mô tả công việc</h3>
                <p>{{selectedJob.description}}</p>
              </div>

              <div class="detail-section">
                <h3>Yêu cầu</h3>
                <p>{{selectedJob.requirements}}</p>
              </div>

              <div class="detail-section" *ngIf="selectedJob.benefits">
                <h3>Quyền lợi</h3>
                <p>{{selectedJob.benefits}}</p>
              </div>

              <div class="detail-section" *ngIf="selectedJob.skills.length > 0">
                <h3>Kỹ năng yêu cầu</h3>
                <div class="skills-list">
                  <span class="skill-tag" *ngFor="let skill of selectedJob.skills">
                    {{skill}}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Applications Tab -->
          <div class="tab-content" *ngIf="activeTab === 'applications'">
            <div class="applications-summary">
              <div class="summary-stats">
                <div class="summary-stat">
                  <h4>{{getJobApplicationCount(selectedJob.id!)}}</h4>
                  <p>Tổng ứng tuyển</p>
                </div>
                <div class="summary-stat">
                  <h4>{{getJobShortlistedCount(selectedJob.id!)}}</h4>
                  <p>Shortlisted</p>
                </div>
                <div class="summary-stat">
                  <h4>{{getJobInterviewCount(selectedJob.id!)}}</h4>
                  <p>Phỏng vấn</p>
                </div>
                <div class="summary-stat">
                  <h4>{{getJobHiredCount(selectedJob.id!)}}</h4>
                  <p>Đã tuyển</p>
                </div>
              </div>
            </div>
            <button class="btn btn-primary" (click)="viewApplications(selectedJob)">
              Xem tất cả ứng tuyển
            </button>
          </div>

          <!-- Analytics Tab -->
          <div class="tab-content" *ngIf="activeTab === 'analytics'">
            <div class="analytics-grid">
              <div class="analytics-card">
                <h4>Tỷ lệ chuyển đổi</h4>
                <div class="conversion-rate">
                  <div class="rate-item">
                    <span class="rate">{{getConversionRate(selectedJob.id!, 'applied_to_shortlisted')}}%</span>
                    <span class="label">Ứng tuyển → Shortlist</span>
                  </div>
                  <div class="rate-item">
                    <span class="rate">{{getConversionRate(selectedJob.id!, 'shortlisted_to_interview')}}%</span>
                    <span class="label">Shortlist → Phỏng vấn</span>
                  </div>
                  <div class="rate-item">
                    <span class="rate">{{getConversionRate(selectedJob.id!, 'interview_to_hired')}}%</span>
                    <span class="label">Phỏng vấn → Tuyển dụng</span>
                  </div>
                </div>
              </div>

              <div class="analytics-card">
                <h4>Hiệu suất</h4>
                <p><strong>Thời gian trung bình:</strong> {{getAverageTimeToHire(selectedJob.id!)}} ngày</p>
                <p><strong>Lượt xem:</strong> {{selectedJob.viewCount || 0}}</p>
                <p><strong>Tỷ lệ ứng tuyển:</strong> {{getApplicationRate(selectedJob.id!)}}%</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeDetailModal()">Đóng</button>
          <button class="btn btn-outline-primary" (click)="viewApplications(selectedJob)">
            <i class="bi bi-file-text"></i> Xem ứng tuyển
          </button>
          <button class="btn btn-warning" (click)="editJob(selectedJob)">
            <i class="bi bi-pencil"></i> Chỉnh sửa
          </button>
          <button class="btn btn-primary" (click)="scheduleInterview(selectedJob)">
            <i class="bi bi-calendar-plus"></i> Lên lịch phỏng vấn
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hr-job-management {
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

    /* Job Statistics */
    .job-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
    }

    .stat-card.active::before { background: #28a745; }
    .stat-card.applications::before { background: #007bff; }
    .stat-card.urgent::before { background: #ffc107; }
    .stat-card.filled::before { background: #6f42c1; }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .stat-card.active .stat-icon {
      background: #d4edda;
      color: #28a745;
    }

    .stat-card.applications .stat-icon {
      background: #cce5ff;
      color: #007bff;
    }

    .stat-card.urgent .stat-icon {
      background: #fff3cd;
      color: #ffc107;
    }

    .stat-card.filled .stat-icon {
      background: #e2d9f3;
      color: #6f42c1;
    }

    .stat-content h3 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.25rem;
      color: #2c5282;
    }

    .stat-content p {
      color: #6c757d;
      margin: 0 0 0.25rem;
      font-size: 0.9rem;
    }

    .trend {
      font-size: 0.8rem;
      color: #28a745;
    }

    /* Filters Section */
    .filters-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .search-container {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    .search-box {
      flex: 1;
      position: relative;
    }

    .search-box i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
    }

    .search-box input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 1px solid #ced4da;
      border-radius: 8px;
      font-size: 1rem;
    }

    .filter-options {
      border-top: 1px solid #e9ecef;
      padding-top: 1rem;
    }

    .filter-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
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

    /* Jobs Grid */
    .jobs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }

    .job-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      overflow: hidden;
      border-left: 4px solid #e9ecef;
    }

    .job-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .job-card.high-priority {
      border-left-color: #dc3545;
    }

    .job-card.urgent {
      border-left-color: #ffc107;
    }

    .job-card.filled {
      border-left-color: #28a745;
    }

    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem 1.5rem 1rem;
      background: #f8f9fa;
    }

    .job-title-section h3 {
      margin: 0 0 0.5rem;
      color: #2c5282;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .job-meta {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .department {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    .job-type {
      background: #f3e5f5;
      color: #7b1fa2;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    .priority-badge {
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .priority-badge.high {
      background: #ffebee;
      color: #d32f2f;
    }

    .priority-badge.medium {
      background: #fff3e0;
      color: #f57c00;
    }

    .priority-badge.low {
      background: #e8f5e8;
      color: #388e3c;
    }

    .job-actions {
      display: flex;
      gap: 0.5rem;
      position: relative;
    }

    .btn-action {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f8f9fa;
      color: #6c757d;
    }

    .btn-action:hover {
      transform: scale(1.1);
      background: #007bff;
      color: white;
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
      font-size: 0.9rem;
    }

    .dropdown-menu button:hover {
      background: #f8f9fa;
    }

    .dropdown-menu button.danger {
      color: #dc3545;
    }

    .job-content {
      padding: 1.5rem;
    }

    .job-description {
      color: #495057;
      margin: 0 0 1rem;
      line-height: 1.5;
    }

    .job-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .job-stats-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin: 1rem 0;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .application-stats h4,
    .progress-section h4 {
      margin: 0 0 0.75rem;
      color: #2c5282;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .stats-numbers {
      display: flex;
      gap: 1rem;
    }

    .stat-number {
      text-align: center;
    }

    .stat-number .number {
      display: block;
      font-size: 1.2rem;
      font-weight: 700;
      color: #2c5282;
    }

    .stat-number .label {
      font-size: 0.8rem;
      color: #6c757d;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #28a745, #20c997);
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 0.8rem;
      color: #6c757d;
      text-align: center;
    }

    .job-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
    }

    .job-status {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .status-badge.active {
      background: #d4edda;
      color: #28a745;
    }

    .status-badge.closed {
      background: #f8d7da;
      color: #dc3545;
    }

    .status-badge.draft {
      background: #fff3cd;
      color: #ffc107;
    }

    .days-remaining {
      font-size: 0.8rem;
    }

    .days-remaining.urgent {
      color: #dc3545;
      font-weight: 600;
    }

    .days-remaining.warning {
      color: #ffc107;
    }

    .days-remaining.normal {
      color: #6c757d;
    }

    .job-footer-actions {
      display: flex;
      gap: 0.5rem;
    }

    /* Pagination */
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

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6c757d;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .empty-state i {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: #dee2e6;
    }

    .empty-state h3 {
      margin-bottom: 0.5rem;
    }

    /* Loading State */
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

    /* Modal Styles */
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
      border-radius: 12px;
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-content.large {
      max-width: 900px;
    }

    .modal-content.extra-large {
      max-width: 1200px;
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

    /* Form Styles */
    .form-section {
      margin-bottom: 2rem;
    }

    .form-section h3 {
      color: #2c5282;
      margin-bottom: 1rem;
      font-size: 1.1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e9ecef;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-weight: 500;
      color: #495057;
    }

    .form-control, .form-select {
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-control:focus, .form-select:focus {
      border-color: #80bdff;
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
    }

    /* Job Detail Styles */
    .job-detail-tabs {
      display: flex;
      border-bottom: 1px solid #dee2e6;
      margin-bottom: 1.5rem;
    }

    .tab-btn {
      padding: 1rem 1.5rem;
      border: none;
      background: transparent;
      color: #6c757d;
      cursor: pointer;
      transition: all 0.3s ease;
      border-bottom: 2px solid transparent;
    }

    .tab-btn.active {
      color: #007bff;
      border-bottom-color: #007bff;
    }

    .tab-btn:hover:not(.active) {
      color: #495057;
    }

    .tab-content {
      min-height: 400px;
    }

    .job-detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .detail-section {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
    }

    .detail-section h3 {
      color: #2c5282;
      margin: 0 0 1rem;
      font-size: 1.1rem;
    }

    .detail-section p {
      margin: 0.5rem 0;
      line-height: 1.6;
    }

    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .skill-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .applications-summary {
      margin-bottom: 2rem;
    }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .summary-stat {
      text-align: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .summary-stat h4 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
      color: #2c5282;
    }

    .summary-stat p {
      color: #6c757d;
      margin: 0;
      font-size: 0.9rem;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .analytics-card {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
    }

    .analytics-card h4 {
      color: #2c5282;
      margin: 0 0 1rem;
      font-size: 1.1rem;
    }

    .conversion-rate {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .rate-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .rate-item .rate {
      font-size: 1.2rem;
      font-weight: 600;
      color: #28a745;
    }

    .rate-item .label {
      color: #6c757d;
      font-size: 0.9rem;
    }

    /* Buttons */
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
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

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-warning {
      background: #ffc107;
      color: #212529;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .jobs-grid {
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 1rem;
      }

      .search-container {
        flex-direction: column;
      }

      .filter-grid {
        grid-template-columns: 1fr;
      }

      .jobs-grid {
        grid-template-columns: 1fr;
      }

      .job-stats-section {
        grid-template-columns: 1fr;
      }

      .job-footer {
        flex-direction: column;
        gap: 1rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .job-detail-grid {
        grid-template-columns: 1fr;
      }

      .job-detail-tabs {
        flex-wrap: wrap;
      }

      .modal-content {
        width: 95%;
        margin: 1rem;
      }
    }
  `]
})
export class HRJobManagementComponent implements OnInit {
  // Data
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  paginatedJobs: Job[] = [];
  selectedJob: Job | null = null;

  // UI State
  loading = true;
  showFilters = false;
  showCreateModal = false;
  showEditModal = false;
  showDropdown: number | null = null;
  activeTab = 'overview';

  // Search and Filters
  searchQuery = '';
  filters = {
    status: '',
    department: '',
    type: '',
    priority: ''
  };

  // Pagination
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;

  // Statistics
  jobStats = {
    activeJobs: 0,
    totalApplications: 0,
    urgentJobs: 0,
    filledJobs: 0,
    newJobsThisMonth: 0,
    newApplicationsToday: 0,
    fillRate: 0
  };

  // Form
  jobForm: FormGroup;

  // Mock application data
  mockApplications: any[] = [];

  constructor(
    private jobService: JobService,
    private applicationService: ApplicationService,
    private fb: FormBuilder
  ) {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      department: ['', Validators.required],
      type: ['Full-time', Validators.required],
      numberOfPositions: [1, [Validators.required, Validators.min(1)]],
      location: ['', Validators.required],
      salary: ['', Validators.required],
      applicationDeadline: ['', Validators.required],
      priority: ['Medium'],
      description: ['', Validators.required],
      requirements: ['', Validators.required],
      benefits: [''],
      experienceRequired: [''],
      education: [''],
      skills: ['']
    });
  }

  ngOnInit(): void {
    this.loadJobs();
    this.loadJobStats();
    this.generateMockApplications();
  }

  loadJobs(): void {
    this.loading = true;
    this.jobService.getAllJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs.map(job => ({
          ...job,
          // Add HR-specific fields if missing
          department: job.department || 'IT',
          numberOfPositions: job.numberOfPositions || 1,
          applicationDeadline: job.applicationDeadline || new Date(),
          experienceRequired: job.experienceRequired || '',
          benefits: job.benefits || '',
          skills: job.skills || [],
          education: job.education || '',
          viewCount: Math.floor(Math.random() * 500) + 50,
          applicationCount: Math.floor(Math.random() * 50) + 5
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        this.loading = false;
      }
    });
  }

  loadJobStats(): void {
    // Mock stats - in real app would call API
    this.jobStats = {
      activeJobs: 23,
      totalApplications: 156,
      urgentJobs: 5,
      filledJobs: 12,
      newJobsThisMonth: 8,
      newApplicationsToday: 12,
      fillRate: 65
    };
  }

  generateMockApplications(): void {
    // Generate mock application data for analytics
    this.mockApplications = [];
    for (let jobId = 1; jobId <= 50; jobId++) {
      const applicationCount = Math.floor(Math.random() * 30) + 5;
      const shortlistedCount = Math.floor(applicationCount * 0.3);
      const interviewCount = Math.floor(shortlistedCount * 0.6);
      const hiredCount = Math.floor(interviewCount * 0.4);

      this.mockApplications.push({
        jobId,
        total: applicationCount,
        shortlisted: shortlistedCount,
        interview: interviewCount,
        hired: hiredCount
      });
    }
  }

  // Search and Filter Methods
  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.jobs];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.department.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (this.filters.status) {
      filtered = filtered.filter(job => job.status === this.filters.status);
    }

    // Department filter
    if (this.filters.department) {
      filtered = filtered.filter(job => job.department === this.filters.department);
    }

    // Type filter
    if (this.filters.type) {
      filtered = filtered.filter(job => job.type === this.filters.type);
    }

    // Priority filter
    if (this.filters.priority) {
      filtered = filtered.filter(job => this.getJobPriority(job) === this.filters.priority);
    }

    this.filteredJobs = filtered;
    this.updatePagination();
  }

  // Job Management Methods
  viewJob(job: Job): void {
    this.selectedJob = job;
    this.activeTab = 'overview';
  }

  editJob(job: Job): void {
    this.selectedJob = job;
    
    // Populate form
    this.jobForm.patchValue({
      title: job.title,
      department: job.department,
      type: job.type,
      numberOfPositions: job.numberOfPositions,
      location: job.location,
      salary: job.salary,
      applicationDeadline: job.applicationDeadline,
      priority: this.getJobPriority(job),
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      experienceRequired: job.experienceRequired,
      education: job.education,
      skills: job.skills.join(', ')
    });

    this.showEditModal = true;
    this.selectedJob = null;
  }

  saveJob(): void {
    if (this.jobForm.valid) {
      const formValue = this.jobForm.value;
      
      // Format dữ liệu trước khi gửi
      const jobData: Partial<Job> = {
        title: formValue.title,
        description: formValue.description,
        requirements: formValue.requirements,
        benefits: formValue.benefits || '',
        salary: formValue.salary,
        location: formValue.location,
        type: formValue.type,
        status: 'Active',
        department: formValue.department,
        numberOfPositions: formValue.numberOfPositions,
        applicationDeadline: new Date(formValue.applicationDeadline),
        experienceRequired: formValue.experienceRequired,
        education: formValue.education,
        skills: formValue.skills ? formValue.skills.split(',').map((s: string) => s.trim()) : [],
        company: 'Your Company Name',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Sending job data:', jobData);

      this.jobService.createJob(jobData as Job).subscribe({
        next: (newJob) => {
          console.log('Job created successfully:', newJob);
          this.jobs.push(newJob);
          this.applyFilters();
          this.closeModal();
          alert('Công việc đã được tạo thành công!');
        },
        error: (error) => {
          console.error('Error creating job:', error);
          alert(`Lỗi khi tạo công việc: ${error.message}`);
        }
      });
    } else {
      const invalidFields = Object.keys(this.jobForm.controls)
        .filter(key => this.jobForm.controls[key].invalid)
        .join(', ');
      alert(`Vui lòng điền đầy đủ các trường: ${invalidFields}`);
    }
  }

  saveDraft(): void {
    if (this.jobForm.valid) {
      const formValue = this.jobForm.value;
      const jobData: Partial<Job> = {
        ...formValue,
        status: 'Draft',
        skills: formValue.skills.split(',').map((skill: string) => skill.trim()),
        applicationDeadline: new Date(formValue.applicationDeadline)
      };

      this.jobService.createJob(jobData as Job).subscribe({
        next: () => {
          this.loadJobs();
          this.closeModal();
        },
        error: (error) => console.error('Error saving draft:', error)
      });
    }
  }

  duplicateJob(job: Job): void {
    const duplicatedJob = {
      ...job,
      title: `${job.title} (Copy)`,
      status: 'Draft' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    delete duplicatedJob.id;

    this.jobService.createJob(duplicatedJob).subscribe({
      next: () => {
        this.loadJobs();
        this.toggleDropdown(null);
      },
      error: (error) => console.error('Error duplicating job:', error)
    });
  }

  toggleJobStatus(job: Job): void {
    const newStatus = job.status === 'Active' ? 'Closed' : 'Active';
    this.jobService.updateJob(job.id!, { ...job, status: newStatus }).subscribe({
      next: () => {
        this.loadJobs();
        this.toggleDropdown(null);
      },
      error: (error) => console.error('Error updating job status:', error)
    });
  }

  archiveJob(job: Job): void {
    if (confirm('Bạn có chắc chắn muốn lưu trữ công việc này?')) {
      this.jobService.updateJob(job.id!, { ...job, status: 'Closed' }).subscribe({
        next: () => {
          this.loadJobs();
          this.toggleDropdown(null);
        },
        error: (error) => console.error('Error archiving job:', error)
      });
    }
  }

  deleteJob(job: Job): void {
    if (confirm('Bạn có chắc chắn muốn xóa công việc này? Hành động này không thể hoàn tác.')) {
      this.jobService.deleteJob(job.id!).subscribe({
        next: () => {
          this.loadJobs();
          this.toggleDropdown(null);
        },
        error: (error) => console.error('Error deleting job:', error)
      });
    }
  }

  viewApplications(job: Job): void {
    // Navigate to applications page with job filter
    console.log('View applications for job:', job.title);
  }

  scheduleInterview(job: Job): void {
    // Navigate to interview scheduling with job pre-selected
    console.log('Schedule interview for job:', job.title);
  }

  exportJobs(): void {
    // Export jobs to Excel
    console.log('Export jobs');
  }

  // Pagination Methods
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredJobs.length / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedJobs();
  }

  updatePaginatedJobs(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedJobs = this.filteredJobs.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedJobs();
  }

  // UI Methods
  toggleDropdown(jobId: number | null): void {
    this.showDropdown = this.showDropdown === jobId ? null : jobId;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.selectedJob = null;
    this.jobForm.reset();
  }

  closeDetailModal(): void {
    this.selectedJob = null;
  }

  // Utility Methods
  getJobCardClass(job: Job): string {
    const priority = this.getJobPriority(job);
    const daysRemaining = this.getDaysRemainingNumber(job);
    
    if (priority === 'High' || daysRemaining <= 3) return 'high-priority';
    if (daysRemaining <= 7) return 'urgent';
    if (this.getJobProgress(job.id!) >= 100) return 'filled';
    return '';
  }

  getJobPriority(job: Job): string {
    const daysRemaining = this.getDaysRemainingNumber(job);
    if (daysRemaining <= 3) return 'High';
    if (daysRemaining <= 7) return 'Medium';
    return 'Low';
  }

  getPriorityClass(job: Job): string {
    return this.getJobPriority(job).toLowerCase();
  }

  getPriorityText(job: Job): string {
    const priority = this.getJobPriority(job);
    switch (priority) {
      case 'High': return 'Cao';
      case 'Medium': return 'Trung bình';
      case 'Low': return 'Thấp';
      default: return priority;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'active';
      case 'Closed': return 'closed';
      case 'Draft': return 'draft';
      default: return 'active';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'Active': return 'Đang tuyển';
      case 'Closed': return 'Đã đóng';
      case 'Draft': return 'Bản nháp';
      default: return status;
    }
  }

  getDaysRemaining(job: Job): string {
    const days = this.getDaysRemainingNumber(job);
    if (days < 0) return 'Đã hết hạn';
    if (days === 0) return 'Hôm nay';
    return `${days} ngày`;
  }

  getDaysRemainingNumber(job: Job): number {
    const today = new Date();
    const deadline = new Date(job.applicationDeadline);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysRemainingClass(job: Job): string {
    const days = this.getDaysRemainingNumber(job);
    if (days <= 3) return 'urgent';
    if (days <= 7) return 'warning';
    return 'normal';
  }

  // Analytics Methods
  getJobApplicationCount(jobId: number): number {
    const jobData = this.mockApplications.find(app => app.jobId === jobId);
    return jobData ? jobData.total : 0;
  }

  getJobShortlistedCount(jobId: number): number {
    const jobData = this.mockApplications.find(app => app.jobId === jobId);
    return jobData ? jobData.shortlisted : 0;
  }

  getJobInterviewCount(jobId: number): number {
    const jobData = this.mockApplications.find(app => app.jobId === jobId);
    return jobData ? jobData.interview : 0;
  }

  getJobHiredCount(jobId: number): number {
    const jobData = this.mockApplications.find(app => app.jobId === jobId);
    return jobData ? jobData.hired : 0;
  }

  getJobProgress(jobId: number): number {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return 0;
    
    const hired = this.getJobHiredCount(jobId);
    const total = job.numberOfPositions;
    return Math.min((hired / total) * 100, 100);
  }

  getConversionRate(jobId: number, type: string): number {
    const jobData = this.mockApplications.find(app => app.jobId === jobId);
    if (!jobData) return 0;

    switch (type) {
      case 'applied_to_shortlisted':
        return jobData.total > 0 ? Math.round((jobData.shortlisted / jobData.total) * 100) : 0;
      case 'shortlisted_to_interview':
        return jobData.shortlisted > 0 ? Math.round((jobData.interview / jobData.shortlisted) * 100) : 0;
      case 'interview_to_hired':
        return jobData.interview > 0 ? Math.round((jobData.hired / jobData.interview) * 100) : 0;
      default:
        return 0;
    }
  }

  getAverageTimeToHire(jobId: number): number {
    // Mock data - in real app would calculate from actual data
    return Math.floor(Math.random() * 30) + 15;
  }

  getApplicationRate(jobId: number): number {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return 0;
    
    const applications = this.getJobApplicationCount(jobId);
    const views = job.viewCount || 0;
    
    return views > 0 ? Math.round((applications / views) * 100) : 0;
  }

  Math = Math; // Expose Math to template
}