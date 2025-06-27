import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Interview } from '../models/interview.model';
import { environment } from '../../environments/environment';
import { MockDataService, MockInterview } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private apiUrl = `${environment.apiUrl}/api/Interviews`;
  private useMockData = true; // Set to false when real API is ready

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService
  ) { }

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
    
    console.error('InterviewService error:', error);
    return throwError(() => new Error(errorMessage));
  }

  private convertMockToInterview(mockInterview: MockInterview): Interview {
    return {
      id: mockInterview.id,
      candidateId: mockInterview.candidateId,
      candidateName: mockInterview.candidateName,
      jobId: mockInterview.jobId,
      jobTitle: mockInterview.jobTitle,
      priority: mockInterview.priority,
      type: mockInterview.type,
      status: mockInterview.status,
      stage: mockInterview.stage,
      scheduledDate: mockInterview.scheduledDate,
      duration: mockInterview.duration,
      location: mockInterview.location,
      interviewers: mockInterview.interviewers,
      notes: mockInterview.notes,
      evaluations: mockInterview.evaluations,
      createdAt: mockInterview.createdAt,
      updatedAt: mockInterview.updatedAt
    };
  }

  // Lấy tất cả cuộc phỏng vấn
  getAllInterviews(): Observable<Interview[]> {
    if (this.useMockData) {
      const mockInterviews = this.mockDataService.getAllInterviews();
      const interviews = mockInterviews.map(interview => this.convertMockToInterview(interview));
      return of(interviews);
    }
    
    return this.http.get<Interview[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  // Lấy cuộc phỏng vấn theo ngày
  getInterviewsByDate(date: string): Observable<Interview[]> {
    if (this.useMockData) {
      const targetDate = new Date(date);
      const mockInterviews = this.mockDataService.getInterviewsByDate(targetDate);
      const interviews = mockInterviews.map(interview => this.convertMockToInterview(interview));
      return of(interviews);
    }
    
    return this.http.get<Interview[]>(`${this.apiUrl}/date/${date}`)
      .pipe(catchError(this.handleError));
  }

  // Lấy cuộc phỏng vấn theo status
  getInterviewsByStatus(status: string): Observable<Interview[]> {
    if (this.useMockData) {
      const mockInterviews = this.mockDataService.getInterviewsByStatus(status);
      const interviews = mockInterviews.map(interview => this.convertMockToInterview(interview));
      return of(interviews);
    }
    
    return this.http.get<Interview[]>(`${this.apiUrl}/status/${status}`)
      .pipe(catchError(this.handleError));
  }

  // Lấy cuộc phỏng vấn theo ứng viên
  getInterviewsByCandidate(candidateId: number): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.apiUrl}/candidate/${candidateId}`)
      .pipe(catchError(this.handleError));
  }

  // Lấy chi tiết cuộc phỏng vấn
  getInterviewById(id: number): Observable<Interview> {
    return this.http.get<Interview>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Tạo cuộc phỏng vấn mới
  createInterview(interview: Partial<Interview>): Observable<Interview> {
    return this.http.post<Interview>(this.apiUrl, interview)
      .pipe(catchError(this.handleError));
  }

  // Cập nhật cuộc phỏng vấn
  updateInterview(id: number, interview: Partial<Interview>): Observable<Interview> {
    return this.http.put<Interview>(`${this.apiUrl}/${id}`, interview)
      .pipe(catchError(this.handleError));
  }

  // Hủy cuộc phỏng vấn
  cancelInterview(id: number, reason: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/cancel`, { reason })
      .pipe(catchError(this.handleError));
  }

  // Hoãn cuộc phỏng vấn
  rescheduleInterview(id: number, newDate: Date): Observable<Interview> {
    return this.http.put<Interview>(`${this.apiUrl}/${id}/reschedule`, { newDate })
      .pipe(catchError(this.handleError));
  }

  // Hoàn thành cuộc phỏng vấn
  completeInterview(id: number, result: any): Observable<Interview> {
    return this.http.put<Interview>(`${this.apiUrl}/${id}/complete`, { result })
      .pipe(catchError(this.handleError));
  }

  // Thêm đánh giá
  addEvaluation(id: number, evaluation: any): Observable<Interview> {
    return this.http.post<Interview>(`${this.apiUrl}/${id}/evaluations`, evaluation)
      .pipe(catchError(this.handleError));
  }

  // Lấy lịch phỏng vấn theo tuần
  getWeeklySchedule(startDate: string): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.apiUrl}/schedule/weekly?start=${startDate}`)
      .pipe(catchError(this.handleError));
  }

  // Lấy lịch phỏng vấn theo tháng
  getMonthlySchedule(month: number, year: number): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.apiUrl}/schedule/monthly?month=${month}&year=${year}`)
      .pipe(catchError(this.handleError));
  }

  // Kiểm tra availability của interviewer
  checkInterviewerAvailability(interviewerId: number, date: string, duration: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/availability/${interviewerId}?date=${date}&duration=${duration}`)
      .pipe(catchError(this.handleError));
  }

  // Gửi email reminder
  sendReminder(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/reminder`, {})
      .pipe(catchError(this.handleError));
  }

  // Xuất lịch phỏng vấn
  exportSchedule(format: 'csv' | 'excel' | 'pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export?format=${format}`, { responseType: 'blob' })
      .pipe(catchError(this.handleError));
  }

  // Thống kê phỏng vấn
  getInterviewStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`)
      .pipe(catchError(this.handleError));
  }

  // Xóa cuộc phỏng vấn
  deleteInterview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Lấy cuộc phỏng vấn hôm nay
  getTodayInterviews(): Observable<Interview[]> {
    if (this.useMockData) {
      const today = new Date();
      const mockInterviews = this.mockDataService.getInterviewsByDate(today);
      const interviews = mockInterviews.map(interview => this.convertMockToInterview(interview));
      return of(interviews);
    }
    
    return this.http.get<Interview[]>(`${this.apiUrl}/today`)
      .pipe(catchError(this.handleError));
  }
}