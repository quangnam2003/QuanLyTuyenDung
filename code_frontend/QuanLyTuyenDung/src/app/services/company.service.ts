import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { MockDataService, Company as MockCompany } from './mock-data.service';

export interface Company extends MockCompany {
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.apiUrl}/api/Companies`;
  private useMockData = true; // Set to false when real API is ready

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private mockDataService: MockDataService
  ) {
    console.log('[CompanyService] Initialized with API URL:', this.apiUrl);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('[CompanyService] API Error:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error
    });

    let errorMessage = 'Đã xảy ra lỗi!';
    
    if (error.status === 0) {
      console.error('[CompanyService] Network or CORS error');
      errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra:\n' +
                    '1. Kết nối mạng của bạn\n' +
                    '2. Backend API đang chạy\n' +
                    '3. URL API đúng (' + environment.apiUrl + ')';
    } else if (error.status === 404) {
      console.error('[CompanyService] Resource not found');
      errorMessage = 'Không tìm thấy thông tin công ty. Vui lòng kiểm tra lại.';
    } else if (error.status === 401) {
      console.error('[CompanyService] Unauthorized access');
      this.authService.logout(); // Tự động logout nếu token hết hạn
      errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
    } else if (error.status === 403) {
      console.error('[CompanyService] Forbidden access');
      errorMessage = 'Bạn không có quyền truy cập thông tin này.';
    } else {
      console.error('[CompanyService] Other error:', error);
      errorMessage = error.error?.message || error.message || 'Đã có lỗi xảy ra';
    }
    
    return throwError(() => new Error(errorMessage));
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('[CompanyService] Getting headers with token:', token?.substring(0, 20) + '...');
    
    if (!token) {
      console.warn('[CompanyService] No auth token found');
      throw new Error('Chưa đăng nhập');
    }

    const user = this.authService.currentUserValue;
    console.log('[CompanyService] Current user:', {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      companyId: user?.companyId
    });
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getCurrentCompanyId(): number {
    console.log('[CompanyService] Getting current company ID');
    const currentUser = this.authService.currentUserValue;
    
    if (!currentUser) {
      console.error('[CompanyService] No current user found');
      throw new Error('Người dùng chưa đăng nhập');
    }
    
    if (!currentUser.companyId) {
      console.error('[CompanyService] User has no company ID:', currentUser);
      throw new Error('Không tìm thấy thông tin công ty của người dùng');
    }
    
    console.log('[CompanyService] Current company ID:', currentUser.companyId);
    return currentUser.companyId;
  }

  getCurrentCompany(): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${this.getCurrentCompanyId()}`)
      .pipe(catchError(this.handleError));
  }

  updateCurrentCompany(companyData: any): Observable<Company> {
    const formData = new FormData();
    
    Object.keys(companyData).forEach(key => {
      if (key === 'logo' && companyData[key] instanceof File) {
        formData.append('logo', companyData[key]);
      } else if (companyData[key] !== null && companyData[key] !== undefined) {
        formData.append(key, companyData[key].toString());
      }
    });

    return this.http.put<Company>(`${this.apiUrl}/${this.getCurrentCompanyId()}`, formData)
      .pipe(catchError(this.handleError));
  }

  getAllCompanies(): Observable<Company[]> {
    if (this.useMockData) {
      const companies = this.mockDataService.getAllCompanies().map(company => ({
        ...company,
        createdAt: new Date()
      }));
      return of(companies);
    }
    return this.http.get<Company[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  searchCompanies(query: string): Observable<Company[]> {
    if (this.useMockData) {
      const lowercaseQuery = query.toLowerCase();
      const companies = this.mockDataService.getAllCompanies()
        .filter(company => 
          company.name.toLowerCase().includes(lowercaseQuery) ||
          company.industry.toLowerCase().includes(lowercaseQuery) ||
          company.description?.toLowerCase().includes(lowercaseQuery) ||
          company.location.toLowerCase().includes(lowercaseQuery)
        )
        .map(company => ({
          ...company,
          createdAt: new Date()
        }));
      return of(companies);
    }
    return this.http.get<Company[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`)
      .pipe(catchError(this.handleError));
  }

  getCompanyById(id: number): Observable<Company> {
    console.log(`Fetching company with ID: ${id}`);
    if (this.useMockData) {
      const company = this.mockDataService.getAllCompanies().find(c => c.id === id);
      if (company) {
        return of({
          ...company,
          createdAt: new Date()
        });
      }
      return throwError(() => new Error('Company not found'));
    }
    return this.http.get<Company>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error fetching company:', error);
          return throwError(() => new Error('Không thể tải thông tin công ty: ' + error.message));
        })
      );
  }

  getCompaniesByIndustry(industry: string): Observable<Company[]> {
    if (this.useMockData) {
      const companies = this.mockDataService.getAllCompanies()
        .filter(company => company.industry === industry)
        .map(company => ({
          ...company,
          createdAt: new Date()
        }));
      return of(companies);
    }
    return this.http.get<Company[]>(`${this.apiUrl}/by-industry/${encodeURIComponent(industry)}`)
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

  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getCurrentUserCompany(): Observable<Company> {
    console.log('[CompanyService] Getting current user company');
    
    if (this.useMockData) {
      const currentUser = this.authService.currentUserValue;
      console.log('[CompanyService] Current user:', currentUser);
      
      if (!currentUser) {
        return throwError(() => new Error('Người dùng chưa đăng nhập'));
      }
      
      // For HR users, use their companyId if available, otherwise default to company 1
      let companyId = currentUser.companyId || 1;
      
      // Based on the debug info showing companyId: 4, let's use that for HR admin
      if (currentUser.role === 'HR' && currentUser.id === 3012) {
        companyId = 4; // Design Studio company for the HR admin user
      }
      
      console.log('[CompanyService] Looking for company with ID:', companyId);
      
      const company = this.mockDataService.getAllCompanies().find(c => c.id === companyId);
      
      if (company) {
        const result = {
          ...company,
          createdAt: new Date('2023-01-15') // Add a registration date
        };
        console.log('[CompanyService] Found company:', result);
        return of(result);
      }
      
      return throwError(() => new Error('Không tìm thấy thông tin công ty'));
    }

    try {
      const companyId = this.getCurrentCompanyId();
      return this.http.get<Company>(`${this.apiUrl}/${companyId}`, { headers: this.getHeaders() })
        .pipe(
          retry(2),
          tap(company => {
            console.log('[CompanyService] Fetched company data:', company);
          }),
          catchError(error => {
            console.error('[CompanyService] Error fetching company:', error);
            
            if (error.status === 404) {
              return throwError(() => new Error('Không tìm thấy thông tin công ty. Có thể công ty chưa được tạo.'));
            }
            
            return this.handleError(error);
          })
        );
    } catch (error) {
      console.error('[CompanyService] Error getting company ID:', error);
      return throwError(() => error);
    }
  }

  updateCompany(id: number, company: Partial<Company>): Observable<Company> {
    console.log('Updating company:', { id, data: company });
    return this.http.put<Company>(`${this.apiUrl}/${id}`, company, { headers: this.getHeaders() })
      .pipe(
        tap(updatedCompany => console.log('Company updated:', updatedCompany)),
        catchError(error => {
          console.error('Error updating company:', error);
          return throwError(() => new Error('Không thể cập nhật thông tin công ty: ' + error.message));
        })
      );
  }

  uploadLogo(id: number, file: File): Observable<any> {
    console.log('Uploading logo for company:', id);
    const formData = new FormData();
    formData.append('logo', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.post(`${this.apiUrl}/${id}/logo`, formData, { headers })
      .pipe(
        tap(response => console.log('Logo upload response:', response)),
        catchError(error => {
          console.error('Error uploading logo:', error);
          return throwError(() => new Error('Không thể tải lên logo: ' + error.message));
        })
      );
  }
} 