import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminReportStats } from '../models/admin-report.model';

@Injectable({ providedIn: 'root' })
export class AdminReportService {
  private apiUrl = `${environment.apiUrl}/api/admin/report`;

  constructor(private http: HttpClient) {}

  getReportStats(): Observable<AdminReportStats> {
    return this.http.get<AdminReportStats>(this.apiUrl);
  }
}
