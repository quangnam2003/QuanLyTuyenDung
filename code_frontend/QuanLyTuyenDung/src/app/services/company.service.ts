import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Company {
  id?: number;
  name: string;
  description: string;
  industry: string;
  location: string;
  website?: string;
  size?: string;
  logo?: string;
  createdAt?: Date;
  jobCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.apiUrl}/api/Companies`;

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
    
    console.error('CompanyService error:', error);
    return throwError(() => new Error(errorMessage));
  }

  getAllCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  searchCompanies(query: string): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.apiUrl}/search?q=${query}`)
      .pipe(catchError(this.handleError));
  }

  getCompanyById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getCompaniesByIndustry(industry: string): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.apiUrl}/by-industry/${industry}`)
      .pipe(catchError(this.handleError));
  }

  getFeaturedCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.apiUrl}/featured`)
      .pipe(catchError(this.handleError));
  }

  createCompany(company: Company): Observable<Company> {
    return this.http.post<Company>(this.apiUrl, company)
      .pipe(catchError(this.handleError));
  }

  updateCompany(id: number, company: Company): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/${id}`, company)
      .pipe(catchError(this.handleError));
  }

  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }
} 