import { Routes } from '@angular/router';

export const HR_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/hr-dashboard/hr-dashboard.component').then(m => m.HRDashboardComponent)
  }
]; 