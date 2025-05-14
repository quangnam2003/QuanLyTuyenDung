import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobManagementComponent } from './components/admin/job-management/job-management.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { UserManagementComponent } from './components/admin/user-management/user-management.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: JobManagementComponent }, // Tạm thời dùng JobManagementComponent cho dashboard
      { path: 'jobs', component: JobManagementComponent },
      { path: 'users', component: UserManagementComponent },
      // Các route khác sẽ được thêm sau
      // { path: 'candidates', component: CandidateManagementComponent },
      // { path: 'interviews', component: InterviewManagementComponent },
      // { path: 'reports', component: ReportsComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [UserManagementComponent]
})
export class AppRoutingModule { } 