import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('../../components/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  }
];
