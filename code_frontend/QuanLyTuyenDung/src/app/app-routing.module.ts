import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobManagementComponent } from './components/admin/job-management/job-management.component';

export const routes: Routes = [
  { path: 'admin/jobs', component: JobManagementComponent },
  { path: '', redirectTo: '/admin/jobs', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 