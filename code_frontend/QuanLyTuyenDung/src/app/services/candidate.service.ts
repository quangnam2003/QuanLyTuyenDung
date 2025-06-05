import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidate } from '../models/candidate.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = `${environment.apiUrl}/api/candidates`;

  constructor(private http: HttpClient) { }

  // Lấy thông tin CV của người dùng hiện tại
  getCurrentUserProfile(): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/profile`);
  }

  // Tạo hoặc cập nhật CV
  saveProfile(profile: Partial<Candidate>): Observable<Candidate> {
    return this.http.post<Candidate>(`${this.apiUrl}/profile`, profile);
  }

  // Upload file CV
  uploadResume(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ url: string }>(`${this.apiUrl}/upload-resume`, formData);
  }

  // Lấy danh sách CV đã upload
  getUploadedResumes(): Observable<{ type: string; name: string; url: string; uploadDate: Date }[]> {
    return this.http.get<{ type: string; name: string; url: string; uploadDate: Date }[]>(`${this.apiUrl}/documents`);
  }

  // Xóa một file CV
  deleteResume(documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/documents/${documentId}`);
  }
} 