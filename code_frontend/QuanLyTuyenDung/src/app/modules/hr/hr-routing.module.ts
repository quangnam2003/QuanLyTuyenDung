import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HRLayoutComponent } from './components/hr-layout/hr-layout.component';
import { HRSettingsComponent } from './components/hr-settings/hr-settings.component';

const routes: Routes = [
  {
    path: '',
    component: HRLayoutComponent,
    children: [
      // ... existing routes ...
      {
        path: 'settings',
        component: HRSettingsComponent,
        title: 'Cài đặt công ty'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HRRoutingModule { } 