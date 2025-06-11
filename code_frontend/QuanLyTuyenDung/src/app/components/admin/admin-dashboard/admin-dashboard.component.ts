import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminDashboardService } from '../../../services/admin-dashboard.service';
import { AdminDashboardStats } from '../../../models/admin-dashboard-stats.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AdminDashboardComponent implements OnInit {
  totalJobs: number = 0;
  totalUsers: number = 0;
  totalApplicants: number = 0;
  totalReports: number = 0;
  recentActivities: string[] = [];
  isLoading: boolean = true;
  error: string = '';

  constructor(private dashboardService: AdminDashboardService) {}

  ngOnInit() {
    this.isLoading = true;
    this.dashboardService.getStats().subscribe({
      next: (stats: AdminDashboardStats) => {
        this.totalJobs = stats.totalJobs;
        this.totalUsers = stats.totalUsers;
        this.totalApplicants = stats.totalApplicants;
        this.totalReports = stats.totalReports;
        this.recentActivities = stats.recentActivities;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Không thể tải dữ liệu dashboard.';
        this.isLoading = false;
      }
    });
  }
}
