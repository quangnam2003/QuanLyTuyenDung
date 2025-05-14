import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Job } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = 'https://localhost:7029/api/Jobs';

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('Lỗi kết nối:', error.error);
      return throwError(() => new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và đảm bảo API đang chạy.'));
    } else {
      console.error(`Lỗi từ máy chủ: ${error.status}, `, error.error);
      return throwError(() => new Error('Có lỗi xảy ra từ máy chủ. Vui lòng thử lại sau.'));
    }
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
    return this.http.get<Job[]>(`${this.apiUrl}/search?q=${query}`)
      .pipe(catchError(this.handleError));
  }

  getJobById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createJob(job: Job): Observable<Job> {
    return this.http.post<Job>(this.apiUrl, job)
      .pipe(catchError(this.handleError));
  }

  updateJob(id: number, job: Job): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/${id}`, job)
      .pipe(catchError(this.handleError));
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }
}
