import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Job } from '../models/job.model';
import { MockDataService, Job as MockJob } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = `${environment.apiUrl}/jobs`;
  private useMockData = true; // Set to false when real API is ready

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService
  ) { }

  private convertMockJob(job: MockJob): Job {
    // Validate and convert job type to ensure it matches the union type
    const validTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'] as const;
    const jobType = validTypes.find(t => t === job.type) || 'Full-time';

    return {
      ...job,
      type: jobType,
      status: 'Active',
      department: 'General',
      numberOfPositions: 1,
      applicationDeadline: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      experienceRequired: job.experience || 'Không yêu cầu',
      benefits: job.benefits?.join('\n') || 'Thỏa thuận',
      detailedLocation: job.location,
      skills: job.requirements.split('\n'),
      education: 'Không yêu cầu',
      createdAt: job.createdAt || new Date(),
      updatedAt: new Date()
    };
  }

  getAllJobs(): Observable<Job[]> {
    if (this.useMockData) {
      const jobs = this.mockDataService.getAllJobs().map(this.convertMockJob);
      return of(jobs);
    }
    return this.http.get<Job[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getFeaturedJobs(): Observable<Job[]> {
    if (this.useMockData) {
      const jobs = this.mockDataService.getAllJobs()
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 3)
        .map(this.convertMockJob);
      return of(jobs);
    }
    return this.http.get<Job[]>(`${this.apiUrl}/featured`)
      .pipe(catchError(this.handleError));
  }

  getJobById(id: number): Observable<Job> {
    if (this.useMockData) {
      const job = this.mockDataService.getAllJobs().find(j => j.id === id);
      return job ? of(this.convertMockJob(job)) : throwError(() => new Error('Job not found'));
    }
    return this.http.get<Job>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  searchJobs(query: string): Observable<Job[]> {
    if (this.useMockData) {
      const lowercaseQuery = query.toLowerCase();
      const jobs = this.mockDataService.getAllJobs()
        .filter(job => 
          job.title.toLowerCase().includes(lowercaseQuery) ||
          job.company.toLowerCase().includes(lowercaseQuery) ||
          job.description.toLowerCase().includes(lowercaseQuery) ||
          job.location.toLowerCase().includes(lowercaseQuery)
        )
        .map(this.convertMockJob);
      return of(jobs);
    }
    return this.http.get<Job[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`)
      .pipe(catchError(this.handleError));
  }

  getRecommendedJobs(): Observable<Job[]> {
    if (this.useMockData) {
      // For mock data, return top 3 jobs sorted by view count
      const jobs = this.mockDataService.getAllJobs()
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 3)
        .map(this.convertMockJob);
      return of(jobs);
    }
    return this.http.get<Job[]>(`${this.apiUrl}/recommended`)
      .pipe(catchError(this.handleError));
  }

  createJob(job: Job): Observable<Job> {
    if (this.useMockData) {
      const mockJob: MockJob = {
        id: Date.now(),
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        salary: job.salary,
        location: job.location,
        company: job.company,
        type: job.type,
        createdAt: new Date(),
        viewCount: 0
      };
      const newJob = this.convertMockJob(mockJob);
      return of(newJob);
    }
    return this.http.post<Job>(this.apiUrl, job)
      .pipe(catchError(this.handleError));
  }

  updateJob(id: number, job: Job): Observable<Job> {
    if (this.useMockData) {
      const mockJob: MockJob = {
        id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        salary: job.salary,
        location: job.location,
        company: job.company,
        type: job.type,
        createdAt: job.createdAt || new Date(),
        viewCount: job.viewCount || 0
      };
      return of(this.convertMockJob(mockJob));
    }
    return this.http.put<Job>(`${this.apiUrl}/${id}`, job)
      .pipe(catchError(this.handleError));
  }

  deleteJob(id: number): Observable<void> {
    if (this.useMockData) {
      return of(void 0);
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Đã xảy ra lỗi khi xử lý yêu cầu.';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Mã lỗi: ${error.status}, Thông báo: ${error.message}`;
    }
    console.error('Job service error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
