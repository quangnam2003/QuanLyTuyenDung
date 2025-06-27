import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { AuthResponse } from '../../../models/auth.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-container">
      <!-- Sidebar -->
      <nav class="sidebar">
        <div class="logo">Admin Portal</div>
        <ul>
          <li routerLinkActive="active"><a routerLink="/admin/dashboard">Dashboard</a></li>
          <li routerLinkActive="active"><a routerLink="/admin/jobs">Quản lý công việc</a></li>
          <li routerLinkActive="active"><a routerLink="/admin/users">Quản lý người dùng</a></li>
          <li routerLinkActive="active"><a routerLink="/admin/settings">Cài đặt</a></li>
        </ul>
      </nav>

      <!-- Main -->
      <div class="main">
        <header class="header">
          <input type="text" placeholder="Tìm kiếm..." class="search-box" />
          <div class="header-right">
            <span>{{ userName }}</span>
            <button (click)="logout()" class="btn btn-outline-danger btn-sm" style="margin-left: 12px;">Đăng xuất</button>
          </div>
        </header>
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { display: flex; min-height: 100vh; }
    .sidebar {
      width: 220px; background: #223354; color: #fff; padding: 1.5rem 0;
      display: flex; flex-direction: column; align-items: center;
    }
    .logo { font-size: 1.5rem; font-weight: bold; margin-bottom: 2rem; }
    .sidebar ul { list-style: none; padding: 0; width: 100%; }
    .sidebar li { width: 100%; }
    .sidebar a {
      display: block; color: #fff; padding: 1rem 2rem; text-decoration: none;
      transition: background 0.2s;
    }
    .sidebar a:hover, .sidebar .active a { background: #1a2540; }
    .main { flex: 1; display: flex; flex-direction: column; }
    .header {
      display: flex; justify-content: space-between; align-items: center;
      background: #fff; padding: 1rem 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.04);
    }
    .search-box { width: 300px; padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid #ddd; }
    .header-right { display: flex; align-items: center; gap: 1rem; }
    .content { padding: 2rem; background: #f8f9fa; flex: 1; }
    .dashboard-container {
      padding: 2rem;
      background: #f8f9fa;
    }
    .dashboard-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .dashboard-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      padding: 1.5rem 1.2rem;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      position: relative;
      min-height: 160px;
    }
    .icon {
      font-size: 2.2rem;
      margin-bottom: 0.5rem;
    }
    .value {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 0.2rem;
    }
    .label {
      color: #666;
      margin-bottom: 0.5rem;
    }
    .detail-link {
      color: #007bff;
      text-decoration: none;
      font-size: 0.95rem;
      margin-top: auto;
    }
    .card-blue .icon { color: #1976d2; }
    .card-green .icon { color: #43a047; }
    .card-yellow .icon { color: #fbc02d; }
    .card-purple .icon { color: #8e24aa; }
    .card-blue { border-left: 5px solid #1976d2; }
    .card-green { border-left: 5px solid #43a047; }
    .card-yellow { border-left: 5px solid #fbc02d; }
    .card-purple { border-left: 5px solid #8e24aa; }
    .dashboard-section {
      margin-top: 2rem;
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .empty-state {
      color: #aaa;
      font-style: italic;
    }
  `],
  providers: [AuthService]
})
export class AdminLayoutComponent {
  userName = '';

  constructor(private authService: AuthService, private router: Router) {
    this.authService.currentUser$.subscribe(user => {
      this.userName = user?.fullName || '';
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 