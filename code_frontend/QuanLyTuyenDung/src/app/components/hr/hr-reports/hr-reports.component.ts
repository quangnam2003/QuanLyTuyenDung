import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';
import { InterviewService } from '../../../services/interview.service';
import { JobService } from '../../../services/job.service';

@Component({
  selector: 'app-hr-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="hr-reports">
      <div class="page-header">
        <div class="header-content">
          <h1>Báo cáo & Thống kê</h1>
          <p>Phân tích hiệu suất tuyển dụng và xu hướng</p>
        </div>
        <div class="header-actions">
          <select [(ngModel)]="selectedPeriod" (change)="updateReports()" class="form-select">
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="90days">3 tháng qua</option>
            <option value="1year">1 năm qua</option>
          </select>
          <button class="btn btn-outline-primary" (click)="exportReport()">
            <i class="bi bi-download"></i> Xuất báo cáo
          </button>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="overview-cards">
        <div class="overview-card applications">
          <div class="card-icon">
            <i class="bi bi-file-text"></i>
          </div>
          <div class="card-content">
            <h3>{{overviewData.totalApplications}}</h3>
            <p>Tổng ứng tuyển</p>
            <div class="trend" [class]="overviewData.applicationsTrend.direction">
              <i class="bi" [ngClass]="getTrendIcon(overviewData.applicationsTrend.direction)"></i>
              <span>{{overviewData.applicationsTrend.value}}% so với kỳ trước</span>
            </div>
          </div>
        </div>

        <div class="overview-card interviews">
          <div class="card-icon">
            <i class="bi bi-calendar-check"></i>
          </div>
          <div class="card-content">
            <h3>{{overviewData.totalInterviews}}</h3>
            <p>Cuộc phỏng vấn</p>
            <div class="trend" [class]="overviewData.interviewsTrend.direction">
              <i class="bi" [ngClass]="getTrendIcon(overviewData.interviewsTrend.direction)"></i>
              <span>{{overviewData.interviewsTrend.value}}% so với kỳ trước</span>
            </div>
          </div>
        </div>

        <div class="overview-card hires">
          <div class="card-icon">
            <i class="bi bi-person-check"></i>
          </div>
          <div class="card-content">
            <h3>{{overviewData.totalHires}}</h3>
            <p>Tuyển dụng thành công</p>
            <div class="trend" [class]="overviewData.hiresTrend.direction">
              <i class="bi" [ngClass]="getTrendIcon(overviewData.hiresTrend.direction)"></i>
              <span>{{overviewData.hiresTrend.value}}% so với kỳ trước</span>
            </div>
          </div>
        </div>

        <div class="overview-card time-to-hire">
          <div class="card-icon">
            <i class="bi bi-clock"></i>
          </div>
          <div class="card-content">
            <h3>{{overviewData.avgTimeToHire}}</h3>
            <p>Ngày TB để tuyển dụng</p>
            <div class="trend" [class]="overviewData.timeToHireTrend.direction">
              <i class="bi" [ngClass]="getTrendIcon(overviewData.timeToHireTrend.direction)"></i>
              <span>{{overviewData.timeToHireTrend.value}}% so với kỳ trước</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <!-- Application Funnel -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Phễu tuyển dụng</h3>
            <div class="chart-period">{{getPeriodText(selectedPeriod)}}</div>
          </div>
          <div class="funnel-chart">
            <div class="funnel-stage" *ngFor="let stage of funnelData">
              <div class="stage-bar" [style.width]="stage.percentage + '%'" [class]="stage.class">
                <div class="stage-info">
                  <span class="stage-name">{{stage.name}}</span>
                  <span class="stage-count">{{stage.count}}</span>
                </div>
              </div>
              <div class="stage-percentage">{{stage.percentage}}%</div>
            </div>
          </div>
        </div>

        <!-- Application Trend -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Xu hướng ứng tuyển</h3>
            <div class="chart-legend">
              <span class="legend-item applications">
                <span class="legend-color"></span> Ứng tuyển
              </span>
              <span class="legend-item hires">
                <span class="legend-color"></span> Tuyển dụng
              </span>
            </div>
          </div>
          <div class="trend-chart">
            <div class="chart-area">
              <div class="chart-bars">
                <div class="bar-group" *ngFor="let data of trendData">
                  <div class="bar applications" [style.height]="(data.applications / maxApplications * 100) + '%'"></div>
                  <div class="bar hires" [style.height]="(data.hires / maxApplications * 100) + '%'"></div>
                  <div class="bar-label">{{data.period}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Department Performance -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Hiệu suất theo phòng ban</h3>
          </div>
          <div class="department-chart">
            <div class="department-item" *ngFor="let dept of departmentData">
              <div class="department-info">
                <span class="department-name">{{dept.name}}</span>
                <div class="department-metrics">
                  <span class="metric">{{dept.openPositions}} vị trí</span>
                  <span class="metric">{{dept.applications}} ứng tuyển</span>
                  <span class="metric">{{dept.hires}} tuyển dụng</span>
                </div>
              </div>
              <div class="department-progress">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width]="(dept.fillRate) + '%'"></div>
                </div>
                <span class="fill-rate">{{dept.fillRate}}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Source Analysis -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Phân tích nguồn ứng tuyển</h3>
          </div>
          <div class="source-chart">
            <div class="source-pie">
              <div class="pie-segments">
                <div class="pie-segment" 
                     *ngFor="let source of sourceData; let i = index"
                     [style.transform]="'rotate(' + source.startAngle + 'deg)'"
                     [style.background]="'conic-gradient(from 0deg, ' + source.color + ' 0deg, ' + source.color + ' ' + (source.percentage * 3.6) + 'deg, transparent ' + (source.percentage * 3.6) + 'deg)'">
                </div>
              </div>
              <div class="pie-center">
                <span class="total-count">{{getTotalApplications()}}</span>
                <span class="total-label">Tổng ứng tuyển</span>
              </div>
            </div>
            <div class="source-legend">
              <div class="legend-item" *ngFor="let source of sourceData">
                <span class="legend-color" [style.background-color]="source.color"></span>
                <span class="legend-name">{{source.name}}</span>
                <span class="legend-value">{{source.count}} ({{source.percentage}}%)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Performing Jobs -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Việc làm hiệu suất cao</h3>
          </div>
          <div class="top-jobs">
            <div class="job-item" *ngFor="let job of topJobs; let i = index">
              <div class="job-rank">{{i + 1}}</div>
              <div class="job-info">
                <h4>{{job.title}}</h4>
                <p>{{job.department}} • {{job.location}}</p>
              </div>
              <div class="job-metrics">
                <div class="metric">
                  <span class="metric-value">{{job.applications}}</span>
                  <span class="metric-label">Ứng tuyển</span>
                </div>
                <div class="metric">
                  <span class="metric-value">{{job.conversionRate}}%</span>
                  <span class="metric-label">Tỷ lệ chuyển đổi</span>
                </div>
                <div class="metric">
                  <span class="metric-value">{{job.timeToFill}}</span>
                  <span class="metric-label">Ngày fill</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Interview Performance -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Hiệu suất phỏng vấn</h3>
          </div>
          <div class="interview-stats">
            <div class="interview-metrics">
              <div class="metric-card">
                <h4>{{interviewStats.totalInterviews}}</h4>
                <p>Tổng phỏng vấn</p>
              </div>
              <div class="metric-card">
                <h4>{{interviewStats.averageRating}}</h4>
                <p>Điểm TB</p>
              </div>
              <div class="metric-card">
                <h4>{{interviewStats.passRate}}%</h4>
                <p>Tỷ lệ pass</p>
              </div>
              <div class="metric-card">
                <h4>{{interviewStats.avgDuration}}</h4>
                <p>Thời lượng TB</p>
              </div>
            </div>
            
            <div class="interview-types">
              <h4>Theo loại phỏng vấn</h4>
              <div class="type-breakdown">
                <div class="type-item" *ngFor="let type of interviewTypes">
                  <div class="type-info">
                    <span class="type-name">{{type.name}}</span>
                    <span class="type-count">{{type.count}} cuộc</span>
                  </div>
                  <div class="type-rate">
                    <div class="rate-bar">
                      <div class="rate-fill" [style.width]="type.successRate + '%'"></div>
                    </div>
                    <span class="rate-text">{{type.successRate}}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Reports Section -->
      <div class="detailed-reports">
        <div class="section-header">
          <h2>Báo cáo chi tiết</h2>
        </div>
        
        <div class="report-cards">
          <div class="report-card" (click)="generateReport('recruitment-pipeline')">
            <div class="report-icon">
              <i class="bi bi-diagram-3"></i>
            </div>
            <div class="report-content">
              <h4>Pipeline tuyển dụng</h4>
              <p>Phân tích chi tiết quy trình tuyển dụng từ ứng tuyển đến onboard</p>
              <span class="report-action">Tạo báo cáo</span>
            </div>
          </div>

          <div class="report-card" (click)="generateReport('candidate-source')">
            <div class="report-icon">
              <i class="bi bi-people"></i>
            </div>
            <div class="report-content">
              <h4>Nguồn ứng viên</h4>
              <p>Hiệu quả của các kênh tuyển dụng và ROI</p>
              <span class="report-action">Tạo báo cáo</span>
            </div>
          </div>

          <div class="report-card" (click)="generateReport('hiring-manager')">
            <div class="report-icon">
              <i class="bi bi-person-badge"></i>
            </div>
            <div class="report-content">
              <h4>Hiệu suất Hiring Manager</h4>
              <p>Đánh giá hiệu quả của từng hiring manager</p>
              <span class="report-action">Tạo báo cáo</span>
            </div>
          </div>

          <div class="report-card" (click)="generateReport('time-analysis')">
            <div class="report-icon">
              <i class="bi bi-clock-history"></i>
            </div>
            <div class="report-content">
              <h4>Phân tích thời gian</h4>
              <p>Time-to-hire và bottlenecks trong quy trình</p>
              <span class="report-action">Tạo báo cáo</span>
            </div>
          </div>

          <div class="report-card" (click)="generateReport('diversity')">
            <div class="report-icon">
              <i class="bi bi-rainbow"></i>
            </div>
            <div class="report-content">
              <h4>Đa dạng & Bao gồm</h4>
              <p>Báo cáo về tính đa dạng trong tuyển dụng</p>
              <span class="report-action">Tạo báo cáo</span>
            </div>
          </div>

          <div class="report-card" (click)="generateReport('cost-analysis')">
            <div class="report-icon">
              <i class="bi bi-graph-up-arrow"></i>
            </div>
            <div class="report-content">
              <h4>Phân tích chi phí</h4>
              <p>Cost-per-hire và ROI của các hoạt động tuyển dụng</p>
              <span class="report-action">Tạo báo cáo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hr-reports {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e9ecef;
    }

    .header-content h1 {
      color: #2c5282;
      margin: 0 0 0.5rem;
      font-size: 2rem;
    }

    .header-content p {
      color: #6c757d;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    /* Overview Cards */
    .overview-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .overview-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .overview-card:hover {
      transform: translateY(-2px);
    }

    .overview-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
    }

    .overview-card.applications::before { background: #007bff; }
    .overview-card.interviews::before { background: #28a745; }
    .overview-card.hires::before { background: #ffc107; }
    .overview-card.time-to-hire::before { background: #6f42c1; }

    .card-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .overview-card.applications .card-icon {
      background: #cce5ff;
      color: #007bff;
    }

    .overview-card.interviews .card-icon {
      background: #d4edda;
      color: #28a745;
    }

    .overview-card.hires .card-icon {
      background: #fff3cd;
      color: #ffc107;
    }

    .overview-card.time-to-hire .card-icon {
      background: #e2d9f3;
      color: #6f42c1;
    }

    .card-content h3 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.25rem;
      color: #2c5282;
    }

    .card-content p {
      color: #6c757d;
      margin: 0 0 0.5rem;
      font-size: 0.9rem;
    }

    .trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
    }

    .trend.up {
      color: #28a745;
    }

    .trend.down {
      color: #dc3545;
    }

    .trend.neutral {
      color: #6c757d;
    }

    /* Charts Section */
    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e9ecef;
    }

    .chart-header h3 {
      margin: 0;
      color: #2c5282;
      font-size: 1.2rem;
    }

    .chart-period {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .chart-legend {
      display: flex;
      gap: 1rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-item.applications .legend-color {
      background: #007bff;
    }

    .legend-item.hires .legend-color {
      background: #28a745;
    }

    /* Funnel Chart */
    .funnel-chart {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .funnel-stage {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stage-bar {
      height: 40px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      padding: 0 1rem;
      min-width: 150px;
      transition: all 0.3s ease;
    }

    .stage-bar.applications {
      background: linear-gradient(90deg, #007bff, #0056b3);
      color: white;
    }

    .stage-bar.screening {
      background: linear-gradient(90deg, #17a2b8, #138496);
      color: white;
    }

    .stage-bar.interview {
      background: linear-gradient(90deg, #ffc107, #e0a800);
      color: #212529;
    }

    .stage-bar.offer {
      background: linear-gradient(90deg, #fd7e14, #e8690b);
      color: white;
    }

    .stage-bar.hired {
      background: linear-gradient(90deg, #28a745, #1e7e34);
      color: white;
    }

    .stage-info {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }

    .stage-name {
      font-weight: 500;
    }

    .stage-count {
      font-weight: 600;
    }

    .stage-percentage {
      min-width: 50px;
      text-align: right;
      color: #6c757d;
      font-weight: 500;
    }

    /* Trend Chart */
    .trend-chart {
      height: 250px;
    }

    .chart-area {
      height: 100%;
      display: flex;
      align-items: end;
    }

    .chart-bars {
      display: flex;
      align-items: end;
      justify-content: space-between;
      width: 100%;
      height: 90%;
    }

    .bar-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
      max-width: 60px;
    }

    .bar {
      width: 20px;
      border-radius: 2px 2px 0 0;
      min-height: 5px;
      transition: all 0.3s ease;
    }

    .bar.applications {
      background: #007bff;
      margin-right: 2px;
    }

    .bar.hires {
      background: #28a745;
      margin-left: 2px;
    }

    .bar-label {
      font-size: 0.8rem;
      color: #6c757d;
      text-align: center;
      margin-top: 0.5rem;
    }

    /* Department Chart */
    .department-chart {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .department-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .department-info {
      flex: 1;
    }

    .department-name {
      font-weight: 600;
      color: #2c5282;
      display: block;
      margin-bottom: 0.5rem;
    }

    .department-metrics {
      display: flex;
      gap: 1rem;
    }

    .metric {
      font-size: 0.8rem;
      color: #6c757d;
    }

    .department-progress {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 120px;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #28a745, #20c997);
      transition: width 0.3s ease;
    }

    .fill-rate {
      font-weight: 600;
      color: #28a745;
    }

    /* Source Chart */
    .source-chart {
      display: flex;
      gap: 2rem;
      align-items: center;
    }

    .source-pie {
      position: relative;
      width: 150px;
      height: 150px;
    }

    .pie-segments {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      position: relative;
      overflow: hidden;
    }

    .pie-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      background: white;
      border-radius: 50%;
      width: 80px;
      height: 80px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .total-count {
      font-size: 1.2rem;
      font-weight: 700;
      color: #2c5282;
    }

    .total-label {
      font-size: 0.7rem;
      color: #6c757d;
    }

    .source-legend {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .source-legend .legend-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .legend-name {
      flex: 1;
      margin: 0 1rem;
    }

    .legend-value {
      font-weight: 500;
      color: #2c5282;
    }

    /* Top Jobs */
    .top-jobs {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .job-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .job-rank {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #007bff;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .job-info {
      flex: 1;
    }

    .job-info h4 {
      margin: 0 0 0.25rem;
      color: #2c5282;
    }

    .job-info p {
      margin: 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .job-metrics {
      display: flex;
      gap: 1rem;
    }

    .job-metrics .metric {
      text-align: center;
    }

    .metric-value {
      display: block;
      font-weight: 600;
      color: #2c5282;
    }

    .metric-label {
      font-size: 0.8rem;
      color: #6c757d;
    }

    /* Interview Stats */
    .interview-stats {
      display: grid;
      gap: 1.5rem;
    }

    .interview-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
    }

    .metric-card {
      text-align: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .metric-card h4 {
      margin: 0 0 0.5rem;
      color: #2c5282;
      font-size: 1.5rem;
    }

    .metric-card p {
      margin: 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .interview-types h4 {
      color: #2c5282;
      margin: 0 0 1rem;
    }

    .type-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .type-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .type-info {
      flex: 1;
    }

    .type-name {
      font-weight: 500;
      color: #2c5282;
      display: block;
    }

    .type-count {
      font-size: 0.8rem;
      color: #6c757d;
    }

    .type-rate {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 100px;
    }

    .rate-bar {
      flex: 1;
      height: 6px;
      background: #e9ecef;
      border-radius: 3px;
      overflow: hidden;
    }

    .rate-fill {
      height: 100%;
      background: #28a745;
      transition: width 0.3s ease;
    }

    .rate-text {
      font-size: 0.8rem;
      font-weight: 500;
      color: #28a745;
    }

    /* Detailed Reports */
    .detailed-reports {
      margin-top: 3rem;
    }

    .section-header {
      margin-bottom: 2rem;
    }

    .section-header h2 {
      color: #2c5282;
      margin: 0;
      font-size: 1.5rem;
    }

    .report-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .report-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      gap: 1rem;
    }

    .report-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .report-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: #007bff;
    }

    .report-content {
      flex: 1;
    }

    .report-content h4 {
      margin: 0 0 0.5rem;
      color: #2c5282;
    }

    .report-content p {
      margin: 0 0 1rem;
      color: #6c757d;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .report-action {
      color: #007bff;
      font-weight: 500;
      font-size: 0.9rem;
    }

    /* Form Elements */
    .form-select {
      padding: 0.5rem 1rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 0.9rem;
      background: white;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-outline-primary {
      background: white;
      color: #007bff;
      border: 1px solid #007bff;
    }

    .btn-outline-primary:hover {
      background: #007bff;
      color: white;
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .charts-section {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 1rem;
      }

      .overview-cards {
        grid-template-columns: 1fr;
      }

      .chart-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .source-chart {
        flex-direction: column;
      }

      .interview-metrics {
        grid-template-columns: repeat(2, 1fr);
      }

      .report-cards {
        grid-template-columns: 1fr;
      }

      .department-item,
      .job-item,
      .type-item {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
      }
    }
  `]
})
export class HRReportsComponent implements OnInit {
  selectedPeriod = '30days';
  
  // Overview data
  overviewData = {
    totalApplications: 0,
    totalInterviews: 0,
    totalHires: 0,
    avgTimeToHire: 0,
    applicationsTrend: { direction: 'up', value: 12 },
    interviewsTrend: { direction: 'up', value: 8 },
    hiresTrend: { direction: 'down', value: 3 },
    timeToHireTrend: { direction: 'down', value: 5 }
  };

  // Funnel data
  funnelData = [
    { name: 'Ứng tuyển', count: 450, percentage: 100, class: 'applications' },
    { name: 'Sàng lọc', count: 180, percentage: 40, class: 'screening' },
    { name: 'Phỏng vấn', count: 90, percentage: 20, class: 'interview' },
    { name: 'Offer', count: 30, percentage: 7, class: 'offer' },
    { name: 'Tuyển dụng', count: 25, percentage: 6, class: 'hired' }
  ];

  // Trend data
  trendData: any[] = [];
  maxApplications = 0;

  // Department data
  departmentData = [
    { name: 'IT', openPositions: 15, applications: 180, hires: 12, fillRate: 80 },
    { name: 'Marketing', openPositions: 8, applications: 95, hires: 6, fillRate: 75 },
    { name: 'Sales', openPositions: 12, applications: 150, hires: 9, fillRate: 75 },
    { name: 'HR', openPositions: 3, applications: 25, hires: 2, fillRate: 67 },
    { name: 'Finance', openPositions: 5, applications: 40, hires: 3, fillRate: 60 }
  ];

  // Source data
  sourceData = [
    { name: 'Website', count: 180, percentage: 40, color: '#007bff', startAngle: 0 },
    { name: 'Job Boards', count: 135, percentage: 30, color: '#28a745', startAngle: 144 },
    { name: 'Referral', count: 90, percentage: 20, color: '#ffc107', startAngle: 252 },
    { name: 'Social Media', count: 45, percentage: 10, color: '#dc3545', startAngle: 324 }
  ];

  // Top jobs
  topJobs = [
    { title: 'Senior Frontend Developer', department: 'IT', location: 'Hà Nội', applications: 45, conversionRate: 22, timeToFill: 18 },
    { title: 'Marketing Manager', department: 'Marketing', location: 'TP.HCM', applications: 38, conversionRate: 18, timeToFill: 25 },
    { title: 'Sales Executive', department: 'Sales', location: 'Đà Nẵng', applications: 42, conversionRate: 15, timeToFill: 20 },
    { title: 'DevOps Engineer', department: 'IT', location: 'Hà Nội', applications: 28, conversionRate: 25, timeToFill: 22 },
    { title: 'Product Manager', department: 'Product', location: 'TP.HCM', applications: 35, conversionRate: 20, timeToFill: 30 }
  ];

  // Interview stats
  interviewStats = {
    totalInterviews: 234,
    averageRating: 4.2,
    passRate: 68,
    avgDuration: '45min'
  };

  // Interview types
  interviewTypes = [
    { name: 'Điện thoại', count: 89, successRate: 72 },
    { name: 'Trực tuyến', count: 95, successRate: 68 },
    { name: 'Tại văn phòng', count: 50, successRate: 75 },
    { name: 'Kỹ thuật', count: 65, successRate: 55 },
    { name: 'HR', count: 78, successRate: 82 }
  ];

  constructor(
    private applicationService: ApplicationService,
    private interviewService: InterviewService,
    private jobService: JobService
  ) { }

  ngOnInit(): void {
    this.updateReports();
  }

  updateReports(): void {
    this.loadOverviewData();
    this.loadTrendData();
    // Other data loading methods would be called here
  }

  loadOverviewData(): void {
    // Mock data based on selected period
    switch (this.selectedPeriod) {
      case '7days':
        this.overviewData = {
          totalApplications: 67,
          totalInterviews: 23,
          totalHires: 5,
          avgTimeToHire: 18,
          applicationsTrend: { direction: 'up', value: 15 },
          interviewsTrend: { direction: 'up', value: 12 },
          hiresTrend: { direction: 'neutral', value: 0 },
          timeToHireTrend: { direction: 'down', value: 8 }
        };
        break;
      case '30days':
        this.overviewData = {
          totalApplications: 245,
          totalInterviews: 89,
          totalHires: 18,
          avgTimeToHire: 22,
          applicationsTrend: { direction: 'up', value: 12 },
          interviewsTrend: { direction: 'up', value: 8 },
          hiresTrend: { direction: 'down', value: 3 },
          timeToHireTrend: { direction: 'down', value: 5 }
        };
        break;
      case '90days':
        this.overviewData = {
          totalApplications: 678,
          totalInterviews: 234,
          totalHires: 52,
          avgTimeToHire: 25,
          applicationsTrend: { direction: 'up', value: 18 },
          interviewsTrend: { direction: 'up', value: 15 },
          hiresTrend: { direction: 'up', value: 8 },
          timeToHireTrend: { direction: 'down', value: 12 }
        };
        break;
      case '1year':
        this.overviewData = {
          totalApplications: 2450,
          totalInterviews: 890,
          totalHires: 186,
          avgTimeToHire: 28,
          applicationsTrend: { direction: 'up', value: 25 },
          interviewsTrend: { direction: 'up', value: 22 },
          hiresTrend: { direction: 'up', value: 15 },
          timeToHireTrend: { direction: 'neutral', value: 2 }
        };
        break;
    }
  }

  loadTrendData(): void {
    // Generate mock trend data based on period
    this.trendData = [];
    let periods: string[] = [];
    
    switch (this.selectedPeriod) {
      case '7days':
        periods = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        break;
      case '30days':
        periods = ['T1', 'T2', 'T3', 'T4'];
        break;
      case '90days':
        periods = ['Tháng 1', 'Tháng 2', 'Tháng 3'];
        break;
      case '1year':
        periods = ['Q1', 'Q2', 'Q3', 'Q4'];
        break;
    }

    periods.forEach(period => {
      const applications = Math.floor(Math.random() * 100) + 20;
      const hires = Math.floor(applications * 0.2);
      
      this.trendData.push({
        period,
        applications,
        hires
      });
    });

    this.maxApplications = Math.max(...this.trendData.map(d => d.applications));
  }

  generateReport(reportType: string): void {
    console.log('Generating report:', reportType);
    // In real app, this would call API to generate specific report
    alert(`Đang tạo báo cáo: ${this.getReportName(reportType)}`);
  }

  exportReport(): void {
    console.log('Exporting report for period:', this.selectedPeriod);
    // In real app, this would export current view to PDF/Excel
    alert('Đang xuất báo cáo...');
  }

  getPeriodText(period: string): string {
    switch (period) {
      case '7days': return '7 ngày qua';
      case '30days': return '30 ngày qua';
      case '90days': return '3 tháng qua';
      case '1year': return '1 năm qua';
      default: return period;
    }
  }

  getReportName(reportType: string): string {
    switch (reportType) {
      case 'recruitment-pipeline': return 'Pipeline tuyển dụng';
      case 'candidate-source': return 'Nguồn ứng viên';
      case 'hiring-manager': return 'Hiệu suất Hiring Manager';
      case 'time-analysis': return 'Phân tích thời gian';
      case 'diversity': return 'Đa dạng & Bao gồm';
      case 'cost-analysis': return 'Phân tích chi phí';
      default: return reportType;
    }
  }

  getTrendIcon(direction: string): string {
    switch (direction) {
      case 'up': return 'bi-arrow-up';
      case 'down': return 'bi-arrow-down';
      case 'neutral': return 'bi-dash';
      default: return 'bi-dash';
    }
  }

  getTotalApplications(): number {
    return this.sourceData.reduce((total, source) => total + source.count, 0);
  }
}