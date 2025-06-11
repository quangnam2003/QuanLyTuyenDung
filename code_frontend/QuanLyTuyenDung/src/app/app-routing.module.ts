// Vị trí: code_frontend/QuanLyTuyenDung/src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobManagementComponent } from './components/admin/job-management/job-management.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { HRGuard } from './guards/hr.guard';
import { UserGuard } from './guards/user.guard';
import { UserManagementComponent } from './components/admin/user-management/user-management.component';
import { UserInterfaceComponent } from './components/user/user-interface/user-interface.component';
import { UserProfileComponent } from './components/user/user-profile/user-profile.component';
import { UserDashboardComponent } from './components/user/user-dashboard/user-dashboard.component';
import { UserApplicationsComponent } from './components/user/user-applications/user-applications.component';
import { UserSettingsComponent } from './components/user/user-settings/user-settings.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { CompaniesComponent } from './components/companies/companies.component';

// HR Components
import { HRLayoutComponent } from './components/hr/hr-layout/hr-layout.component';
import { HRDashboardComponent } from './components/hr/hr-dashboard/hr-dashboard.component';
import { ApplicationManagementComponent } from './components/hr/application-management/application-management.component';
import { InterviewManagementComponent } from './components/hr/interview-management/interview-management.component';
import { CandidateManagementComponent } from './components/hr/candidate-management/candidate-management.component';
import { HRJobManagementComponent } from './components/hr/hr-job-management/hr-job-management.component';
import { HRReportsComponent } from './components/hr/hr-reports/hr-reports.component';
import { HRSettingsComponent } from './components/hr/hr-settings/hr-settings.component';

// Admin Components
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { ApplicantManagementComponent } from './components/admin/applicant-management/applicant-management.component';
import { AdminReportComponent } from './components/admin/report/admin-report.component';
import { AdminSettingsComponent } from './components/admin/settings/admin-settings.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'jobs', component: JobsComponent },
  { path: 'companies', component: CompaniesComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Admin Routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'jobs', component: JobManagementComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'applicants', component: ApplicantManagementComponent },
      { path: 'reports', component: AdminReportComponent },
      { path: 'settings', component: AdminSettingsComponent },
      // Các route khác sẽ được thêm sau
      // { path: 'candidates', component: CandidateManagementComponent },
      // { path: 'interviews', component: InterviewManagementComponent },
      // { path: 'reports', component: ReportsComponent },
    ]
  },

  // HR Routes
  {
    path: 'hr',
    component: HRLayoutComponent,
    canActivate: [AuthGuard, HRGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        component: HRDashboardComponent,
        data: { title: 'HR Dashboard' }
      },
      { 
        path: 'applications', 
        component: ApplicationManagementComponent,
        data: { title: 'Quản lý đơn ứng tuyển' }
      },
      { 
        path: 'candidates', 
        component: CandidateManagementComponent,
        data: { title: 'Quản lý ứng viên' }
      },
      { 
        path: 'interviews', 
        component: InterviewManagementComponent,
        data: { title: 'Quản lý phỏng vấn' }
      },
      { 
        path: 'jobs', 
        component: HRJobManagementComponent,
        data: { title: 'Quản lý công việc' }
      },
      { 
        path: 'reports', 
        component: HRReportsComponent,
        data: { title: 'Báo cáo & Thống kê' }
      },
      { 
        path: 'settings', 
        component: HRSettingsComponent,
        data: { title: 'Cài đặt hệ thống' }
      },
      
      // Nested routes for detailed views
      {
        path: 'applications/:id',
        component: ApplicationManagementComponent,
        data: { title: 'Chi tiết đơn ứng tuyển' }
      },
      {
        path: 'candidates/:id',
        component: CandidateManagementComponent,
        data: { title: 'Chi tiết ứng viên' }
      },
      {
        path: 'interviews/:id',
        component: InterviewManagementComponent,
        data: { title: 'Chi tiết phỏng vấn' }
      },
      {
        path: 'jobs/:id',
        component: HRJobManagementComponent,
        data: { title: 'Chi tiết công việc' }
      },

      // Action routes
      {
        path: 'interviews/new',
        component: InterviewManagementComponent,
        data: { title: 'Lên lịch phỏng vấn mới', action: 'create' }
      },
      {
        path: 'jobs/new',
        component: HRJobManagementComponent,
        data: { title: 'Tạo công việc mới', action: 'create' }
      },
      {
        path: 'candidates/new',
        component: CandidateManagementComponent,
        data: { title: 'Thêm ứng viên mới', action: 'create' }
      }
    ]
  },

  // User Routes  
  {
    path: 'user',
    component: UserInterfaceComponent,
    canActivate: [AuthGuard, UserGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        component: UserDashboardComponent,
        data: { title: 'Trang chủ' }
      },
      { 
        path: 'profile', 
        component: UserProfileComponent,
        data: { title: 'Hồ sơ của tôi' }
      },
      { 
        path: 'applications', 
        component: UserApplicationsComponent,
        data: { title: 'Đơn ứng tuyển của tôi' }
      },
      
      { 
        path: 'settings', 
        component: UserSettingsComponent,
        data: { title: 'Cài đặt tài khoản' }
      }
    ]
  },

  // Redirect based on role after login
  {
    path: 'redirect',
    canActivate: [AuthGuard],
    component: HomepageComponent, // This will be handled by the guard
    data: { redirect: true }
  },

  // 404 route
  { 
    path: '**', 
    redirectTo: '',
    data: { title: 'Trang không tìm thấy' }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // Enable tracing for debugging (disable in production)
    enableTracing: false,
    // Preloading strategy
    preloadingStrategy: undefined,
    // Scroll position restoration
    scrollPositionRestoration: 'top'
    // Custom route reuse strategy if needed
    // onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }