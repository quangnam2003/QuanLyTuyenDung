import { Component, OnInit } from '@angular/core';
import { JobService } from '../../../services/job.service';
import { Job } from '../../../models/job.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-job-management',
  templateUrl: './job-management.component.html',
  styleUrls: ['./job-management.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class JobManagementComponent implements OnInit {
  jobs: Job[] = [];
  selectedJob: Job | null = null;
  isEditing = false;
  newJob: Job = {
    title: '',
    description: '',
    requirements: '',
    salary: '',
    location: '',
    company: '',
    type: 'Full-time',
    status: 'Active',
    department: '',
    numberOfPositions: 0,
    applicationDeadline: new Date(),
    experienceRequired: '',
    benefits: '',
    detailedLocation: '',
    skills: [],
    education: ''
  };

  constructor(private jobService: JobService) { }

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.jobService.getAllJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        console.log('Jobs loaded:', jobs);
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        alert('Có lỗi xảy ra khi tải danh sách công việc');
      }
    });
  }

  createJob(): void {
    this.jobService.createJob(this.newJob).subscribe({
      next: (job) => {
        this.jobs.push(job);
        this.resetForm();
        alert('Thêm công việc thành công');
      },
      error: (error) => {
        console.error('Error creating job:', error);
        alert('Có lỗi xảy ra khi thêm công việc');
      }
    });
  }

  editJob(job: Job): void {
    this.selectedJob = { ...job };
    this.isEditing = true;
  }

  updateJob(): void {
    if (this.selectedJob && this.selectedJob.id) {
      this.jobService.updateJob(this.selectedJob.id, this.selectedJob).subscribe({
        next: (updatedJob) => {
          const index = this.jobs.findIndex(j => j.id === updatedJob.id);
          if (index !== -1) {
            this.jobs[index] = updatedJob;
          }
          this.resetForm();
          alert('Cập nhật công việc thành công');
        },
        error: (error) => {
          console.error('Error updating job:', error);
          alert('Có lỗi xảy ra khi cập nhật công việc');
        }
      });
    }
  }

  deleteJob(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      this.jobService.deleteJob(id).subscribe({
        next: () => {
          this.jobs = this.jobs.filter(job => job.id !== id);
          alert('Xóa công việc thành công');
        },
        error: (error) => {
          console.error('Error deleting job:', error);
          alert('Có lỗi xảy ra khi xóa công việc');
        }
      });
    }
  }

  resetForm(): void {
    this.selectedJob = null;
    this.isEditing = false;
    this.newJob = {
      title: '',
      description: '',
      requirements: '',
      salary: '',
      location: '',
      company: '',
      type: 'Full-time',
      status: 'Active',
      department: '',
      numberOfPositions: 0,
      applicationDeadline: new Date(),
      experienceRequired: '',
      benefits: '',
      detailedLocation: '',
      skills: [],
      education: ''
    };
  }
} 