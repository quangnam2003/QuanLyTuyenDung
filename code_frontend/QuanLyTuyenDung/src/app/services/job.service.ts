import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Job } from '../models/job.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = `${environment.apiUrl}/api/Jobs`;

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Đã xảy ra lỗi!';
    
    if (error.status === 0) {
      // Network error
      errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra:\n' +
                    '1. Kết nối mạng của bạn\n' +
                    '2. Backend API đang chạy\n' +
                    '3. URL API đúng (https://localhost:7029)';
    } else {
      // Server-side error
      errorMessage = `Mã lỗi: ${error.status}\nThông báo: ${error.message}`;
      if (error.error?.message) {
        errorMessage += `\nChi tiết: ${error.error.message}`;
      }
    }
    
    console.error('JobService error:', error);
    return throwError(() => new Error(errorMessage));
  }

  getAllJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getFeaturedJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/featured`)
      .pipe(catchError(this.handleError));
  }

  searchJobs(query: string): Observable<Job[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Job[]>(`${this.apiUrl}/search`, { params })
      .pipe(catchError(this.handleError));
  }

  // Tìm kiếm và lọc công việc với nhiều tham số
  searchAndFilterJobs(filters: {
    query?: string;
    type?: string;
    location?: string;
    company?: string;
    salaryMin?: number;
    salaryMax?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Observable<Job[]> {
    let params = new HttpParams();
    
    if (filters.query && filters.query.trim()) {
      params = params.set('q', filters.query.trim());
    }
    if (filters.type) {
      params = params.set('type', filters.type);
    }
    if (filters.location) {
      params = params.set('location', filters.location);
    }
    if (filters.company) {
      params = params.set('company', filters.company);
    }
    if (filters.salaryMin) {
      params = params.set('salaryMin', filters.salaryMin.toString());
    }
    if (filters.salaryMax) {
      params = params.set('salaryMax', filters.salaryMax.toString());
    }
    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
    if (filters.sortOrder) {
      params = params.set('sortOrder', filters.sortOrder);
    }

    return this.http.get<Job[]>(`${this.apiUrl}/filter`, { params })
      .pipe(catchError(this.handleError));
  }

  getJobById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createJob(job: Job): Observable<Job> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    // Log request data
    console.log('Creating job with data:', job);

    return this.http.post<Job>(this.apiUrl, job, { 
      headers,
      observe: 'response'  // Get full response
    }).pipe(
      map(response => {
        console.log('Server response:', response);
        return response.body as Job;
      }),
      catchError(error => {
        console.error('Full error details:', error);
        if (error.status === 500) {
          return throwError(() => new Error('Lỗi máy chủ nội bộ. Vui lòng thử lại sau.'));
        }
        return throwError(() => new Error(error.error?.message || 'Có lỗi xảy ra khi tạo công việc'));
      })
    );
  }

  updateJob(id: number, job: Job): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/${id}`, job)
      .pipe(catchError(this.handleError));
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getRecommendedJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/recommended`)
      .pipe(catchError(this.handleError));
  }
}
