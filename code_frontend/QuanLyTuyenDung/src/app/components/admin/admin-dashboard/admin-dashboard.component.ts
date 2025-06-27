import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminDashboardService, DashboardStats } from '../../../services/admin-dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // Statistics
  totalUsers: number = 0;
  newUsers: number = 0;
  totalJobs: number = 0;
  urgentJobs: number = 0;
  totalCandidates: number = 0;
  newCandidates: number = 0;

  // Activities
  recentActivities: string[] = [];
  isLoading: boolean = false;
  error: string = '';

  constructor(
    private router: Router,
    private dashboardService: AdminDashboardService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats: DashboardStats) => {
        this.totalUsers = stats.totalUsers;
        this.newUsers = stats.newUsers;
        this.totalJobs = stats.totalJobs;
        this.urgentJobs = stats.urgentJobs;
        this.totalCandidates = stats.totalCandidates;
        this.newCandidates = stats.newCandidates;
        this.recentActivities = stats.recentActivities;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = 'Không thể tải dữ liệu bảng điều khiển';
        this.isLoading = false;
        console.error('Dashboard loading error:', error);
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}