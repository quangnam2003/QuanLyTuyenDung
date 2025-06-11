import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminSettings {
  systemName: string;
  companyName: string;
  supportEmail: string;
}

@Injectable({ providedIn: 'root' })
export class AdminSettingsService {
  private apiUrl = `${environment.apiUrl}/api/admin/settings`;

  constructor(private http: HttpClient) {}

  getSettings(): Observable<AdminSettings> {
    return this.http.get<AdminSettings>(this.apiUrl);
  }

  updateSettings(settings: AdminSettings): Observable<void> {
    return this.http.put<void>(this.apiUrl, settings);
  }
}
