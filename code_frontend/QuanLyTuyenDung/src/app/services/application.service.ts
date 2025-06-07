import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Application } from '../models/application.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = `${environment.apiUrl}/api/Applications`;

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
    
    console.error('ApplicationService error:', error);
    return throwError(() => new Error(errorMessage));
  }

  // Lấy tất cả đơn ứng tuyển
  getAllApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  // Lấy đơn ứng tuyển theo status
  getApplicationsByStatus(status: string): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/status/${status}`)
      .pipe(catchError(this.handleError));
  }

  // Lấy đơn ứng tuyển theo job
  getApplicationsByJob(jobId: number): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/job/${jobId}`)
      .pipe(catchError(this.handleError));
  }

  // Lấy chi tiết đơn ứng tuyển
  getApplicationById(id: number): Observable<Application> {
    return this.http.get<Application>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Cập nhật status đơn ứng tuyển
  updateApplicationStatus(id: number, status: string, note?: string): Observable<Application> {
    return this.http.put<Application>(`${this.apiUrl}/${id}/status`, { status, note })
      .pipe(catchError(this.handleError));
  }

  // Thêm ghi chú HR
  addHRNote(id: number, note: string): Observable<Application> {
    return this.http.put<Application>(`${this.apiUrl}/${id}/note`, { note })
      .pipe(catchError(this.handleError));
  }

  // Đánh giá ứng viên
  rateApplication(id: number, rating: number, tags: string[]): Observable<Application> {
    return this.http.put<Application>(`${this.apiUrl}/${id}/rating`, { rating, tags })
      .pipe(catchError(this.handleError));
  }

  // Assign application to HR
  assignApplication(id: number, hrId: string): Observable<Application> {
    return this.http.put<Application>(`${this.apiUrl}/${id}/assign`, { assignedTo: hrId })
      .pipe(catchError(this.handleError));
  }

  // Tìm kiếm đơn ứng tuyển
  searchApplications(query: string): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/search?q=${query}`)
      .pipe(catchError(this.handleError));
  }

  // Lọc đơn ứng tuyển
  filterApplications(filters: any): Observable<Application[]> {
    return this.http.post<Application[]>(`${this.apiUrl}/filter`, filters)
      .pipe(catchError(this.handleError));
  }

  // Xuất danh sách ứng viên
  exportApplications(format: 'csv' | 'excel'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export?format=${format}`, { responseType: 'blob' })
      .pipe(catchError(this.handleError));
  }

  // Thống kê đơn ứng tuyển
  getApplicationStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`)
      .pipe(catchError(this.handleError));
  }

  // Bulk actions
  bulkUpdateStatus(applicationIds: number[], status: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/bulk/status`, { applicationIds, status })
      .pipe(catchError(this.handleError));
  }

  bulkDelete(applicationIds: number[]): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bulk`, { body: { applicationIds } })
      .pipe(catchError(this.handleError));
  }
}