import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDashboardService } from '../../../services/user-dashboard.service';

@Component({
  selector: 'app-user-dashboard',
  template: `
    <div class="dashboard-container">
      <h2>Xin chào, đây là trang tổng quan</h2>
      <section class="recent-applications">
        <h3>Công ty đã gửi CV gần đây</h3>
        <div *ngIf="recentApplications.length > 0; else noApplications">
          <ul>
            <li *ngFor="let app of recentApplications">
              <strong>{{app.company}}</strong> - Vị trí: {{app.position}} <span class="status" [ngClass]="app.status.toLowerCase()">{{app.status}}</span>
            </li>
          </ul>
        </div>
        <ng-template #noApplications>
          <p>Chưa có đơn ứng tuyển nào.</p>
        </ng-template>
      </section>
      <section class="suggested-companies">
        <h3>Gợi ý công ty có thể nộp CV</h3>
        <div *ngIf="suggestedCompanies.length > 0; else noSuggestions">
          <ul>
            <li *ngFor="let company of suggestedCompanies">
              <strong>{{company.name}}</strong> - Lĩnh vực: {{company.industry}}
              <button (click)="applyToCompany(company)">Nộp CV</button>
            </li>
          </ul>
        </div>
        <ng-template #noSuggestions>
          <p>Không có gợi ý nào phù hợp.</p>
        </ng-template>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 900px; margin: 0 auto; padding: 2rem; }
    h2 { color: #2c3e50; margin-bottom: 2rem; }
    section { background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); padding: 1.5rem; margin-bottom: 2rem; }
    h3 { color: #3498db; margin-bottom: 1rem; }
    ul { list-style: none; padding: 0; }
    li { margin-bottom: 0.75rem; }
    .status { margin-left: 1rem; padding: 0.2rem 0.7rem; border-radius: 4px; font-size: 0.9rem; }
    .status.pending { background: #ffeeba; color: #856404; }
    .status.approved { background: #d4edda; color: #155724; }
    .status.rejected { background: #f8d7da; color: #721c24; }
    button { margin-left: 1rem; background: #3498db; color: #fff; border: none; border-radius: 4px; padding: 0.3rem 1rem; cursor: pointer; }
    button:hover { background: #2980b9; }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class UserDashboardComponent implements OnInit {
  recentApplications: any[] = [];
  suggestedCompanies: any[] = [];

  constructor(private dashboardService: UserDashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getRecentApplications().subscribe(data => {
      this.recentApplications = data || [];
    }, err => { this.recentApplications = []; });

    this.dashboardService.getSuggestedCompanies().subscribe(data => {
      this.suggestedCompanies = data || [];
    }, err => { this.suggestedCompanies = []; });
  }

  applyToCompany(company: any) {
    alert('Bạn đã nộp CV tới ' + company.name);
  }
} 