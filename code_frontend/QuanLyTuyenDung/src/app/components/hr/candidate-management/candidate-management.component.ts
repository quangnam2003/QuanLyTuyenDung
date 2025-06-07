import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CandidateService } from '../../../services/candidate.service';
import { ApplicationService } from '../../../services/application.service';
import { Candidate } from '../../../models/candidate.model';

@Component({
  selector: 'app-candidate-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="candidate-management">
      <div class="page-header">
        <div class="header-content">
          <h1>Quản lý ứng viên</h1>
          <p>Quản lý thông tin và hồ sơ ứng viên</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline-primary" (click)="exportCandidates()">
            <i class="bi bi-download"></i> Xuất danh sách
          </button>
          <button class="btn btn-primary" (click)="showAddModal = true">
            <i class="bi bi-person-plus"></i> Thêm ứng viên
          </button>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="bi bi-people"></i>
          </div>
          <div class="stat-content">
            <h3>{{stats.totalCandidates}}</h3>
            <p>Tổng ứng viên</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active">
            <i class="bi bi-person-check"></i>
          </div>
          <div class="stat-content">
            <h3>{{stats.activeCandidates}}</h3>
            <p>Ứng viên đang hoạt động</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon shortlisted">
            <i class="bi bi-star"></i>
          </div>
          <div class="stat-content">
            <h3>{{stats.shortlistedCandidates}}</h3>
            <p>Đã được chọn</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon hired">
            <i class="bi bi-trophy"></i>
          </div>
          <div class="stat-content">
            <h3>{{stats.hiredCandidates}}</h3>
            <p>Đã tuyển dụng</p>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="search-filters">
        <div class="search-section">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" [(ngModel)]="searchQuery" (input)="onSearch()" 
                   placeholder="Tìm kiếm ứng viên theo tên, email, kỹ năng...">
          </div>
          <button class="btn btn-outline-primary" (click)="showAdvancedFilters = !showAdvancedFilters">
            <i class="bi bi-funnel"></i> Bộ lọc nâng cao
          </button>
        </div>

        <!-- Advanced Filters -->
        <div class="advanced-filters" *ngIf="showAdvancedFilters">
          <div class="filter-row">
            <div class="filter-group">
              <label>Trạng thái:</label>
              <select [(ngModel)]="filters.status" (change)="applyFilters()" class="form-select">
                <option value="">Tất cả</option>
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Không hoạt động</option>
                <option value="Blacklisted">Danh sách đen</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Kỹ năng:</label>
              <input type="text" [(ngModel)]="filters.skills" (input)="applyFilters()" 
                     placeholder="JavaScript, Angular..." class="form-control">
            </div>
            <div class="filter-group">
              <label>Kinh nghiệm:</label>
              <select [(ngModel)]="filters.experience" (change)="applyFilters()" class="form-select">
                <option value="">Tất cả</option>
                <option value="0-1">0-1 năm</option>
                <option value="1-3">1-3 năm</option>
                <option value="3-5">3-5 năm</option>
                <option value="5+">5+ năm</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Học vấn:</label>
              <select [(ngModel)]="filters.education" (change)="applyFilters()" class="form-select">
                <option value="">Tất cả</option>
                <option value="High School">Trung học</option>
                <option value="Bachelor">Cử nhân</option>
                <option value="Master">Thạc sĩ</option>
                <option value="PhD">Tiến sĩ</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Nguồn:</label>
              <select [(ngModel)]="filters.source" (change)="applyFilters()" class="form-select">
                <option value="">Tất cả</option>
                <option value="Website">Website</option>
                <option value="Job Board">Job Board</option>
                <option value="Referral">Giới thiệu</option>
                <option value="Social Media">Mạng xã hội</option>
              </select>
            </div>
          </div>
          <div class="filter-actions">
            <button class="btn btn-outline-secondary" (click)="clearFilters()">Xóa bộ lọc</button>
            <button class="btn btn-primary" (click)="applyFilters()">Áp dụng</button>
          </div>
        </div>
      </div>

      <!-- View Options -->
      <div class="view-options">
        <div class="view-switcher">
          <button class="view-btn" [class.active]="viewMode === 'grid'" (click)="setViewMode('grid')">
            <i class="bi bi-grid-3x3-gap"></i> Lưới
          </button>
          <button class="view-btn" [class.active]="viewMode === 'list'" (click)="setViewMode('list')">
            <i class="bi bi-list-ul"></i> Danh sách
          </button>
        </div>
        <div class="sort-options">
          <label>Sắp xếp:</label>
          <select [(ngModel)]="sortBy" (change)="applySorting()" class="form-select">
            <option value="firstName">Tên A-Z</option>
            <option value="createdAt">Ngày tạo</option>
            <option value="lastContactDate">Liên hệ gần nhất</option>
            <option value="applications">Số đơn ứng tuyển</option>
          </select>
        </div>
      </div>

      <!-- Candidates Display -->
      <div class="candidates-container" *ngIf="!loading; else loadingTemplate">
        <!-- Grid View -->
        <div class="candidates-grid" *ngIf="viewMode === 'grid' && filteredCandidates.length > 0">
          <div class="candidate-card" *ngFor="let candidate of paginatedCandidates">
            <div class="card-header">
              <div class="candidate-avatar">
                <i class="bi bi-person-circle"></i>
              </div>
              <div class="candidate-actions">
                <button class="btn-action" (click)="viewCandidate(candidate)" title="Xem chi tiết">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn-action" (click)="editCandidate(candidate)" title="Chỉnh sửa">
                  <i class="bi bi-pencil"></i>
                </button>
                <div class="dropdown">
                  <button class="btn-action" (click)="toggleDropdown(candidate.id!)" title="Thêm">
                    <i class="bi bi-three-dots"></i>
                  </button>
                  <div class="dropdown-menu" *ngIf="showDropdown === candidate.id">
                    <button (click)="downloadResume(candidate)">
                      <i class="bi bi-download"></i> Tải CV
                    </button>
                    <button (click)="scheduleInterview(candidate)">
                      <i class="bi bi-calendar-plus"></i> Lên lịch phỏng vấn
                    </button>
                    <button (click)="addToBlacklist(candidate)">
                      <i class="bi bi-slash-circle"></i> Thêm vào blacklist
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card-body">
              <h3>{{candidate.firstName}} {{candidate.lastName}}</h3>
              <p class="candidate-contact">
                <i class="bi bi-envelope"></i> {{candidate.email}}
              </p>
              <p class="candidate-contact">
                <i class="bi bi-phone"></i> {{candidate.phone}}
              </p>
              <p class="candidate-address">
                <i class="bi bi-geo-alt"></i> {{candidate.address}}
              </p>
              
              <div class="candidate-skills" *ngIf="candidate.skills.length > 0">
                <div class="skills-header">Kỹ năng:</div>
                <div class="skills-list">
                  <span class="skill-tag" *ngFor="let skill of candidate.skills.slice(0, 3)">
                    {{skill}}
                  </span>
                  <span class="more-skills" *ngIf="candidate.skills.length > 3">
                    +{{candidate.skills.length - 3}}
                  </span>
                </div>
              </div>

              <div class="candidate-experience" *ngIf="candidate.experience.length > 0">
                <div class="experience-item">
                  <strong>{{candidate.experience[0].position}}</strong>
                  <p>{{candidate.experience[0].company}}</p>
                </div>
              </div>

              <div class="candidate-applications">
                <span class="applications-count">
                  <i class="bi bi-file-text"></i>
                  {{candidate.applications.length}} đơn ứng tuyển
                </span>
                <span class="status-badge" [class]="getStatusClass(candidate.status)">
                  {{getStatusText(candidate.status)}}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- List View -->
        <div class="candidates-table" *ngIf="viewMode === 'list' && filteredCandidates.length > 0">
          <table class="table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" [(ngModel)]="selectAll" (change)="toggleSelectAll()">
                </th>
                <th>Ứng viên</th>
                <th>Liên hệ</th>
                <th>Kỹ năng</th>
                <th>Kinh nghiệm</th>
                <th>Ứng tuyển</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let candidate of paginatedCandidates" [class.selected]="isSelected(candidate.id!)">
                <td>
                  <input type="checkbox" 
                         [checked]="isSelected(candidate.id!)"
                         (change)="toggleSelection(candidate.id!)">
                </td>
                <td>
                  <div class="candidate-info">
                    <div class="candidate-avatar-small">
                      <i class="bi bi-person-circle"></i>
                    </div>
                    <div class="candidate-details">
                      <h4>{{candidate.firstName}} {{candidate.lastName}}</h4>
                      <p>{{candidate.address}}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="contact-info">
                    <p><i class="bi bi-envelope"></i> {{candidate.email}}</p>
                    <p><i class="bi bi-phone"></i> {{candidate.phone}}</p>
                  </div>
                </td>
                <td>
                  <div class="skills-column">
                    <span class="skill-tag" *ngFor="let skill of candidate.skills.slice(0, 2)">
                      {{skill}}
                    </span>
                    <span class="more-skills" *ngIf="candidate.skills.length > 2">
                      +{{candidate.skills.length - 2}}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="experience-column" *ngIf="candidate.experience.length > 0">
                    <p class="current-role">{{candidate.experience[0].position}}</p>
                    <p class="company">{{candidate.experience[0].company}}</p>
                  </div>
                </td>
                <td>
                  <div class="applications-column">
                    <span class="applications-count">{{candidate.applications.length}}</span>
                    <small>đơn ứng tuyển</small>
                  </div>
                </td>
                <td>
                  <span class="status-badge" [class]="getStatusClass(candidate.status)">
                    {{getStatusText(candidate.status)}}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-action view" (click)="viewCandidate(candidate)" title="Xem">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn-action edit" (click)="editCandidate(candidate)" title="Sửa">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-action download" (click)="downloadResume(candidate)" title="CV">
                      <i class="bi bi-download"></i>
                    </button>
                    <button class="btn-action interview" (click)="scheduleInterview(candidate)" title="Phỏng vấn">
                      <i class="bi bi-calendar-plus"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="filteredCandidates.length === 0">
          <i class="bi bi-people"></i>
          <h3>Không tìm thấy ứng viên</h3>
          <p>Hãy thử thay đổi điều kiện tìm kiếm hoặc thêm ứng viên mới</p>
          <button class="btn btn-primary" (click)="showAddModal = true">
            <i class="bi bi-person-plus"></i> Thêm ứng viên
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination-section" *ngIf="totalPages > 1">
        <div class="pagination-info">
          Hiển thị {{(currentPage - 1) * pageSize + 1}} - 
          {{Math.min(currentPage * pageSize, filteredCandidates.length)}} 
          trong tổng số {{filteredCandidates.length}} ứng viên
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

      <ng-template #loadingTemplate>
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </ng-template>
    </div>

    <!-- Add/Edit Candidate Modal -->
    <div class="modal" *ngIf="showAddModal || showEditModal" (click)="closeModal()">
      <div class="modal-content large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{showAddModal ? 'Thêm ứng viên mới' : 'Chỉnh sửa thông tin ứng viên'}}</h2>
          <button class="btn-close" (click)="closeModal()">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="modal-body">
          <form [formGroup]="candidateForm" (ngSubmit)="saveCandidate()">
            <!-- Personal Information -->
            <div class="form-section">
              <h3>Thông tin cá nhân</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Họ *</label>
                  <input type="text" formControlName="firstName" class="form-control" required>
                </div>
                <div class="form-group">
                  <label>Tên *</label>
                  <input type="text" formControlName="lastName" class="form-control" required>
                </div>
                <div class="form-group">
                  <label>Email *</label>
                  <input type="email" formControlName="email" class="form-control" required>
                </div>
                <div class="form-group">
                  <label>Điện thoại *</label>
                  <input type="tel" formControlName="phone" class="form-control" required>
                </div>
                <div class="form-group full-width">
                  <label>Địa chỉ</label>
                  <input type="text" formControlName="address" class="form-control">
                </div>
                <div class="form-group">
                  <label>Ngày sinh</label>
                  <input type="date" formControlName="dateOfBirth" class="form-control">
                </div>
                <div class="form-group">
                  <label>Giới tính</label>
                  <select formControlName="gender" class="form-select">
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                    <option value="Other">Khác</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Skills -->
            <div class="form-section">
              <h3>Kỹ năng</h3>
              <div class="form-group">
                <label>Kỹ năng (phân cách bằng dấu phẩy)</label>
                <input type="text" formControlName="skills" class="form-control" 
                       placeholder="JavaScript, Angular, Node.js">
              </div>
            </div>

            <!-- Additional Information -->
            <div class="form-section">
              <h3>Thông tin bổ sung</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Mức lương mong muốn</label>
                  <input type="text" formControlName="expectedSalary" class="form-control">
                </div>
                <div class="form-group">
                  <label>Thời gian notice</label>
                  <select formControlName="noticePeriod" class="form-select">
                    <option value="">Chọn thời gian</option>
                    <option value="Immediate">Ngay lập tức</option>
                    <option value="1 week">1 tuần</option>
                    <option value="2 weeks">2 tuần</option>
                    <option value="1 month">1 tháng</option>
                    <option value="2 months">2 tháng</option>
                    <option value="3 months">3 tháng</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Có thể bắt đầu</label>
                  <input type="date" formControlName="availability" class="form-control">
                </div>
                <div class="form-group">
                  <label>Nguồn</label>
                  <select formControlName="source" class="form-select">
                    <option value="Website">Website</option>
                    <option value="Job Board">Job Board</option>
                    <option value="Referral">Giới thiệu</option>
                    <option value="Social Media">Mạng xã hội</option>
                    <option value="Other">Khác</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="form-section">
              <h3>Ghi chú</h3>
              <div class="form-group">
                <label>Ghi chú</label>
                <textarea formControlName="notes" class="form-control" rows="4"
                          placeholder="Ghi chú về ứng viên..."></textarea>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>
          <button type="submit" class="btn btn-primary" 
                  [disabled]="!candidateForm.valid" 
                  (click)="saveCandidate()">
            {{showAddModal ? 'Thêm ứng viên' : 'Cập nhật'}}
          </button>
        </div>
      </div>
    </div>

    <!-- Candidate Detail Modal -->
    <div class="modal" *ngIf="selectedCandidate" (click)="closeDetailModal()">
      <div class="modal-content extra-large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{selectedCandidate.firstName}} {{selectedCandidate.lastName}}</h2>
          <button class="btn-close" (click)="closeDetailModal()">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="candidate-detail">
            <div class="detail-tabs">
              <button class="tab-btn" [class.active]="activeTab === 'overview'" (click)="setActiveTab('overview')">
                Tổng quan
              </button>
              <button class="tab-btn" [class.active]="activeTab === 'experience'" (click)="setActiveTab('experience')">
                Kinh nghiệm
              </button>
              <button class="tab-btn" [class.active]="activeTab === 'education'" (click)="setActiveTab('education')">
                Học vấn
              </button>
              <button class="tab-btn" [class.active]="activeTab === 'applications'" (click)="setActiveTab('applications')">
                Đơn ứng tuyển
              </button>
              <button class="tab-btn" [class.active]="activeTab === 'documents'" (click)="setActiveTab('documents')">
                Tài liệu
              </button>
            </div>

            <!-- Overview Tab -->
            <div class="tab-content" *ngIf="activeTab === 'overview'">
              <div class="overview-grid">
                <div class="info-section">
                  <h3>Thông tin liên hệ</h3>
                  <p><strong>Email:</strong> {{selectedCandidate.email}}</p>
                  <p><strong>Điện thoại:</strong> {{selectedCandidate.phone}}</p>
                  <p><strong>Địa chỉ:</strong> {{selectedCandidate.address}}</p>
                  <p><strong>Ngày sinh:</strong> {{selectedCandidate.dateOfBirth | date:'dd/MM/yyyy'}}</p>
                </div>
                
                <div class="info-section">
                  <h3>Thông tin tuyển dụng</h3>
                  <p><strong>Trạng thái:</strong> 
                    <span class="status-badge" [class]="getStatusClass(selectedCandidate.status)">
                      {{getStatusText(selectedCandidate.status)}}
                    </span>
                  </p>
                  <p><strong>Nguồn:</strong> {{selectedCandidate.source}}</p>
                  <p><strong>Mức lương mong muốn:</strong> {{selectedCandidate.expectedSalary}}</p>
                  <p><strong>Thời gian notice:</strong> {{selectedCandidate.noticePeriod}}</p>
                </div>

                <div class="info-section full-width">
                  <h3>Kỹ năng</h3>
                  <div class="skills-display">
                    <span class="skill-tag" *ngFor="let skill of selectedCandidate.skills">
                      {{skill}}
                    </span>
                  </div>
                </div>

                <div class="info-section full-width" *ngIf="selectedCandidate.notes">
                  <h3>Ghi chú</h3>
                  <p>{{selectedCandidate.notes}}</p>
                </div>
              </div>
            </div>

            <!-- Experience Tab -->
            <div class="tab-content" *ngIf="activeTab === 'experience'">
              <div class="experience-list">
                <div class="experience-item" *ngFor="let exp of selectedCandidate.experience">
                  <div class="experience-header">
                    <h4>{{exp.position}}</h4>
                    <span class="experience-period">
                      {{exp.startDate | date:'MM/yyyy'}} - 
                      {{exp.isCurrentJob ? 'Hiện tại' : (exp.endDate | date:'MM/yyyy')}}
                    </span>
                  </div>
                  <p class="company">{{exp.company}}</p>
                  <p class="description">{{exp.description}}</p>
                </div>
              </div>
            </div>

            <!-- Education Tab -->
            <div class="tab-content" *ngIf="activeTab === 'education'">
              <div class="education-list">
                <div class="education-item" *ngFor="let edu of selectedCandidate.education">
                  <h4>{{edu.degree}} - {{edu.major}}</h4>
                  <p class="school">{{edu.school}}</p>
                  <p class="graduation">Tốt nghiệp: {{edu.graduationYear}}</p>
                  <p class="gpa" *ngIf="edu.gpa">GPA: {{edu.gpa}}</p>
                </div>
              </div>
            </div>

            <!-- Applications Tab -->
            <div class="tab-content" *ngIf="activeTab === 'applications'">
              <div class="applications-list">
                <div class="application-item" *ngFor="let app of selectedCandidate.applications">
                  <div class="application-header">
                    <h4>{{app.jobTitle}}</h4>
                    <span class="application-date">{{app.appliedDate | date:'dd/MM/yyyy'}}</span>
                  </div>
                  <p class="application-status">
                    Trạng thái: 
                    <span class="status-badge" [class]="getApplicationStatusClass(app.status)">
                      {{getApplicationStatusText(app.status)}}
                    </span>
                  </p>
                  <p class="current-stage">Giai đoạn hiện tại: {{app.currentStage}}</p>
                  <p class="notes" *ngIf="app.notes">{{app.notes}}</p>
                </div>
              </div>
            </div>

            <!-- Documents Tab -->
            <div class="tab-content" *ngIf="activeTab === 'documents'">
              <div class="documents-list">
                <div class="document-item" *ngFor="let doc of selectedCandidate.documents">
                  <div class="document-icon">
                    <i class="bi bi-file-earmark-pdf" *ngIf="doc.type === 'Resume'"></i>
                    <i class="bi bi-file-earmark-text" *ngIf="doc.type === 'Cover Letter'"></i>
                    <i class="bi bi-file-earmark" *ngIf="doc.type === 'Other'"></i>
                  </div>
                  <div class="document-info">
                    <h4>{{doc.name}}</h4>
                    <p>Loại: {{doc.type}}</p>
                    <p>Ngày tải lên: {{doc.uploadDate | date:'dd/MM/yyyy HH:mm'}}</p>
                  </div>
                  <div class="document-actions">
                    <a [href]="doc.url" target="_blank" class="btn btn-outline-primary">
                      <i class="bi bi-download"></i> Tải xuống
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeDetailModal()">Đóng</button>
          <button class="btn btn-outline-primary" (click)="downloadResume(selectedCandidate)">
            <i class="bi bi-download"></i> Tải CV
          </button>
          <button class="btn btn-warning" (click)="scheduleInterview(selectedCandidate)">
            <i class="bi bi-calendar-plus"></i> Lên lịch phỏng vấn
          </button>
          <button class="btn btn-primary" (click)="editCandidate(selectedCandidate)">
            <i class="bi bi-pencil"></i> Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .candidate-management {
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

    /* Stats Overview */
    .stats-overview {
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
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      background: #e3f2fd;
      color: #1976d2;
    }

    .stat-icon.active {
      background: #e8f5e8;
      color: #388e3c;
    }

    .stat-icon.shortlisted {
      background: #fff3e0;
      color: #f57c00;
    }

    .stat-icon.hired {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .stat-content h3 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.25rem;
      color: #2c5282;
    }

    .stat-content p {
      color: #6c757d;
      margin: 0;
      font-size: 0.9rem;
    }

    /* Search and Filters */
    .search-filters {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .search-section {
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

    .advanced-filters {
      border-top: 1px solid #e9ecef;
      padding-top: 1rem;
    }

    .filter-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
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

    .filter-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    /* View Options */
    .view-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .view-switcher {
      display: flex;
      gap: 0.5rem;
    }

    .view-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #dee2e6;
      background: white;
      color: #6c757d;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .view-btn.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .sort-options {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sort-options label {
      font-weight: 500;
      color: #495057;
    }

    /* Grid View */
    .candidates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .candidate-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .candidate-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }

    .candidate-avatar {
      font-size: 2rem;
      color: #6c757d;
    }

    .candidate-actions {
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
      min-width: 180px;
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

    .card-body {
      padding: 1.5rem;
    }

    .card-body h3 {
      margin: 0 0 1rem;
      color: #2c5282;
      font-size: 1.2rem;
    }

    .candidate-contact {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0.25rem 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .candidate-address {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0.5rem 0 1rem;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .candidate-skills {
      margin: 1rem 0;
    }

    .skills-header {
      font-weight: 500;
      color: #495057;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .skill-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .more-skills {
      background: #f8f9fa;
      color: #6c757d;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    .candidate-experience {
      margin: 1rem 0;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .experience-item strong {
      color: #2c5282;
      display: block;
    }

    .experience-item p {
      margin: 0.25rem 0 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .candidate-applications {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }

    .applications-count {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .status-badge.active {
      background: #e8f5e8;
      color: #388e3c;
    }

    .status-badge.inactive {
      background: #f8f9fa;
      color: #6c757d;
    }

    .status-badge.blacklisted {
      background: #ffebee;
      color: #d32f2f;
    }

    /* List View */
    .candidates-table {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .table {
      width: 100%;
      margin: 0;
      border-collapse: collapse;
    }

    .table th {
      background: #f8f9fa;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #2c5282;
      border-bottom: 2px solid #e9ecef;
    }

    .table td {
      padding: 1rem;
      border-bottom: 1px solid #f0f0f0;
      vertical-align: middle;
    }

    .table tr:hover {
      background: #f8f9ff;
    }

    .table tr.selected {
      background: #e3f2fd;
    }

    .candidate-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .candidate-avatar-small {
      font-size: 2rem;
      color: #6c757d;
    }

    .candidate-details h4 {
      margin: 0 0 0.25rem;
      color: #2c5282;
      font-size: 1rem;
    }

    .candidate-details p {
      margin: 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .contact-info p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .skills-column {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .experience-column .current-role {
      font-weight: 500;
      color: #2c5282;
      margin: 0 0 0.25rem;
    }

    .experience-column .company {
      color: #6c757d;
      margin: 0;
      font-size: 0.9rem;
    }

    .applications-column {
      text-align: center;
    }

    .applications-column .applications-count {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2c5282;
      display: block;
    }

    .applications-column small {
      color: #6c757d;
      font-size: 0.8rem;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .action-buttons .btn-action {
      width: 32px;
      height: 32px;
    }

    .btn-action.view { background: #e3f2fd; color: #1976d2; }
    .btn-action.edit { background: #fff3e0; color: #f57c00; }
    .btn-action.download { background: #e8f5e8; color: #388e3c; }
    .btn-action.interview { background: #f3e5f5; color: #7b1fa2; }

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

    /* Detail Modal Tabs */
    .detail-tabs {
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

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .info-section {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
    }

    .info-section.full-width {
      grid-column: 1 / -1;
    }

    .info-section h3 {
      color: #2c5282;
      margin: 0 0 1rem;
      font-size: 1.1rem;
    }

    .info-section p {
      margin: 0.5rem 0;
    }

    .skills-display {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .experience-list,
    .education-list,
    .applications-list,
    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .experience-item,
    .education-item,
    .application-item,
    .document-item {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
    }

    .experience-header,
    .application-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .experience-header h4,
    .education-item h4,
    .application-header h4,
    .document-info h4 {
      margin: 0;
      color: #2c5282;
    }

    .experience-period,
    .application-date {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .company,
    .school,
    .graduation,
    .gpa,
    .application-status,
    .current-stage,
    .notes {
      margin: 0.25rem 0;
      color: #6c757d;
    }

    .description {
      margin-top: 0.5rem;
      color: #495057;
    }

    .document-item {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1rem;
      align-items: center;
    }

    .document-icon {
      font-size: 2rem;
      color: #6c757d;
    }

    .document-info p {
      margin: 0.25rem 0;
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

    .btn-outline-secondary {
      background: white;
      color: #6c757d;
      border: 1px solid #6c757d;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .candidates-grid {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 1rem;
      }

      .search-section {
        flex-direction: column;
      }

      .filter-row {
        grid-template-columns: 1fr;
      }

      .view-options {
        flex-direction: column;
        gap: 1rem;
      }

      .candidates-grid {
        grid-template-columns: 1fr;
      }

      .table {
        font-size: 0.9rem;
      }

      .candidate-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .action-buttons {
        justify-content: center;
        width: 100%;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .overview-grid {
        grid-template-columns: 1fr;
      }

      .detail-tabs {
        flex-wrap: wrap;
      }

      .modal-content {
        width: 95%;
        margin: 1rem;
      }
    }
  `]
})
export class CandidateManagementComponent implements OnInit {
  // Data
  candidates: Candidate[] = [];
  filteredCandidates: Candidate[] = [];
  paginatedCandidates: Candidate[] = [];
  selectedCandidate: Candidate | null = null;

  // UI State
  loading = true;
  viewMode: 'grid' | 'list' = 'grid';
  showAdvancedFilters = false;
  showAddModal = false;
  showEditModal = false;
  showDropdown: number | null = null;
  activeTab = 'overview';

  // Search and Filters
  searchQuery = '';
  filters = {
    status: '',
    skills: '',
    experience: '',
    education: '',
    source: ''
  };
  sortBy = 'firstName';

  // Selection
  selectedCandidateIds: number[] = [];
  selectAll = false;

  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalPages = 1;

  // Stats
  stats = {
    totalCandidates: 0,
    activeCandidates: 0,
    shortlistedCandidates: 0,
    hiredCandidates: 0
  };

  // Form
  candidateForm: FormGroup;

  constructor(
    private candidateService: CandidateService,
    private applicationService: ApplicationService,
    private fb: FormBuilder
  ) {
    this.candidateForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: [''],
      dateOfBirth: [''],
      gender: [''],
      skills: [''],
      expectedSalary: [''],
      noticePeriod: [''],
      availability: [''],
      source: ['Website'],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadCandidates();
    this.loadStats();
  }

  loadCandidates(): void {
    this.loading = true;
    // Mock data - in real app would call candidateService.getAllCandidates()
    setTimeout(() => {
      this.candidates = this.generateMockCandidates();
      this.applyFilters();
      this.loading = false;
    }, 1000);
  }

  loadStats(): void {
    // Mock stats - in real app would call candidateService.getStats()
    this.stats = {
      totalCandidates: 125,
      activeCandidates: 89,
      shortlistedCandidates: 23,
      hiredCandidates: 13
    };
  }

  generateMockCandidates(): Candidate[] {
    // Mock data generation for demonstration
    const candidates: Candidate[] = [];
    const skills = ['JavaScript', 'Angular', 'React', 'Node.js', 'Python', 'Java', 'C#', 'PHP'];
    const companies = ['Tech Corp', 'Innovation Ltd', 'Digital Solutions', 'Software House'];
    const statuses = ['Active', 'Inactive', 'Blacklisted'] as const;
    const sources = ['Website', 'Job Board', 'Referral', 'Social Media', 'Other'] as const;

    for (let i = 1; i <= 50; i++) {
      candidates.push({
        id: i,
        firstName: `Ứng viên ${i}`,
        lastName: `Nguyễn`,
        email: `candidate${i}@email.com`,
        phone: `090${i.toString().padStart(7, '0')}`,
        address: `Hà Nội, Việt Nam`,
        dateOfBirth: new Date(1990 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        education: [
          {
            degree: 'Bachelor',
            major: 'Computer Science',
            school: 'Đại học Công nghệ',
            graduationYear: 2020 + Math.floor(Math.random() * 3),
            gpa: 3.0 + Math.random()
          }
        ],
        experience: [
          {
            company: companies[Math.floor(Math.random() * companies.length)],
            position: 'Developer',
            startDate: new Date(2020, 1, 1),
            endDate: new Date(2023, 12, 31),
            description: 'Phát triển ứng dụng web',
            isCurrentJob: Math.random() > 0.5
          }
        ],
        skills: skills.slice(0, 3 + Math.floor(Math.random() * 3)),
        languages: [
          { language: 'Vietnamese', proficiency: 'Native' },
          { language: 'English', proficiency: 'Intermediate' }
        ],
        applications: [
          {
            jobId: 1,
            jobTitle: 'Frontend Developer',
            appliedDate: new Date(),
            status: 'Applied',
            currentStage: 'CV Review',
            notes: 'Good candidate'
          }
        ],
        documents: [
          {
            type: 'Resume',
            name: 'CV_Candidate.pdf',
            url: '#',
            uploadDate: new Date()
          }
        ],
        expectedSalary: `${10 + Math.floor(Math.random() * 10)}00 USD`,
        noticePeriod: '1 month',
        availability: new Date(),
        source: sources[Math.floor(Math.random() * sources.length)],
        sourceDetails: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        lastContactDate: new Date(),
        notes: 'Sample candidate notes'
      });
    }

    return candidates;
  }

  // Search and Filter Methods
  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.candidates];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(candidate => 
        candidate.firstName.toLowerCase().includes(query) ||
        candidate.lastName.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (this.filters.status) {
      filtered = filtered.filter(candidate => candidate.status === this.filters.status);
    }

    // Skills filter
    if (this.filters.skills) {
      const skillQuery = this.filters.skills.toLowerCase();
      filtered = filtered.filter(candidate => 
        candidate.skills.some(skill => skill.toLowerCase().includes(skillQuery))
      );
    }

    // Experience filter
    if (this.filters.experience) {
      // Implement experience filtering logic
    }

    // Education filter
    if (this.filters.education) {
      filtered = filtered.filter(candidate => 
        candidate.education.some(edu => edu.degree === this.filters.education)
      );
    }

    // Source filter
    if (this.filters.source) {
      filtered = filtered.filter(candidate => candidate.source === this.filters.source);
    }

    this.filteredCandidates = filtered;
    this.applySorting();
    this.updatePagination();
  }

  clearFilters(): void {
    this.filters = {
      status: '',
      skills: '',
      experience: '',
      education: '',
      source: ''
    };
    this.searchQuery = '';
    this.applyFilters();
  }

  applySorting(): void {
    this.filteredCandidates.sort((a, b) => {
      switch (this.sortBy) {
        case 'firstName':
          return a.firstName.localeCompare(b.firstName);
        case 'createdAt':
          return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
        case 'lastContactDate':
          return new Date(b.lastContactDate!).getTime() - new Date(a.lastContactDate!).getTime();
        case 'applications':
          return b.applications.length - a.applications.length;
        default:
          return 0;
      }
    });
  }

  // View Methods
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
    this.pageSize = mode === 'grid' ? 12 : 10;
    this.updatePagination();
  }

  // Pagination Methods
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredCandidates.length / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedCandidates();
  }

  updatePaginatedCandidates(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedCandidates = this.filteredCandidates.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedCandidates();
  }

  // Selection Methods
  toggleSelectAll(): void {
    if (this.selectAll) {
      this.selectedCandidateIds = this.filteredCandidates.map(c => c.id!);
    } else {
      this.selectedCandidateIds = [];
    }
  }

  toggleSelection(candidateId: number): void {
    const index = this.selectedCandidateIds.indexOf(candidateId);
    if (index > -1) {
      this.selectedCandidateIds.splice(index, 1);
    } else {
      this.selectedCandidateIds.push(candidateId);
    }
    this.selectAll = this.selectedCandidateIds.length === this.filteredCandidates.length;
  }

  isSelected(candidateId: number): boolean {
    return this.selectedCandidateIds.includes(candidateId);
  }

  // Candidate Management Methods
  viewCandidate(candidate: Candidate): void {
    this.selectedCandidate = candidate;
    this.activeTab = 'overview';
  }

  editCandidate(candidate: Candidate): void {
    this.selectedCandidate = candidate;
    
    // Populate form
    this.candidateForm.patchValue({
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone,
      address: candidate.address,
      dateOfBirth: candidate.dateOfBirth,
      gender: candidate.gender,
      skills: candidate.skills.join(', '),
      expectedSalary: candidate.expectedSalary,
      noticePeriod: candidate.noticePeriod,
      availability: candidate.availability,
      source: candidate.source,
      notes: candidate.notes
    });

    this.showEditModal = true;
    this.selectedCandidate = null;
  }

  saveCandidate(): void {
    if (this.candidateForm.valid) {
      const formValue = this.candidateForm.value;
      
      const candidateData: Partial<Candidate> = {
        ...formValue,
        skills: formValue.skills.split(',').map((skill: string) => skill.trim()),
        dateOfBirth: formValue.dateOfBirth ? new Date(formValue.dateOfBirth) : undefined,
        availability: formValue.availability ? new Date(formValue.availability) : undefined
      };

      if (this.showEditModal && this.selectedCandidate) {
        // Update existing candidate
        this.candidateService.saveProfile(candidateData).subscribe({
          next: () => {
            this.loadCandidates();
            this.closeModal();
          },
          error: (error) => console.error('Error updating candidate:', error)
        });
      } else {
        // Create new candidate
        this.candidateService.saveProfile(candidateData).subscribe({
          next: () => {
            this.loadCandidates();
            this.closeModal();
          },
          error: (error) => console.error('Error creating candidate:', error)
        });
      }
    }
  }

  downloadResume(candidate: Candidate): void {
    const resumeDoc = candidate.documents.find(doc => doc.type === 'Resume');
    if (resumeDoc) {
      window.open(resumeDoc.url, '_blank');
    } else {
      alert('CV không có sẵn');
    }
  }

  scheduleInterview(candidate: Candidate): void {
    // Navigate to interview scheduling with candidate pre-selected
    console.log('Schedule interview for:', candidate.firstName, candidate.lastName);
  }

  addToBlacklist(candidate: Candidate): void {
    if (confirm(`Bạn có chắc chắn muốn thêm ${candidate.firstName} ${candidate.lastName} vào blacklist?`)) {
      // Update candidate status
      console.log('Add to blacklist:', candidate.firstName, candidate.lastName);
      this.toggleDropdown(null);
    }
  }

  exportCandidates(): void {
    // Export candidates to Excel
    console.log('Export candidates');
  }

  // UI Methods
  toggleDropdown(candidateId: number | null): void {
    this.showDropdown = this.showDropdown === candidateId ? null : candidateId;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.selectedCandidate = null;
    this.candidateForm.reset();
  }

  closeDetailModal(): void {
    this.selectedCandidate = null;
  }

  // Utility Methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'active';
      case 'Inactive': return 'inactive';
      case 'Blacklisted': return 'blacklisted';
      default: return 'active';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'Active': return 'Hoạt động';
      case 'Inactive': return 'Không hoạt động';
      case 'Blacklisted': return 'Blacklist';
      default: return status;
    }
  }

  getApplicationStatusClass(status: string): string {
    switch (status) {
      case 'Applied': return 'applied';
      case 'Screening': return 'screening';
      case 'Interview': return 'interview';
      case 'Offered': return 'offered';
      case 'Hired': return 'hired';
      case 'Rejected': return 'rejected';
      default: return 'applied';
    }
  }

  getApplicationStatusText(status: string): string {
    switch (status) {
      case 'Applied': return 'Đã ứng tuyển';
      case 'Screening': return 'Sàng lọc';
      case 'Interview': return 'Phỏng vấn';
      case 'Offered': return 'Đã offer';
      case 'Hired': return 'Đã tuyển';
      case 'Rejected': return 'Từ chối';
      default: return status;
    }
  }

  Math = Math; // Expose Math to template
}