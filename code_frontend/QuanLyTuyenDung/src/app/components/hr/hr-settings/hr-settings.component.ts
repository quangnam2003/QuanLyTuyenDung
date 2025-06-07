import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-hr-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="hr-settings">
      <div class="page-header">
        <div class="header-content">
          <h1>Cài đặt hệ thống</h1>
          <p>Quản lý cấu hình và tùy chỉnh hệ thống HR</p>
        </div>
      </div>

      <!-- Settings Navigation -->
      <div class="settings-nav">
        <button class="nav-item" [class.active]="activeTab === 'profile'" (click)="setActiveTab('profile')">
          <i class="bi bi-person"></i> Hồ sơ cá nhân
        </button>
        <button class="nav-item" [class.active]="activeTab === 'notifications'" (click)="setActiveTab('notifications')">
          <i class="bi bi-bell"></i> Thông báo
        </button>
        <button class="nav-item" [class.active]="activeTab === 'workflow'" (click)="setActiveTab('workflow')">
          <i class="bi bi-diagram-3"></i> Quy trình
        </button>
        <button class="nav-item" [class.active]="activeTab === 'templates'" (click)="setActiveTab('templates')">
          <i class="bi bi-file-text"></i> Mẫu email
        </button>
        <button class="nav-item" [class.active]="activeTab === 'integrations'" (click)="setActiveTab('integrations')">
          <i class="bi bi-puzzle"></i> Tích hợp
        </button>
        <button class="nav-item" [class.active]="activeTab === 'security'" (click)="setActiveTab('security')">
          <i class="bi bi-shield"></i> Bảo mật
        </button>
      </div>

      <!-- Profile Settings -->
      <div class="settings-content" *ngIf="activeTab === 'profile'">
        <div class="settings-section">
          <h2>Thông tin cá nhân</h2>
          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
            <div class="form-grid">
              <div class="form-group">
                <label>Họ tên *</label>
                <input type="text" formControlName="fullName" class="form-control" required>
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input type="email" formControlName="email" class="form-control" required readonly>
              </div>
              <div class="form-group">
                <label>Điện thoại</label>
                <input type="tel" formControlName="phone" class="form-control">
              </div>
              <div class="form-group">
                <label>Phòng ban</label>
                <select formControlName="department" class="form-select">
                  <option value="HR">HR</option>
                  <option value="IT">IT</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div class="form-group">
                <label>Chức vụ</label>
                <input type="text" formControlName="position" class="form-control">
              </div>
              <div class="form-group">
                <label>Múi giờ</label>
                <select formControlName="timezone" class="form-select">
                  <option value="Asia/Ho_Chi_Minh">GMT+7 (Việt Nam)</option>
                  <option value="Asia/Bangkok">GMT+7 (Bangkok)</option>
                  <option value="Asia/Singapore">GMT+8 (Singapore)</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="!profileForm.valid">
                Lưu thông tin
              </button>
            </div>
          </form>
        </div>

        <div class="settings-section">
          <h2>Đổi mật khẩu</h2>
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
            <div class="form-grid">
              <div class="form-group">
                <label>Mật khẩu hiện tại *</label>
                <input type="password" formControlName="currentPassword" class="form-control" required>
              </div>
              <div class="form-group">
                <label>Mật khẩu mới *</label>
                <input type="password" formControlName="newPassword" class="form-control" required>
              </div>
              <div class="form-group">
                <label>Xác nhận mật khẩu *</label>
                <input type="password" formControlName="confirmPassword" class="form-control" required>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-warning" [disabled]="!passwordForm.valid">
                Đổi mật khẩu
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="settings-content" *ngIf="activeTab === 'notifications'">
        <div class="settings-section">
          <h2>Cài đặt thông báo</h2>
          
          <div class="notification-group">
            <h3>Thông báo email</h3>
            <div class="notification-options">
              <label class="notification-item">
                <input type="checkbox" [(ngModel)]="notificationSettings.email.newApplications">
                <span class="checkmark"></span>
                <div class="notification-content">
                  <strong>Đơn ứng tuyển mới</strong>
                  <p>Nhận email khi có đơn ứng tuyển mới</p>
                </div>
              </label>
              
              <label class="notification-item">
                <input type="checkbox" [(ngModel)]="notificationSettings.email.interviewReminders">
                <span class="checkmark"></span>
                <div class="notification-content">
                  <strong>Nhắc nhở phỏng vấn</strong>
                  <p>Nhận email nhắc nhở trước cuộc phỏng vấn</p>
                </div>
              </label>

              <label class="notification-item">
                <input type="checkbox" [(ngModel)]="notificationSettings.email.candidateUpdates">
                <span class="checkmark"></span>
                <div class="notification-content">
                  <strong>Cập nhật ứng viên</strong>
                  <p>Nhận email khi có cập nhật từ ứng viên</p>
                </div>
              </label>

              <label class="notification-item">
                <input type="checkbox" [(ngModel)]="notificationSettings.email.weeklyReports">
                <span class="checkmark"></span>
                <div class="notification-content">
                  <strong>Báo cáo tuần</strong>
                  <p>Nhận báo cáo tổng hợp hàng tuần</p>
                </div>
              </label>
            </div>
          </div>

          <div class="notification-group">
            <h3>Thông báo trong app</h3>
            <div class="notification-options">
              <label class="notification-item">
                <input type="checkbox" [(ngModel)]="notificationSettings.inApp.realTimeUpdates">
                <span class="checkmark"></span>
                <div class="notification-content">
                  <strong>Cập nhật thời gian thực</strong>
                  <p>Hiển thị thông báo ngay khi có hoạt động mới</p>
                </div>
              </label>

              <label class="notification-item">
                <input type="checkbox" [(ngModel)]="notificationSettings.inApp.taskReminders">
                <span class="checkmark"></span>
                <div class="notification-content">
                  <strong>Nhắc nhở công việc</strong>
                  <p>Nhắc nhở các công việc cần hoàn thành</p>
                </div>
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" (click)="saveNotificationSettings()">
              Lưu cài đặt
            </button>
          </div>
        </div>
      </div>

      <!-- Workflow Settings -->
      <div class="settings-content" *ngIf="activeTab === 'workflow'">
        <div class="settings-section">
          <h2>Quy trình tuyển dụng</h2>
          
          <div class="workflow-stages">
            <h3>Các giai đoạn tuyển dụng</h3>
            <div class="stages-list">
              <div class="stage-item" *ngFor="let stage of workflowStages; let i = index">
                <div class="stage-info">
                  <input type="text" [(ngModel)]="stage.name" class="form-control">
                  <input type="number" [(ngModel)]="stage.order" class="form-control" min="1">
                </div>
                <div class="stage-actions">
                  <button class="btn-action" (click)="moveStageUp(i)" [disabled]="i === 0">
                    <i class="bi bi-arrow-up"></i>
                  </button>
                  <button class="btn-action" (click)="moveStageDown(i)" [disabled]="i === workflowStages.length - 1">
                    <i class="bi bi-arrow-down"></i>
                  </button>
                  <button class="btn-action danger" (click)="removeStage(i)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            <button class="btn btn-outline-primary" (click)="addStage()">
              <i class="bi bi-plus"></i> Thêm giai đoạn
            </button>
          </div>

          <div class="workflow-automation">
            <h3>Tự động hóa</h3>
            <div class="automation-options">
              <label class="automation-item">
                <input type="checkbox" [(ngModel)]="automationSettings.autoScreening">
                <span class="checkmark"></span>
                <div class="automation-content">
                  <strong>Sàng lọc tự động</strong>
                  <p>Tự động sàng lọc ứng viên dựa trên tiêu chí đặt trước</p>
                </div>
              </label>

              <label class="automation-item">
                <input type="checkbox" [(ngModel)]="automationSettings.autoEmailResponses">
                <span class="checkmark"></span>
                <div class="automation-content">
                  <strong>Email tự động</strong>
                  <p>Gửi email xác nhận và cập nhật tự động</p>
                </div>
              </label>

              <label class="automation-item">
                <input type="checkbox" [(ngModel)]="automationSettings.interviewScheduling">
                <span class="checkmark"></span>
                <div class="automation-content">
                  <strong>Lên lịch phỏng vấn tự động</strong>
                  <p>Tự động đề xuất thời gian phỏng vấn phù hợp</p>
                </div>
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" (click)="saveWorkflowSettings()">
              Lưu quy trình
            </button>
          </div>
        </div>
      </div>

      <!-- Email Templates -->
      <div class="settings-content" *ngIf="activeTab === 'templates'">
        <div class="settings-section">
          <h2>Mẫu email</h2>
          
          <div class="templates-list">
            <div class="template-selector">
              <label>Chọn mẫu email:</label>
              <select [(ngModel)]="selectedTemplate" (change)="loadTemplate()" class="form-select">
                <option value="application-received">Xác nhận nhận đơn</option>
                <option value="interview-invitation">Mời phỏng vấn</option>
                <option value="interview-reminder">Nhắc nhở phỏng vấn</option>
                <option value="rejection">Từ chối ứng viên</option>
                <option value="job-offer">Thư mời làm việc</option>
              </select>
            </div>

            <div class="template-editor" *ngIf="currentTemplate">
              <form [formGroup]="templateForm" (ngSubmit)="saveTemplate()">
                <div class="form-group">
                  <label>Tiêu đề email</label>
                  <input type="text" formControlName="subject" class="form-control">
                </div>
                
                <div class="form-group">
                  <label>Nội dung email</label>
                  <div class="template-toolbar">
                    <button type="button" class="toolbar-btn" (click)="insertVariable('candidateName')">
                      Tên ứng viên
                    </button>
                    <button type="button" class="toolbar-btn" (click)="insertVariable('jobTitle')">
                      Tên công việc
                    </button>
                    <button type="button" class="toolbar-btn" (click)="insertVariable('companyName')">
                      Tên công ty
                    </button>
                    <button type="button" class="toolbar-btn" (click)="insertVariable('interviewDate')">
                      Ngày phỏng vấn
                    </button>
                  </div>
                  <textarea formControlName="content" class="form-control" rows="12"></textarea>
                </div>

                <div class="template-preview">
                  <h4>Xem trước</h4>
                  <div class="preview-content" [innerHTML]="getPreviewContent()"></div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-outline-secondary" (click)="resetTemplate()">
                    Khôi phục mặc định
                  </button>
                  <button type="submit" class="btn btn-primary" [disabled]="!templateForm.valid">
                    Lưu mẫu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Integrations -->
      <div class="settings-content" *ngIf="activeTab === 'integrations'">
        <div class="settings-section">
          <h2>Tích hợp bên thứ ba</h2>
          
          <div class="integrations-grid">
            <div class="integration-card">
              <div class="integration-header">
                <div class="integration-logo">
                  <i class="bi bi-linkedin"></i>
                </div>
                <div class="integration-info">
                  <h4>LinkedIn</h4>
                  <p>Đăng việc làm và tìm kiếm ứng viên</p>
                </div>
                <div class="integration-status" [class.connected]="integrations.linkedin.connected">
                  {{integrations.linkedin.connected ? 'Đã kết nối' : 'Chưa kết nối'}}
                </div>
              </div>
              <div class="integration-actions">
                <button class="btn" 
                        [class.btn-success]="!integrations.linkedin.connected"
                        [class.btn-danger]="integrations.linkedin.connected"
                        (click)="toggleIntegration('linkedin')">
                  {{integrations.linkedin.connected ? 'Ngắt kết nối' : 'Kết nối'}}
                </button>
              </div>
            </div>

            <div class="integration-card">
              <div class="integration-header">
                <div class="integration-logo">
                  <i class="bi bi-google"></i>
                </div>
                <div class="integration-info">
                  <h4>Google Calendar</h4>
                  <p>Đồng bộ lịch phỏng vấn</p>
                </div>
                <div class="integration-status" [class.connected]="integrations.googleCalendar.connected">
                  {{integrations.googleCalendar.connected ? 'Đã kết nối' : 'Chưa kết nối'}}
                </div>
              </div>
              <div class="integration-actions">
                <button class="btn" 
                        [class.btn-success]="!integrations.googleCalendar.connected"
                        [class.btn-danger]="integrations.googleCalendar.connected"
                        (click)="toggleIntegration('googleCalendar')">
                  {{integrations.googleCalendar.connected ? 'Ngắt kết nối' : 'Kết nối'}}
                </button>
              </div>
            </div>

            <div class="integration-card">
              <div class="integration-header">
                <div class="integration-logo">
                  <i class="bi bi-slack"></i>
                </div>
                <div class="integration-info">
                  <h4>Slack</h4>
                  <p>Nhận thông báo qua Slack</p>
                </div>
                <div class="integration-status" [class.connected]="integrations.slack.connected">
                  {{integrations.slack.connected ? 'Đã kết nối' : 'Chưa kết nối'}}
                </div>
              </div>
              <div class="integration-actions">
                <button class="btn" 
                        [class.btn-success]="!integrations.slack.connected"
                        [class.btn-danger]="integrations.slack.connected"
                        (click)="toggleIntegration('slack')">
                  {{integrations.slack.connected ? 'Ngắt kết nối' : 'Kết nối'}}
                </button>
              </div>
            </div>

            <div class="integration-card">
              <div class="integration-header">
                <div class="integration-logo">
                  <i class="bi bi-camera-video"></i>
                </div>
                <div class="integration-info">
                  <h4>Zoom</h4>
                  <p>Tự động tạo link phỏng vấn online</p>
                </div>
                <div class="integration-status" [class.connected]="integrations.zoom.connected">
                  {{integrations.zoom.connected ? 'Đã kết nối' : 'Chưa kết nối'}}
                </div>
              </div>
              <div class="integration-actions">
                <button class="btn" 
                        [class.btn-success]="!integrations.zoom.connected"
                        [class.btn-danger]="integrations.zoom.connected"
                        (click)="toggleIntegration('zoom')">
                  {{integrations.zoom.connected ? 'Ngắt kết nối' : 'Kết nối'}}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="settings-content" *ngIf="activeTab === 'security'">
        <div class="settings-section">
          <h2>Cài đặt bảo mật</h2>
          
          <div class="security-options">
            <div class="security-group">
              <h3>Xác thực hai bước</h3>
              <div class="security-item">
                <div class="security-info">
                  <strong>Bảo mật tài khoản với 2FA</strong>
                  <p>Thêm lớp bảo mật bổ sung cho tài khoản của bạn</p>
                </div>
                <div class="security-toggle">
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="securitySettings.twoFactorAuth">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div class="security-group">
              <h3>Phiên đăng nhập</h3>
              <div class="security-item">
                <div class="security-info">
                  <strong>Đăng xuất tự động</strong>
                  <p>Tự động đăng xuất sau khoảng thời gian không hoạt động</p>
                </div>
                <div class="security-control">
                  <select [(ngModel)]="securitySettings.sessionTimeout" class="form-select">
                    <option value="30">30 phút</option>
                    <option value="60">1 giờ</option>
                    <option value="240">4 giờ</option>
                    <option value="480">8 giờ</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="security-group">
              <h3>Quyền truy cập</h3>
              <div class="security-item">
                <div class="security-info">
                  <strong>Ghi log hoạt động</strong>
                  <p>Ghi lại tất cả hoạt động trong hệ thống</p>
                </div>
                <div class="security-toggle">
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="securitySettings.activityLogging">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div class="security-item">
                <div class="security-info">
                  <strong>Thông báo đăng nhập</strong>
                  <p>Nhận email khi có đăng nhập từ thiết bị mới</p>
                </div>
                <div class="security-toggle">
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="securitySettings.loginNotifications">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div class="security-group">
              <h3>Sao lưu dữ liệu</h3>
              <div class="security-item">
                <div class="security-info">
                  <strong>Sao lưu tự động</strong>
                  <p>Tự động sao lưu dữ liệu định kỳ</p>
                </div>
                <div class="security-control">
                  <select [(ngModel)]="securitySettings.backupFrequency" class="form-select">
                    <option value="daily">Hàng ngày</option>
                    <option value="weekly">Hàng tuần</option>
                    <option value="monthly">Hàng tháng</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" (click)="saveSecuritySettings()">
              Lưu cài đặt bảo mật
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hr-settings {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
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

    /* Settings Navigation */
    .settings-nav {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      background: white;
      padding: 0.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow-x: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: none;
      background: transparent;
      color: #6c757d;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
      font-size: 0.9rem;
    }

    .nav-item:hover {
      background: #f8f9fa;
      color: #2c5282;
    }

    .nav-item.active {
      background: #007bff;
      color: white;
    }

    .nav-item i {
      font-size: 1rem;
    }

    /* Settings Content */
    .settings-content {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .settings-section {
      margin-bottom: 3rem;
    }

    .settings-section:last-child {
      margin-bottom: 0;
    }

    .settings-section h2 {
      color: #2c5282;
      margin: 0 0 1.5rem;
      font-size: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #f0f0f0;
    }

    .settings-section h3 {
      color: #2c5282;
      margin: 0 0 1rem;
      font-size: 1.2rem;
    }

    /* Form Styles */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
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

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }

    /* Notification Settings */
    .notification-group {
      margin-bottom: 2rem;
    }

    .notification-options {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .notification-item:hover {
      background: #e9ecef;
    }

    .notification-item input[type="checkbox"] {
      display: none;
    }

    .checkmark {
      width: 20px;
      height: 20px;
      border: 2px solid #ced4da;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .notification-item input[type="checkbox"]:checked + .checkmark {
      background: #007bff;
      border-color: #007bff;
    }

    .notification-item input[type="checkbox"]:checked + .checkmark::after {
      content: '✓';
      color: white;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .notification-content {
      flex: 1;
    }

    .notification-content strong {
      color: #2c5282;
      display: block;
      margin-bottom: 0.25rem;
    }

    .notification-content p {
      color: #6c757d;
      margin: 0;
      font-size: 0.9rem;
    }

    /* Workflow Settings */
    .workflow-stages {
      margin-bottom: 2rem;
    }

    .stages-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .stage-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .stage-info {
      display: flex;
      gap: 1rem;
      flex: 1;
    }

    .stage-info .form-control {
      margin: 0;
    }

    .stage-actions {
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
      background: #e9ecef;
      color: #6c757d;
    }

    .btn-action:hover {
      transform: scale(1.1);
    }

    .btn-action:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-action.danger {
      background: #ffebee;
      color: #d32f2f;
    }

    .btn-action.danger:hover {
      background: #f8d7da;
    }

    .workflow-automation {
      margin-top: 2rem;
    }

    .automation-options {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .automation-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      cursor: pointer;
    }

    .automation-content {
      flex: 1;
    }

    .automation-content strong {
      color: #2c5282;
      display: block;
      margin-bottom: 0.25rem;
    }

    .automation-content p {
      color: #6c757d;
      margin: 0;
      font-size: 0.9rem;
    }

    /* Email Templates */
    .templates-list {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .template-selector {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .template-selector label {
      font-weight: 500;
      color: #495057;
    }

    .template-editor {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
    }

    .template-toolbar {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }

    .toolbar-btn {
      padding: 0.25rem 0.5rem;
      border: 1px solid #ced4da;
      background: white;
      color: #495057;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
    }

    .toolbar-btn:hover {
      background: #f8f9fa;
    }

    .template-preview {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .template-preview h4 {
      margin: 0 0 1rem;
      color: #2c5282;
    }

    .preview-content {
      background: white;
      padding: 1rem;
      border-radius: 4px;
      border: 1px solid #e9ecef;
      white-space: pre-wrap;
    }

    /* Integrations */
    .integrations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .integration-card {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }

    .integration-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .integration-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .integration-logo {
      width: 50px;
      height: 50px;
      border-radius: 8px;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: #007bff;
    }

    .integration-info {
      flex: 1;
    }

    .integration-info h4 {
      margin: 0 0 0.5rem;
      color: #2c5282;
    }

    .integration-info p {
      margin: 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .integration-status {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      background: #f8d7da;
      color: #721c24;
    }

    .integration-status.connected {
      background: #d4edda;
      color: #155724;
    }

    .integration-actions {
      display: flex;
      justify-content: flex-end;
    }

    /* Security Settings */
    .security-options {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .security-group {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
    }

    .security-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .security-item:last-child {
      border-bottom: none;
    }

    .security-info {
      flex: 1;
    }

    .security-info strong {
      color: #2c5282;
      display: block;
      margin-bottom: 0.25rem;
    }

    .security-info p {
      color: #6c757d;
      margin: 0;
      font-size: 0.9rem;
    }

    .security-toggle {
      margin-left: 1rem;
    }

    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 24px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.3s;
      border-radius: 24px;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }

    input:checked + .toggle-slider {
      background-color: #007bff;
    }

    input:checked + .toggle-slider:before {
      transform: translateX(26px);
    }

    .security-control {
      min-width: 150px;
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

    .btn-outline-secondary {
      background: white;
      color: #6c757d;
      border: 1px solid #6c757d;
    }

    .btn-outline-secondary:hover {
      background: #6c757d;
      color: white;
    }

    .btn-warning {
      background: #ffc107;
      color: #212529;
    }

    .btn-warning:hover {
      background: #e0a800;
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-success:hover {
      background: #1e7e34;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .integrations-grid {
        grid-template-columns: 1fr;
      }

      .settings-nav {
        flex-wrap: wrap;
      }

      .form-actions {
        flex-direction: column;
      }

      .security-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .security-toggle,
      .security-control {
        margin-left: 0;
        width: 100%;
      }

      .integration-header {
        flex-direction: column;
        text-align: center;
      }

      .template-toolbar {
        justify-content: center;
      }
    }
  `]
})
export class HRSettingsComponent implements OnInit {
  activeTab = 'profile';

  // Forms
  profileForm: FormGroup;
  passwordForm: FormGroup;
  templateForm: FormGroup;

  // Settings
  notificationSettings = {
    email: {
      newApplications: true,
      interviewReminders: true,
      candidateUpdates: false,
      weeklyReports: true
    },
    inApp: {
      realTimeUpdates: true,
      taskReminders: true
    }
  };

  automationSettings = {
    autoScreening: false,
    autoEmailResponses: true,
    interviewScheduling: false
  };

  securitySettings = {
    twoFactorAuth: false,
    sessionTimeout: 240,
    activityLogging: true,
    loginNotifications: true,
    backupFrequency: 'weekly'
  };

  integrations = {
    linkedin: { connected: false },
    googleCalendar: { connected: true },
    slack: { connected: false },
    zoom: { connected: true }
  };

  // Workflow
  workflowStages = [
    { name: 'Ứng tuyển', order: 1 },
    { name: 'Sàng lọc CV', order: 2 },
    { name: 'Phỏng vấn điện thoại', order: 3 },
    { name: 'Phỏng vấn trực tiếp', order: 4 },
    { name: 'Kiểm tra tham chiếu', order: 5 },
    { name: 'Offer', order: 6 },
    { name: 'Onboard', order: 7 }
  ];

  // Email templates
  selectedTemplate = 'application-received';
  currentTemplate: any = null;
  
  emailTemplates = {
    'application-received': {
      subject: 'Xác nhận nhận đơn ứng tuyển - {{jobTitle}}',
      content: `Chào {{candidateName}},

Cảm ơn bạn đã ứng tuyển vào vị trí {{jobTitle}} tại {{companyName}}.

Chúng tôi đã nhận được đơn ứng tuyển của bạn và sẽ xem xét trong thời gian sớm nhất. Nếu hồ sơ của bạn phù hợp với yêu cầu, chúng tôi sẽ liên hệ với bạn trong vòng 5-7 ngày làm việc.

Trân trọng,
Đội ngũ HR
{{companyName}}`
    },
    'interview-invitation': {
      subject: 'Mời phỏng vấn - {{jobTitle}}',
      content: `Chào {{candidateName}},

Chúng tôi rất vui mừng được mời bạn tham gia phỏng vấn cho vị trí {{jobTitle}} tại {{companyName}}.

Thông tin phỏng vấn:
- Thời gian: {{interviewDate}}
- Địa điểm: {{interviewLocation}}
- Người phỏng vấn: {{interviewerName}}

Vui lòng xác nhận tham gia và chuẩn bị các tài liệu cần thiết.

Trân trọng,
Đội ngũ HR
{{companyName}}`
    }
    // Add more templates as needed
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      department: ['HR'],
      position: [''],
      timezone: ['Asia/Ho_Chi_Minh']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });

    this.templateForm = this.fb.group({
      subject: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadTemplate();
  }

  loadUserProfile(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          fullName: user.fullName,
          email: user.email
        });
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Profile Methods
  saveProfile(): void {
    if (this.profileForm.valid) {
      console.log('Saving profile:', this.profileForm.value);
      alert('Đã lưu thông tin thành công!');
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      const { newPassword, confirmPassword } = this.passwordForm.value;
      if (newPassword !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp!');
        return;
      }
      console.log('Changing password');
      alert('Đã đổi mật khẩu thành công!');
      this.passwordForm.reset();
    }
  }

  // Notification Methods
  saveNotificationSettings(): void {
    console.log('Saving notification settings:', this.notificationSettings);
    alert('Đã lưu cài đặt thông báo!');
  }

  // Workflow Methods
  addStage(): void {
    const newOrder = Math.max(...this.workflowStages.map(s => s.order)) + 1;
    this.workflowStages.push({
      name: 'Giai đoạn mới',
      order: newOrder
    });
  }

  removeStage(index: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa giai đoạn này?')) {
      this.workflowStages.splice(index, 1);
    }
  }

  moveStageUp(index: number): void {
    if (index > 0) {
      [this.workflowStages[index], this.workflowStages[index - 1]] = 
      [this.workflowStages[index - 1], this.workflowStages[index]];
    }
  }

  moveStageDown(index: number): void {
    if (index < this.workflowStages.length - 1) {
      [this.workflowStages[index], this.workflowStages[index + 1]] = 
      [this.workflowStages[index + 1], this.workflowStages[index]];
    }
  }

  saveWorkflowSettings(): void {
    console.log('Saving workflow settings:', {
      stages: this.workflowStages,
      automation: this.automationSettings
    });
    alert('Đã lưu cài đặt quy trình!');
  }

  // Template Methods
  loadTemplate(): void {
    this.currentTemplate = this.emailTemplates[this.selectedTemplate as keyof typeof this.emailTemplates];
    if (this.currentTemplate) {
      this.templateForm.patchValue(this.currentTemplate);
    }
  }

  insertVariable(variable: string): void {
    const textarea = document.querySelector('textarea[formControlName="content"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      
      const newText = before + `{{${variable}}}` + after;
      this.templateForm.get('content')?.setValue(newText);
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variable.length + 4;
        textarea.focus();
      });
    }
  }

  getPreviewContent(): string {
    const content = this.templateForm.get('content')?.value || '';
    return content
      .replace(/{{candidateName}}/g, 'Nguyễn Văn A')
      .replace(/{{jobTitle}}/g, 'Frontend Developer')
      .replace(/{{companyName}}/g, 'ABC Company')
      .replace(/{{interviewDate}}/g, '15/12/2024 14:00')
      .replace(/{{interviewLocation}}/g, 'Phòng họp A - Tầng 5')
      .replace(/{{interviewerName}}/g, 'Trần Thị B - HR Manager')
      .replace(/\n/g, '<br>');
  }

  saveTemplate(): void {
    if (this.templateForm.valid) {
      console.log('Saving template:', this.selectedTemplate, this.templateForm.value);
      alert('Đã lưu mẫu email!');
    }
  }

  resetTemplate(): void {
    if (confirm('Bạn có chắc chắn muốn khôi phục mẫu mặc định?')) {
      this.loadTemplate();
    }
  }

  // Integration Methods
  toggleIntegration(integration: string): void {
    const integrationObj = this.integrations[integration as keyof typeof this.integrations];
    integrationObj.connected = !integrationObj.connected;
    
    const action = integrationObj.connected ? 'kết nối' : 'ngắt kết nối';
    console.log(`${action} integration:`, integration);
    alert(`Đã ${action} tích hợp ${integration}!`);
  }

  // Security Methods
  saveSecuritySettings(): void {
    console.log('Saving security settings:', this.securitySettings);
    alert('Đã lưu cài đặt bảo mật!');
  }
}