import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JobManagementComponent } from './components/admin/job-management/job-management.component';
import { AdminSettingsComponent } from './components/admin/settings/admin-settings.component';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    CommonModule,
    AppComponent,
    JobManagementComponent,
    AdminSettingsComponent
  ]
})
export class AppModule { }
