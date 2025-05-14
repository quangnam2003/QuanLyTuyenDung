import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthResponse, AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-container">
      <!-- Sidebar -->
      <nav class="admin-sidebar">
        <div class="sidebar-header">
          <h3>Admin Panel</h3>
        </div>
        <ul class="nav flex-column">
          <li class="nav-item">
            <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link">
              <i class="bi bi-speedometer2"></i> Dashboard
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/admin/jobs" routerLinkActive="active" class="nav-link">
              <i class="bi bi-briefcase"></i> Quản lý công việc
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/admin/candidates" routerLinkActive="active" class="nav-link">
              <i class="bi bi-people"></i> Quản lý ứng viên
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/admin/interviews" routerLinkActive="active" class="nav-link">
              <i class="bi bi-calendar-check"></i> Quản lý phỏng vấn
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/admin/reports" routerLinkActive="active" class="nav-link">
              <i class="bi bi-graph-up"></i> Báo cáo thống kê
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/admin/users" routerLinkActive="active" class="nav-link">
              <i class="bi bi-person-gear"></i> Quản lý người dùng
            </a>
          </li>
        </ul>
      </nav>

      <!-- Main Content -->
      <main class="admin-main">
        <header class="admin-header">
          <div class="header-content">
            <h2>Quản lý tuyển dụng</h2>
            <div class="user-menu">
              <nav>
                <ng-container *ngIf="isLoggedIn; else guest">
                  <span>Xin chào, {{ userName }}</span>
                  <button (click)="logout()">Đăng xuất</button>
                </ng-container>
                <ng-template #guest>
                  <a routerLink="/login">Đăng nhập</a>
                  <a routerLink="/register">Đăng ký</a>
                </ng-template>
              </nav>
            </div>
          </div>
        </header>
        <div class="admin-content">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      min-height: 100vh;
    }

    .admin-sidebar {
      width: 250px;
      background-color: #2c3e50;
      color: white;
      padding: 1rem;
    }

    .sidebar-header {
      padding: 1rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 1rem;
    }

    .sidebar-header h3 {
      margin: 0;
      font-size: 1.25rem;
    }

    .nav-link {
      color: rgba(255,255,255,0.8);
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s;
    }

    .nav-link:hover {
      color: white;
      background-color: rgba(255,255,255,0.1);
    }

    .nav-link.active {
      color: white;
      background-color: rgba(255,255,255,0.2);
    }

    .nav-link i {
      font-size: 1.1rem;
    }

    .admin-main {
      flex: 1;
      background-color: #f8f9fa;
    }

    .admin-header {
      background-color: white;
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-name {
      font-weight: 500;
    }

    .admin-content {
      padding: 2rem;
    }
  `],
  providers: [AuthService]
})
export class AdminLayoutComponent {
  isLoggedIn = false;
  userName = '';

  constructor(private authService: AuthService, private http: HttpClient) {
    this.authService.currentUser$.subscribe((user: any) => {
      this.isLoggedIn = !!user;
      this.userName = user?.user?.firstName || user?.fullName || user?.userName || '';
    });
  }

  logout() {
    this.authService.logout();
  }
} 