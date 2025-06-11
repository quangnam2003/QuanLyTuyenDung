import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminReportService } from '../../../services/admin-report.service';
import { AdminReportStats } from '../../../models/admin-report.model';

@Component({
  selector: 'app-admin-report',
  templateUrl: './admin-report.component.html',
  styleUrls: ['./admin-report.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class AdminReportComponent implements OnInit {
  stats: AdminReportStats | null = null;
  isLoading = false;
  error = '';

  constructor(private reportService: AdminReportService) {}

  ngOnInit() {
    this.isLoading = true;
    this.reportService.getReportStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Không thể tải báo cáo.';
        this.isLoading = false;
      }
    });
  }
}
