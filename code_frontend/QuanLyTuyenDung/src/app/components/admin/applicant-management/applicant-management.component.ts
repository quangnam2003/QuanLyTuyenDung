import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ApplicantService } from '../../../services/application.service';
import { Applicant as ApplicantModel } from '../../../models/application.model';

@Component({
  selector: 'app-applicant-management',
  templateUrl: './applicant-management.component.html',
  styleUrls: ['./applicant-management.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ApplicantManagementComponent implements OnInit {
  applicants: ApplicantModel[] = [];
  isLoading = false;
  error = '';

  constructor(private applicantService: ApplicantService) {}

  ngOnInit() {
    this.loadApplicants();
  }

  loadApplicants() {
    this.isLoading = true;
    this.applicantService.getAllApplicants().subscribe({
      next: (data: ApplicantModel[]) => {
        this.applicants = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Không thể tải danh sách ứng viên.';
        this.isLoading = false;
      }
    });
  }

  deleteApplicant(applicant: ApplicantModel) {
    if (confirm(`Bạn có chắc muốn xóa ứng viên ${applicant.fullName}?`)) {
      this.applicantService.deleteApplicant(applicant.id).subscribe({
        next: () => this.loadApplicants(),
        error: () => this.error = 'Xóa ứng viên thất bại!'
      });
    }
  }
}
