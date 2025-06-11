import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminSettingsService } from '../../../services/admin-settings.service';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AdminSettingsComponent implements OnInit {
  systemName: string = '';
  companyName: string = '';
  supportEmail: string = '';
  isLoading = false;
  message = '';
  error = '';

  constructor(private settingsService: AdminSettingsService) {}

  ngOnInit() {
    this.isLoading = true;
    this.settingsService.getSettings().subscribe({
      next: (data) => {
        this.systemName = data.systemName || '';
        this.companyName = data.companyName || '';
        this.supportEmail = data.supportEmail || '';
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Không thể tải thông tin cài đặt.';
        this.isLoading = false;
      }
    });
  }

  saveSettings() {
    this.isLoading = true;
    this.settingsService.updateSettings({
      systemName: this.systemName,
      companyName: this.companyName,
      supportEmail: this.supportEmail
    }).subscribe({
      next: () => {
        this.message = 'Cập nhật cài đặt thành công!';
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Cập nhật cài đặt thất bại!';
        this.isLoading = false;
      }
    });
  }
}
