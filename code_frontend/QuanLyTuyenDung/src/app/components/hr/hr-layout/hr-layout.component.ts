import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-hr-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hr-layout">
      <nav class="sidebar">
        <div class="sidebar-header">
          <h2>HR Portal</h2>
        </div>
        <ul class="nav-menu">
          <li>
            <a routerLink="/hr/dashboard" routerLinkActive="active">
              <i class="bi bi-speedometer2"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a routerLink="/hr/applications" routerLinkActive="active">
              <i class="bi bi-file-text"></i>
              <span>Đơn ứng tuyển</span>
            </a>
          </li>
          <li>
            <a routerLink="/hr/candidates" routerLinkActive="active">
              <i class="bi bi-people"></i>
              <span>Ứng viên</span>
            </a>
          </li>
          <li>
            <a routerLink="/hr/interviews" routerLinkActive="active">
              <i class="bi bi-calendar-check"></i>
              <span>Phỏng vấn</span>
            </a>
          </li>
          <li>
            <a routerLink="/hr/jobs" routerLinkActive="active">
              <i class="bi bi-briefcase"></i>
              <span>Công việc</span>
            </a>
          </li>
          <li>
            <a routerLink="/hr/reports" routerLinkActive="active">
              <i class="bi bi-graph-up"></i>
              <span>Báo cáo</span>
            </a>
          </li>
          <li>
            <a routerLink="/hr/settings" routerLinkActive="active">
              <i class="bi bi-gear"></i>
              <span>Cài đặt</span>
            </a>
          </li>
        </ul>
      </nav>

      <main class="main-content">
        <header class="top-bar">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" placeholder="Tìm kiếm...">
          </div>
          <div class="user-menu">
            <button class="notifications">
              <i class="bi bi-bell"></i>
              <span class="badge">3</span>
            </button>
            <div class="user-info">
              <img src="assets/images/avatar.jpg" alt="User Avatar">
              <span>{{currentUser?.fullName}}</span>
            </div>
          </div>
        </header>

        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .hr-layout {
      display: grid;
      grid-template-columns: 250px 1fr;
      min-height: 100vh;
    }

    .sidebar {
      background: #2c3e50;
      color: white;
      padding: 1rem;
    }

    .sidebar-header {
      padding: 1rem 0;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .nav-menu {
      list-style: none;
      padding: 0;
      margin: 1rem 0;
    }

    .nav-menu li a {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .nav-menu li a:hover,
    .nav-menu li a.active {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    .nav-menu li a i {
      font-size: 1.1rem;
    }

    .main-content {
      background: #f8f9fa;
    }

    .top-bar {
      background: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f8f9fa;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      width: 300px;
    }

    .search-box input {
      border: none;
      background: none;
      outline: none;
      width: 100%;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .notifications {
      position: relative;
      background: none;
      border: none;
      font-size: 1.2rem;
      color: #6c757d;
      cursor: pointer;
    }

    .badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #dc3545;
      color: white;
      font-size: 0.7rem;
      padding: 0.2rem 0.4rem;
      border-radius: 10px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-info img {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      object-fit: cover;
    }

    .content {
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .hr-layout {
        grid-template-columns: 1fr;
      }

      .sidebar {
        display: none;
      }

      .search-box {
        width: 200px;
      }
    }
  `]
})
export class HRLayoutComponent implements OnInit {
  currentUser: any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
}