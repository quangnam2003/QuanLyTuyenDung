import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserDashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Đã xảy ra lỗi!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Mã lỗi: ${error.status}\nThông báo: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getRecentApplications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/candidates/applications`)
      .pipe(
        retry(1), // Thử lại 1 lần nếu thất bại
        catchError(this.handleError)
      );
  }

  getSuggestedCompanies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/jobs/suggested`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
} 