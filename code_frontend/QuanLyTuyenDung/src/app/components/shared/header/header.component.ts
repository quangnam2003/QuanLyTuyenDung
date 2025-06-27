import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="top-bar-home">
      <div class="container topbar-flex">
        <div class="logo" style="display: flex; align-items: center; gap: 15px;">
          <img src="/topcv.png" alt="logo" style="width: 60px;"/>
          <span class="brand-title">Quản Lý Tuyển Dụng</span>
        </div>
        <nav class="main-nav-home">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Trang chủ</a>
          <a routerLink="/jobs" routerLinkActive="active">Việc làm</a>
          <a routerLink="/companies" routerLinkActive="active">Công ty</a>
        </nav>
        <div class="auth-buttons">
          <a routerLink="/login" class="btn-login">Đăng nhập</a>
          <a routerLink="/register" class="btn-register">Đăng ký</a>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .top-bar-home {
      background: white;
      padding: 15px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .topbar-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .main-nav-home {
      display: flex;
      gap: 30px;
    }

    .main-nav-home a {
      text-decoration: none;
      color: #2c3e50;
      font-weight: 500;
      padding: 5px 0;
      position: relative;
    }

    .main-nav-home a:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: #e67e22;
      transition: width 0.3s;
    }

    .main-nav-home a:hover:after,
    .main-nav-home a.active:after {
      width: 100%;
    }

    .auth-buttons {
      display: flex;
      gap: 15px;
    }

    .btn-login,
    .btn-register {
      padding: 8px 20px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s;
    }

    .btn-login {
      color: #e67e22;
      border: 1px solid #e67e22;
    }

    .btn-login:hover {
      background: rgba(230, 126, 34, 0.1);
    }

    .btn-register {
      background: #e67e22;
      color: white;
    }

    .btn-register:hover {
      background: #d35400;
    }

    @media (max-width: 768px) {
      .main-nav-home {
        display: none;
      }

      .auth-buttons {
        gap: 10px;
      }

      .btn-login,
      .btn-register {
        padding: 6px 15px;
        font-size: 0.9rem;
      }
    }
  `]
})
export class HeaderComponent { }