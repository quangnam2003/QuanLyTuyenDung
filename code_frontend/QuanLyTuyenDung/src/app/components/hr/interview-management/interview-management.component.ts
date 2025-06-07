import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InterviewService } from '../../../services/interview.service';
import { ApplicationService } from '../../../services/application.service';
import { Interview } from '../../../models/interview.model';

@Component({
  selector: 'app-interview-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="interview-management">
      <div class="page-header">
        <div class="header-content">
          <h1>Quản lý lịch phỏng vấn</h1>
          <p>Lên lịch và quản lý các cuộc phỏng vấn</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline-primary" (click)="exportSchedule()">
            <i class="bi bi-download"></i> Xuất lịch
          </button>
          <button class="btn btn-primary" (click)="showCreateModal = true">
            <i class="bi bi-calendar-plus"></i> Lên lịch phỏng vấn
          </button>
        </div>
      </div>

      <!-- View Switcher -->
      <div class="view-switcher">
        <button class="view-btn" [class.active]="currentView === 'calendar'" (click)="switchView('calendar')">
          <i class="bi bi-calendar3"></i> Lịch
        </button>
        <button class="view-btn" [class.active]="currentView === 'list'" (click)="switchView('list')">
          <i class="bi bi-list-ul"></i> Danh sách
        </button>
        <button class="view-btn" [class.active]="currentView === 'timeline'" (click)="switchView('timeline')">
          <i class="bi bi-clock"></i> Timeline
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-section" *ngIf="currentView === 'list'">
        <div class="filter-group">
          <label>Trạng thái:</label>
          <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="form-select">
            <option value="">Tất cả</option>
            <option value="Scheduled">Đã lên lịch</option>
            <option value="Completed">Hoàn thành</option>
            <option value="Cancelled">Đã hủy</option>
            <option value="Rescheduled">Đã hoãn</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Loại phỏng vấn:</label>
          <select [(ngModel)]="selectedType" (change)="applyFilters()" class="form-select">
            <option value="">Tất cả</option>
            <option value="Phone">Điện thoại</option>
            <option value="Online">Trực tuyến</option>
            <option value="On-site">Tại văn phòng</option>
            <option value="Technical">Kỹ thuật</option>
            <option value="HR">HR</option>
            <option value="Final">Cuối cùng</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Ngày:</label>
          <input type="date" [(ngModel)]="selectedDate" (change)="applyFilters()" class="form-control">
        </div>
        <div class="filter-group">
          <label>Tìm kiếm:</label>
          <input type="text" [(ngModel)]="searchQuery" (input)="onSearch()" 
                 placeholder="Tên ứng viên, người phỏng vấn..." class="form-control">
        </div>
      </div>

      <!-- Calendar View -->
      <div class="calendar-view" *ngIf="currentView === 'calendar'">
        <div class="calendar-header">
          <div class="calendar-navigation">
            <button class="btn btn-outline-primary" (click)="previousWeek()">
              <i class="bi bi-chevron-left"></i> Tuần trước
            </button>
            <h3>{{getCurrentWeekRange()}}</h3>
            <button class="btn btn-outline-primary" (click)="nextWeek()">
              Tuần sau <i class="bi bi-chevron-right"></i>
            </button>
          </div>
          <button class="btn btn-primary" (click)="goToToday()">Hôm nay</button>
        </div>

        <div class="calendar-grid">
          <div class="time-column">
            <div class="time-header">Thời gian</div>
            <div class="time-slot" *ngFor="let hour of timeSlots">{{hour}}</div>
          </div>
          <div class="day-column" *ngFor="let day of currentWeekDays">
            <div class="day-header">
              <div class="day-name">{{day.name}}</div>
              <div class="day-date">{{day.date | date:'dd/MM'}}</div>
            </div>
            <div class="day-slots">
              <div class="time-slot" *ngFor="let hour of timeSlots" 
                   (click)="createInterviewAtTime(day.date, hour)">
                <div class="interview-item" 
                     *ngFor="let interview of getInterviewsForDayHour(day.date, hour)"
                     [class]="getInterviewTypeClass(interview.type)"
                     (click)="viewInterview(interview, $event)">
                  <div class="interview-time">{{interview.scheduledDate | date:'HH:mm'}}</div>
                  <div class="interview-candidate">{{interview.candidateName}}</div>
                  <div class="interview-type">{{interview.type}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div class="list-view" *ngIf="currentView === 'list'">
        <div class="interviews-table" *ngIf="filteredInterviews.length > 0; else noInterviews">
          <table class="table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Ứng viên</th>
                <th>Vị trí</th>
                <th>Loại</th>
                <th>Người phỏng vấn</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let interview of paginatedInterviews" [class]="getRowClass(interview)">
                <td>
                  <div class="time-info">
                    <div class="date">{{interview.scheduledDate | date:'dd/MM/yyyy'}}</div>
                    <div class="time">{{interview.scheduledDate | date:'HH:mm'}} ({{interview.duration}}p)</div>
                  </div>
                </td>
                <td>
                  <div class="candidate-info">
                    <div class="name">{{interview.candidateName}}</div>
                    <div class="stage">{{interview.stage}}</div>
                  </div>
                </td>
                <td>{{interview.jobTitle}}</td>
                <td>
                  <span class="type-badge" [class]="getTypeClass(interview.type)">
                    {{getTypeText(interview.type)}}
                  </span>
                </td>
                <td>
                  <div class="interviewers">
                    <div *ngFor="let interviewer of interview.interviewers.slice(0, 2)">
                      {{interviewer.name}}
                    </div>
                    <div *ngIf="interview.interviewers.length > 2" class="more-interviewers">
                      +{{interview.interviewers.length - 2}} người khác
                    </div>
                  </div>
                </td>
                <td>
                  <span class="status-badge" [class]="getStatusClass(interview.status)">
                    {{getStatusText(interview.status)}}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-action view" (click)="viewInterview(interview)" title="Xem chi tiết">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn-action edit" (click)="editInterview(interview)" title="Chỉnh sửa">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-action join" *ngIf="interview.status === 'Scheduled'" 
                            (click)="joinInterview(interview)" title="Tham gia">
                      <i class="bi bi-camera-video"></i>
                    </button>
                    <button class="btn-action cancel" (click)="cancelInterview(interview)" title="Hủy">
                      <i class="bi bi-x-circle"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-section" *ngIf="totalPages > 1">
          <div class="pagination-info">
            Hiển thị {{(currentPage - 1) * pageSize + 1}} - 
            {{Math.min(currentPage * pageSize, filteredInterviews.length)}} 
            trong tổng số {{filteredInterviews.length}} cuộc phỏng vấn
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

        <ng-template #noInterviews>
          <div class="empty-state">
            <i class="bi bi-calendar-x"></i>
            <h3>Không có cuộc phỏng vấn nào</h3>
            <p>Hãy lên lịch cuộc phỏng vấn đầu tiên</p>
            <button class="btn btn-primary" (click)="showCreateModal = true">
              <i class="bi bi-calendar-plus"></i> Lên lịch phỏng vấn
            </button>
          </div>
        </ng-template>
      </div>

      <!-- Timeline View -->
      <div class="timeline-view" *ngIf="currentView === 'timeline'">
        <div class="timeline-container">
          <div class="timeline-item" *ngFor="let interview of todayInterviews">
            <div class="timeline-time">{{interview.scheduledDate | date:'HH:mm'}}</div>
            <div class="timeline-content">
              <div class="timeline-header">
                <h4>{{interview.candidateName}}</h4>
                <span class="timeline-type">{{interview.type}}</span>
              </div>
              <p>{{interview.jobTitle}}</p>
              <div class="timeline-interviewers">
                <span *ngFor="let interviewer of interview.interviewers.slice(0, 2)">
                  {{interviewer.name}}
                </span>
              </div>
              <div class="timeline-actions">
                <button class="btn btn-sm btn-primary" (click)="joinInterview(interview)">
                  Tham gia
                </button>
                <button class="btn btn-sm btn-outline-primary" (click)="viewInterview(interview)">
                  Chi tiết
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Interview Modal -->
    <div class="modal" *ngIf="showCreateModal || showEditModal" (click)="closeModal()">
      <div class="modal-content large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{showCreateModal ? 'Lên lịch phỏng vấn mới' : 'Chỉnh sửa lịch phỏng vấn'}}</h2>
          <button class="btn-close" (click)="closeModal()">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="modal-body">
          <form [formGroup]="interviewForm" (ngSubmit)="saveInterview()">
            <div class="form-grid">
              <div class="form-group">
                <label>Ứng viên *</label>
                <select formControlName="candidateId" class="form-select" required>
                  <option value="">Chọn ứng viên</option>
                  <option *ngFor="let candidate of availableCandidates" [value]="candidate.id">
                    {{candidate.name}} - {{candidate.jobTitle}}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Loại phỏng vấn *</label>
                <select formControlName="type" class="form-select" required>
                  <option value="Phone">Điện thoại</option>
                  <option value="Online">Trực tuyến</option>
                  <option value="On-site">Tại văn phòng</option>
                  <option value="Technical">Kỹ thuật</option>
                  <option value="HR">HR</option>
                  <option value="Final">Cuối cùng</option>
                </select>
              </div>

              <div class="form-group">
                <label>Ngày phỏng vấn *</label>
                <input type="date" formControlName="scheduledDate" class="form-control" required>
              </div>

              <div class="form-group">
                <label>Giờ bắt đầu *</label>
                <input type="time" formControlName="scheduledTime" class="form-control" required>
              </div>

              <div class="form-group">
                <label>Thời lượng (phút) *</label>
                <input type="number" formControlName="duration" class="form-control" 
                       min="15" max="240" required>
              </div>

              <div class="form-group">
                <label>Giai đoạn</label>
                <select formControlName="stage" class="form-select">
                  <option value="First Round">Vòng 1</option>
                  <option value="Second Round">Vòng 2</option>
                  <option value="Final Round">Vòng cuối</option>
                  <option value="Technical">Kỹ thuật</option>
                  <option value="HR">HR</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label>Người phỏng vấn *</label>
                <div class="interviewer-selection">
                  <div class="interviewer-item" *ngFor="let interviewer of availableInterviewers">
                    <label class="checkbox-label">
                      <input type="checkbox" 
                             [checked]="isInterviewerSelected(interviewer.id)"
                             (change)="toggleInterviewer(interviewer.id, $event)">
                      <span>{{interviewer.name}} - {{interviewer.role}}</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Location Settings -->
              <div class="form-group full-width">
                <label>Địa điểm/Cách thức phỏng vấn</label>
                <div class="location-settings">
                  <div class="form-group" *ngIf="interviewForm.get('type')?.value === 'On-site'">
                    <label>Địa chỉ</label>
                    <input type="text" formControlName="address" class="form-control" 
                           placeholder="Địa chỉ văn phòng">
                  </div>
                  <div class="form-group" *ngIf="interviewForm.get('type')?.value === 'On-site'">
                    <label>Phòng họp</label>
                    <input type="text" formControlName="room" class="form-control" 
                           placeholder="Tên phòng họp">
                  </div>
                  <div class="form-group" *ngIf="interviewForm.get('type')?.value === 'Online'">
                    <label>Nền tảng</label>
                    <select formControlName="platform" class="form-select">
                      <option value="Zoom">Zoom</option>
                      <option value="Google Meet">Google Meet</option>
                      <option value="Microsoft Teams">Microsoft Teams</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>
                  <div class="form-group" *ngIf="interviewForm.get('type')?.value === 'Online'">
                    <label>Link phỏng vấn</label>
                    <input type="url" formControlName="meetingLink" class="form-control" 
                           placeholder="https://...">
                  </div>
                  <div class="form-group" *ngIf="interviewForm.get('type')?.value === 'Online'">
                    <label>Meeting ID</label>
                    <input type="text" formControlName="meetingId" class="form-control">
                  </div>
                </div>
              </div>

              <div class="form-group full-width">
                <label>Ghi chú chuẩn bị</label>
                <textarea formControlName="preparationNotes" class="form-control" rows="3"
                          placeholder="Ghi chú về chuẩn bị cho cuộc phỏng vấn..."></textarea>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>
          <button type="submit" class="btn btn-primary" 
                  [disabled]="!interviewForm.valid" 
                  (click)="saveInterview()">
            {{showCreateModal ? 'Tạo lịch phỏng vấn' : 'Cập nhật'}}
          </button>
        </div>
      </div>
    </div>

    <!-- Interview Detail Modal -->
    <div class="modal" *ngIf="selectedInterview" (click)="closeDetailModal()">
      <div class="modal-content large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Chi tiết cuộc phỏng vấn</h2>
          <button class="btn-close" (click)="closeDetailModal()">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="interview-detail">
            <div class="detail-grid">
              <div class="detail-section">
                <h3>Thông tin ứng viên</h3>
                <p><strong>Họ tên:</strong> {{selectedInterview.candidateName}}</p>
                <p><strong>Vị trí ứng tuyển:</strong> {{selectedInterview.jobTitle}}</p>
                <p><strong>Giai đoạn:</strong> {{selectedInterview.stage}}</p>
              </div>
              
              <div class="detail-section">
                <h3>Thông tin phỏng vấn</h3>
                <p><strong>Loại:</strong> {{getTypeText(selectedInterview.type)}}</p>
                <p><strong>Thời gian:</strong> {{selectedInterview.scheduledDate | date:'dd/MM/yyyy HH:mm'}}</p>
                <p><strong>Thời lượng:</strong> {{selectedInterview.duration}} phút</p>
                <p><strong>Trạng thái:</strong> {{getStatusText(selectedInterview.status)}}</p>
              </div>

              <div class="detail-section">
                <h3>Người phỏng vấn</h3>
                <div class="interviewer-list">
                  <div *ngFor="let interviewer of selectedInterview.interviewers" class="interviewer-item">
                    <strong>{{interviewer.name}}</strong> - {{interviewer.role}}
                    <span *ngIf="interviewer.isPrimary" class="primary-badge">Chính</span>
                  </div>
                </div>
              </div>

              <div class="detail-section" *ngIf="selectedInterview.location">
                <h3>Địa điểm</h3>
                <div *ngIf="selectedInterview.location.type === 'Physical'">
                  <p><strong>Địa chỉ:</strong> {{selectedInterview.location.address}}</p>
                  <p><strong>Phòng:</strong> {{selectedInterview.location.room}}</p>
                </div>
                <div *ngIf="selectedInterview.location.type === 'Online'">
                  <p><strong>Nền tảng:</strong> {{selectedInterview.location.platform}}</p>
                  <p><strong>Link:</strong> 
                    <a [href]="selectedInterview.location.meetingLink" target="_blank">
                      {{selectedInterview.location.meetingLink}}
                    </a>
                  </p>
                  <p *ngIf="selectedInterview.location.meetingId">
                    <strong>Meeting ID:</strong> {{selectedInterview.location.meetingId}}
                  </p>
                </div>
              </div>

              <div class="detail-section full-width" *ngIf="selectedInterview.preparationNotes">
                <h3>Ghi chú chuẩn bị</h3>
                <p>{{selectedInterview.preparationNotes}}</p>
              </div>

              <div class="detail-section full-width" *ngIf="selectedInterview.result">
                <h3>Kết quả phỏng vấn</h3>
                <p><strong>Trạng thái:</strong> {{selectedInterview.result.status}}</p>
                <p *ngIf="selectedInterview.result.score">
                  <strong>Điểm:</strong> {{selectedInterview.result.score}}/100
                </p>
                <p *ngIf="selectedInterview.result.feedback">
                  <strong>Phản hồi:</strong> {{selectedInterview.result.feedback}}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeDetailModal()">Đóng</button>
          <button class="btn btn-warning" (click)="rescheduleInterview(selectedInterview)">
            <i class="bi bi-calendar3"></i> Hoãn lịch
          </button>
          <button class="btn btn-primary" (click)="editInterview(selectedInterview)">
            <i class="bi bi-pencil"></i> Chỉnh sửa
          </button>
          <button class="btn btn-success" 
                  *ngIf="selectedInterview.status === 'Scheduled'"
                  (click)="joinInterview(selectedInterview)">
            <i class="bi bi-camera-video"></i> Tham gia
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .interview-management {
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

    .view-switcher {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      background: white;
      padding: 0.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      width: fit-content;
    }

    .view-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      background: transparent;
      color: #6c757d;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .view-btn.active {
      background: #007bff;
      color: white;
    }

    .view-btn:hover:not(.active) {
      background: #f8f9fa;
      color: #007bff;
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

    /* Calendar View Styles */
    .calendar-view {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
    }

    .calendar-navigation {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .calendar-navigation h3 {
      margin: 0;
      color: #2c5282;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: 100px repeat(7, 1fr);
      min-height: 600px;
    }

    .time-column {
      border-right: 1px solid #e9ecef;
    }

    .time-header {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }

    .day-column {
      border-right: 1px solid #e9ecef;
    }

    .day-column:last-child {
      border-right: none;
    }

    .day-header {
      height: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }

    .day-name {
      font-weight: 600;
      color: #2c5282;
    }

    .day-date {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .time-slot {
      height: 60px;
      border-bottom: 1px solid #f0f0f0;
      position: relative;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .time-slot:hover {
      background: #f8f9ff;
    }

    .time-column .time-slot {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      color: #6c757d;
      cursor: default;
    }

    .time-column .time-slot:hover {
      background: transparent;
    }

    .interview-item {
      position: absolute;
      top: 2px;
      left: 2px;
      right: 2px;
      bottom: 2px;
      border-radius: 4px;
      padding: 0.5rem;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 10;
    }

    .interview-item:hover {
      transform: scale(1.02);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .interview-item.phone { background: #e3f2fd; color: #1976d2; }
    .interview-item.online { background: #e8f5e8; color: #388e3c; }
    .interview-item.on-site { background: #fff3e0; color: #f57c00; }
    .interview-item.technical { background: #f3e5f5; color: #7b1fa2; }
    .interview-item.hr { background: #e0f2f1; color: #00695c; }
    .interview-item.final { background: #ffebee; color: #d32f2f; }

    .interview-time {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .interview-candidate {
      font-weight: 500;
      margin-bottom: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .interview-type {
      font-size: 0.7rem;
      opacity: 0.8;
    }

    /* List View Styles */
    .list-view {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

    .table tr.urgent {
      border-left: 4px solid #dc3545;
    }

    .table tr.today {
      background: #fff8e1;
    }

    .time-info .date {
      font-weight: 500;
      color: #2c5282;
    }

    .time-info .time {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .candidate-info .name {
      font-weight: 500;
      color: #2c5282;
    }

    .candidate-info .stage {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .type-badge,
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .type-badge.phone { background: #e3f2fd; color: #1976d2; }
    .type-badge.online { background: #e8f5e8; color: #388e3c; }
    .type-badge.on-site { background: #fff3e0; color: #f57c00; }
    .type-badge.technical { background: #f3e5f5; color: #7b1fa2; }
    .type-badge.hr { background: #e0f2f1; color: #00695c; }
    .type-badge.final { background: #ffebee; color: #d32f2f; }

    .status-badge.scheduled { background: #e3f2fd; color: #1976d2; }
    .status-badge.completed { background: #e8f5e8; color: #388e3c; }
    .status-badge.cancelled { background: #ffebee; color: #d32f2f; }
    .status-badge.rescheduled { background: #fff3e0; color: #f57c00; }

    .interviewers div {
      font-size: 0.9rem;
      color: #495057;
    }

    .more-interviewers {
      font-style: italic;
      color: #6c757d;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
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
    }

    .btn-action.view { background: #e3f2fd; color: #1976d2; }
    .btn-action.edit { background: #fff3e0; color: #f57c00; }
    .btn-action.join { background: #e8f5e8; color: #388e3c; }
    .btn-action.cancel { background: #ffebee; color: #d32f2f; }

    .btn-action:hover {
      transform: scale(1.1);
    }

    /* Timeline View Styles */
    .timeline-view {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 2rem;
    }

    .timeline-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .timeline-item {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .timeline-item:last-child {
      border-bottom: none;
    }

    .timeline-time {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2c5282;
      min-width: 80px;
      text-align: center;
    }

    .timeline-content {
      flex: 1;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .timeline-header h4 {
      margin: 0;
      color: #2c5282;
    }

    .timeline-type {
      background: #f8f9fa;
      color: #6c757d;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
    }

    .timeline-content p {
      color: #6c757d;
      margin: 0.5rem 0;
    }

    .timeline-interviewers {
      margin: 0.5rem 0;
    }

    .timeline-interviewers span {
      background: #e9ecef;
      color: #495057;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      margin-right: 0.5rem;
    }

    .timeline-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
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
    }

    .empty-state i {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: #dee2e6;
    }

    .empty-state h3 {
      margin-bottom: 0.5rem;
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
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-content.large {
      max-width: 900px;
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

    .interviewer-selection {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.5rem;
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 1rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .location-settings {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .detail-section {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
    }

    .detail-section.full-width {
      grid-column: 1 / -1;
    }

    .detail-section h3 {
      color: #2c5282;
      margin: 0 0 1rem;
      font-size: 1.1rem;
    }

    .detail-section p {
      margin: 0.5rem 0;
    }

    .interviewer-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .interviewer-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .primary-badge {
      background: #007bff;
      color: white;
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
      font-size: 0.7rem;
    }

    /* Form Styles */
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

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
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

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .calendar-grid {
        overflow-x: auto;
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

      .view-switcher {
        width: 100%;
        justify-content: center;
      }

      .calendar-header {
        flex-direction: column;
        gap: 1rem;
      }

      .table {
        font-size: 0.9rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .detail-grid {
        grid-template-columns: 1fr;
      }

      .modal-content {
        width: 95%;
        margin: 1rem;
      }
    }
  `]
})
export class InterviewManagementComponent implements OnInit {
  // Data
  interviews: Interview[] = [];
  filteredInterviews: Interview[] = [];
  paginatedInterviews: Interview[] = [];
  todayInterviews: Interview[] = [];
  availableCandidates: any[] = [];
  availableInterviewers: any[] = [];

  // View state
  currentView: 'calendar' | 'list' | 'timeline' = 'list';
  
  // Filters
  selectedStatus = '';
  selectedType = '';
  selectedDate = '';
  searchQuery = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Calendar
  currentWeekStart = new Date();
  currentWeekDays: any[] = [];
  timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  // UI State
  showCreateModal = false;
  showEditModal = false;
  selectedInterview: Interview | null = null;
  selectedInterviewers: number[] = [];

  // Form
  interviewForm: FormGroup;

  constructor(
    private interviewService: InterviewService,
    private applicationService: ApplicationService,
    private fb: FormBuilder
  ) {
    this.interviewForm = this.fb.group({
      candidateId: ['', Validators.required],
      type: ['', Validators.required],
      scheduledDate: ['', Validators.required],
      scheduledTime: ['', Validators.required],
      duration: [60, [Validators.required, Validators.min(15), Validators.max(240)]],
      stage: ['First Round'],
      address: [''],
      room: [''],
      platform: [''],
      meetingLink: [''],
      meetingId: [''],
      preparationNotes: ['']
    });
  }

  ngOnInit(): void {
    this.loadInterviews();
    this.loadAvailableCandidates();
    this.loadAvailableInterviewers();
    this.initializeCalendar();
    this.loadTodayInterviews();
  }

  loadInterviews(): void {
    this.interviewService.getAllInterviews().subscribe({
      next: (interviews) => {
        this.interviews = interviews;
        this.applyFilters();
      },
      error: (error) => console.error('Error loading interviews:', error)
    });
  }

  loadAvailableCandidates(): void {
    this.applicationService.getApplicationsByStatus('Shortlisted').subscribe({
      next: (applications) => {
        this.availableCandidates = applications.map(app => ({
          id: app.candidateId,
          name: app.candidateName,
          jobTitle: app.jobTitle,
          applicationId: app.id
        }));
      },
      error: (error) => console.error('Error loading candidates:', error)
    });
  }

  loadAvailableInterviewers(): void {
    // Mock data - in real app, this would come from API
    this.availableInterviewers = [
      { id: 1, name: 'Nguyễn Văn A', role: 'HR Manager', department: 'HR' },
      { id: 2, name: 'Trần Thị B', role: 'Technical Lead', department: 'IT' },
      { id: 3, name: 'Lê Văn C', role: 'Senior Developer', department: 'IT' },
      { id: 4, name: 'Phạm Thị D', role: 'Product Manager', department: 'Product' }
    ];
  }

  loadTodayInterviews(): void {
    const today = new Date().toISOString().split('T')[0];
    this.interviewService.getInterviewsByDate(today).subscribe({
      next: (interviews) => {
        this.todayInterviews = interviews.sort((a, b) => 
          new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
        );
      },
      error: (error) => console.error('Error loading today interviews:', error)
    });
  }

  initializeCalendar(): void {
    this.updateCalendarWeek();
  }

  updateCalendarWeek(): void {
    this.currentWeekDays = [];
    const startOfWeek = new Date(this.currentWeekStart);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      this.currentWeekDays.push({
        name: this.getDayName(date.getDay()),
        date: date,
        isToday: this.isToday(date)
      });
    }
  }

  getDayName(dayIndex: number): string {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[dayIndex];
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  getCurrentWeekRange(): string {
    const start = this.currentWeekDays[0]?.date;
    const end = this.currentWeekDays[6]?.date;
    if (!start || !end) return '';
    
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
  }

  previousWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.updateCalendarWeek();
  }

  nextWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.updateCalendarWeek();
  }

  goToToday(): void {
    this.currentWeekStart = new Date();
    // Set to start of week (Monday)
    const day = this.currentWeekStart.getDay();
    const diff = this.currentWeekStart.getDate() - day + (day === 0 ? -6 : 1);
    this.currentWeekStart.setDate(diff);
    this.updateCalendarWeek();
  }

  getInterviewsForDayHour(date: Date, hour: string): Interview[] {
    return this.interviews.filter(interview => {
      const interviewDate = new Date(interview.scheduledDate);
      const interviewHour = interviewDate.getHours().toString().padStart(2, '0') + ':00';
      
      return interviewDate.toDateString() === date.toDateString() && 
             interviewHour === hour;
    });
  }

  createInterviewAtTime(date: Date, hour: string): void {
    // Set form date and time
    const formattedDate = date.toISOString().split('T')[0];
    this.interviewForm.patchValue({
      scheduledDate: formattedDate,
      scheduledTime: hour
    });
    this.showCreateModal = true;
  }

  // View switching
  switchView(view: 'calendar' | 'list' | 'timeline'): void {
    this.currentView = view;
    if (view === 'timeline') {
      this.loadTodayInterviews();
    }
  }

  // Filtering
  applyFilters(): void {
    let filtered = [...this.interviews];

    if (this.selectedStatus) {
      filtered = filtered.filter(interview => interview.status === this.selectedStatus);
    }

    if (this.selectedType) {
      filtered = filtered.filter(interview => interview.type === this.selectedType);
    }

    if (this.selectedDate) {
      const filterDate = new Date(this.selectedDate);
      filtered = filtered.filter(interview => {
        const interviewDate = new Date(interview.scheduledDate);
        return interviewDate.toDateString() === filterDate.toDateString();
      });
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(interview => 
        interview.candidateName.toLowerCase().includes(query) ||
        interview.jobTitle.toLowerCase().includes(query) ||
        interview.interviewers.some(interviewer => 
          interviewer.name.toLowerCase().includes(query)
        )
      );
    }

    this.filteredInterviews = filtered;
    this.updatePagination();
  }

  onSearch(): void {
    this.applyFilters();
  }

  // Pagination
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredInterviews.length / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedInterviews();
  }

  updatePaginatedInterviews(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedInterviews = this.filteredInterviews.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedInterviews();
  }

  // Interview management
  viewInterview(interview: Interview, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedInterview = interview;
  }

  editInterview(interview: Interview): void {
    this.selectedInterview = interview;
    
    // Populate form with interview data
    const scheduledDate = new Date(interview.scheduledDate);
    this.interviewForm.patchValue({
      candidateId: interview.candidateId,
      type: interview.type,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      scheduledTime: scheduledDate.toTimeString().slice(0, 5),
      duration: interview.duration,
      stage: interview.stage,
      preparationNotes: interview.preparationNotes
    });

    // Set location data
    if (interview.location) {
      if (interview.location.type === 'Physical') {
        this.interviewForm.patchValue({
          address: interview.location.address,
          room: interview.location.room
        });
      } else {
        this.interviewForm.patchValue({
          platform: interview.location.platform,
          meetingLink: interview.location.meetingLink,
          meetingId: interview.location.meetingId
        });
      }
    }

    // Set selected interviewers
    this.selectedInterviewers = interview.interviewers.map(i => i.id);
    
    this.showEditModal = true;
    this.selectedInterview = null;
  }

  saveInterview(): void {
    if (this.interviewForm.valid) {
      const formValue = this.interviewForm.value;
      
      // Combine date and time
      const scheduledDateTime = new Date(`${formValue.scheduledDate}T${formValue.scheduledTime}`);
      
      const interviewData: Partial<Interview> = {
        candidateId: formValue.candidateId,
        type: formValue.type,
        scheduledDate: scheduledDateTime,
        duration: formValue.duration,
        stage: formValue.stage,
        preparationNotes: formValue.preparationNotes,
        interviewers: this.selectedInterviewers.map(id => {
          const interviewer = this.availableInterviewers.find(i => i.id === id);
          return {
            id: interviewer.id,
            name: interviewer.name,
            role: interviewer.role,
            department: interviewer.department,
            isPrimary: id === this.selectedInterviewers[0]
          };
        }),
        location: {
          type: formValue.type === 'On-site' ? 'Physical' : 'Online',
          address: formValue.address,
          room: formValue.room,
          platform: formValue.platform,
          meetingLink: formValue.meetingLink,
          meetingId: formValue.meetingId
        }
      };

      if (this.showEditModal && this.selectedInterview) {
        // Update existing interview
        this.interviewService.updateInterview(this.selectedInterview.id!, interviewData).subscribe({
          next: () => {
            this.loadInterviews();
            this.closeModal();
          },
          error: (error) => console.error('Error updating interview:', error)
        });
      } else {
        // Create new interview
        this.interviewService.createInterview(interviewData).subscribe({
          next: () => {
            this.loadInterviews();
            this.closeModal();
          },
          error: (error) => console.error('Error creating interview:', error)
        });
      }
    }
  }

  cancelInterview(interview: Interview): void {
    const reason = prompt('Lý do hủy cuộc phỏng vấn:');
    if (reason) {
      this.interviewService.cancelInterview(interview.id!, reason).subscribe({
        next: () => {
          this.loadInterviews();
        },
        error: (error) => console.error('Error cancelling interview:', error)
      });
    }
  }

  rescheduleInterview(interview: Interview): void {
    // This would open a reschedule modal
    console.log('Reschedule interview:', interview.candidateName);
  }

  joinInterview(interview: Interview): void {
    if (interview.location?.meetingLink) {
      window.open(interview.location.meetingLink, '_blank');
    } else {
      alert('Link phỏng vấn không có sẵn');
    }
  }

  // Interviewer selection
  toggleInterviewer(interviewerId: number, event: any): void {
    if (event.target.checked) {
      this.selectedInterviewers.push(interviewerId);
    } else {
      this.selectedInterviewers = this.selectedInterviewers.filter(id => id !== interviewerId);
    }
  }

  isInterviewerSelected(interviewerId: number): boolean {
    return this.selectedInterviewers.includes(interviewerId);
  }

  // Export
  exportSchedule(): void {
    this.interviewService.exportSchedule('excel').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'interview-schedule.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Error exporting schedule:', error)
    });
  }

  // Modal management
  closeModal(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.selectedInterview = null;
    this.selectedInterviewers = [];
    this.interviewForm.reset();
  }

  closeDetailModal(): void {
    this.selectedInterview = null;
  }

  // Utility methods
  getInterviewTypeClass(type: string): string {
    return type.toLowerCase().replace('-', '');
  }

  getTypeClass(type: string): string {
    return type.toLowerCase().replace('-', '');
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getTypeText(type: string): string {
    const typeMap: { [key: string]: string } = {
      'Phone': 'Điện thoại',
      'Online': 'Trực tuyến',
      'On-site': 'Tại văn phòng',
      'Technical': 'Kỹ thuật',
      'HR': 'HR',
      'Final': 'Cuối cùng'
    };
    return typeMap[type] || type;
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Scheduled': 'Đã lên lịch',
      'Completed': 'Hoàn thành',
      'Cancelled': 'Đã hủy',
      'Rescheduled': 'Đã hoãn'
    };
    return statusMap[status] || status;
  }

  getRowClass(interview: Interview): string {
    const classes = [];
    
    if (interview.priority === 'Urgent') {
      classes.push('urgent');
    }
    
    const today = new Date().toDateString();
    const interviewDate = new Date(interview.scheduledDate).toDateString();
    if (today === interviewDate) {
      classes.push('today');
    }
    
    return classes.join(' ');
  }

  Math = Math; // Expose Math to template
}