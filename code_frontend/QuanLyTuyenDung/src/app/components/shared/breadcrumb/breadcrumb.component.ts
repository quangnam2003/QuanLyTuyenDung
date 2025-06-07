import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RouteTitleService, BreadcrumbItem } from '../../../services/route-title.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="breadcrumb-container" *ngIf="showBreadcrumb">
      <div class="breadcrumb-content">
        <!-- Main Breadcrumb -->
        <nav class="breadcrumb-nav" aria-label="Breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item" 
                *ngFor="let item of breadcrumbs$ | async; let last = last"
                [class.active]="last">
              <a *ngIf="!last && item.url" 
                 [routerLink]="item.url" 
                 class="breadcrumb-link">
                <i *ngIf="item.icon" class="bi" [ngClass]="item.icon"></i>
                <span>{{item.label}}</span>
              </a>
              <span *ngIf="last" class="breadcrumb-current">
                <i *ngIf="item.icon" class="bi" [ngClass]="item.icon"></i>
                <span>{{item.label}}</span>
              </span>
            </li>
          </ol>
        </nav>

        <!-- Page Title -->
        <div class="page-title-section" *ngIf="showTitle">
          <h1 class="page-title">{{title$ | async}}</h1>
          <p class="page-subtitle" *ngIf="subtitle">{{subtitle}}</p>
        </div>

        <!-- Actions -->
        <div class="breadcrumb-actions" *ngIf="showActions">
          <div class="contextual-actions" *ngIf="contextualActions.length > 0">
            <button *ngFor="let action of contextualActions"
                    class="action-btn"
                    (click)="onActionClick(action.action)"
                    [title]="action.label">
              <i class="bi" [ngClass]="action.icon"></i>
              <span class="action-label">{{action.label}}</span>
            </button>
          </div>
          
          <div class="custom-actions" *ngIf="customActions.length > 0">
            <button *ngFor="let action of customActions"
                    class="action-btn custom"
                    [class]="action.class || 'btn-primary'"
                    (click)="onCustomActionClick(action)"
                    [title]="action.label">
              <i *ngIf="action.icon" class="bi" [ngClass]="action.icon"></i>
              <span>{{action.label}}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Navigation -->
      <div class="quick-nav" *ngIf="showQuickNav && quickNavItems.length > 0">
        <div class="quick-nav-label">Truy cập nhanh:</div>
        <div class="quick-nav-items">
          <a *ngFor="let item of quickNavItems" 
             [routerLink]="item.url" 
             class="quick-nav-item"
             [title]="item.label">
            <i *ngIf="item.icon" class="bi" [ngClass]="item.icon"></i>
            <span>{{item.label}}</span>
          </a>
        </div>
      </div>

      <!-- Loading State -->
      <div class="breadcrumb-loading" *ngIf="loading">
        <div class="loading-skeleton breadcrumb-skeleton"></div>
        <div class="loading-skeleton title-skeleton"></div>
      </div>
    </div>
  `,
  styles: [`
    .breadcrumb-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      margin-bottom: 1.5rem;
      overflow: hidden;
    }

    .breadcrumb-content {
      padding: 1rem 1.5rem;
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1.5rem;
      align-items: center;
    }

    /* Breadcrumb Navigation */
    .breadcrumb-nav {
      min-width: 0; /* Allow shrinking */
    }

    .breadcrumb {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      margin: 0;
      padding: 0;
      list-style: none;
      gap: 0.5rem;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
    }

    .breadcrumb-item:not(:last-child)::after {
      content: '>';
      margin: 0 0.5rem;
      color: #6c757d;
      font-weight: 500;
    }

    .breadcrumb-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6c757d;
      text-decoration: none;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .breadcrumb-link:hover {
      background: #f8f9fa;
      color: #007bff;
    }

    .breadcrumb-current {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #2c5282;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .breadcrumb-item.active .breadcrumb-current {
      color: #007bff;
    }

    /* Page Title Section */
    .page-title-section {
      min-width: 0; /* Allow shrinking */
    }

    .page-title {
      margin: 0;
      color: #2c5282;
      font-size: 1.5rem;
      font-weight: 600;
      line-height: 1.2;
      word-break: break-word;
    }

    .page-subtitle {
      margin: 0.25rem 0 0;
      color: #6c757d;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    /* Actions */
    .breadcrumb-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-shrink: 0;
    }

    .contextual-actions,
    .custom-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: 1px solid #dee2e6;
      background: white;
      color: #6c757d;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .action-btn:hover {
      background: #f8f9fa;
      color: #007bff;
      border-color: #007bff;
    }

    .action-btn.custom {
      border: none;
    }

    .action-btn.btn-primary {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .action-btn.btn-primary:hover {
      background: #0056b3;
      border-color: #0056b3;
    }

    .action-btn.btn-success {
      background: #28a745;
      color: white;
      border-color: #28a745;
    }

    .action-btn.btn-success:hover {
      background: #1e7e34;
      border-color: #1e7e34;
    }

    .action-btn.btn-warning {
      background: #ffc107;
      color: #212529;
      border-color: #ffc107;
    }

    .action-btn.btn-warning:hover {
      background: #e0a800;
      border-color: #e0a800;
    }

    .action-btn.btn-danger {
      background: #dc3545;
      color: white;
      border-color: #dc3545;
    }

    .action-btn.btn-danger:hover {
      background: #c82333;
      border-color: #c82333;
    }

    .action-label {
      display: none;
    }

    /* Quick Navigation */
    .quick-nav {
      padding: 0.75rem 1.5rem;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .quick-nav-label {
      font-size: 0.8rem;
      color: #6c757d;
      font-weight: 500;
      white-space: nowrap;
    }

    .quick-nav-items {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .quick-nav-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.75rem;
      background: white;
      color: #6c757d;
      text-decoration: none;
      border-radius: 20px;
      font-size: 0.8rem;
      transition: all 0.3s ease;
      border: 1px solid #e9ecef;
    }

    .quick-nav-item:hover {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    /* Loading State */
    .breadcrumb-loading {
      padding: 1rem 1.5rem;
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .loading-skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
    }

    .breadcrumb-skeleton {
      height: 20px;
      width: 200px;
    }

    .title-skeleton {
      height: 28px;
      width: 300px;
    }

    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .breadcrumb-content {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .breadcrumb-actions {
        justify-content: flex-end;
        order: -1;
      }

      .action-label {
        display: inline;
      }
    }

    @media (max-width: 768px) {
      .breadcrumb-content {
        padding: 1rem;
      }

      .breadcrumb {
        flex-wrap: nowrap;
        overflow-x: auto;
        padding-bottom: 0.25rem;
      }

      .breadcrumb::-webkit-scrollbar {
        height: 2px;
      }

      .breadcrumb::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      .breadcrumb::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 2px;
      }

      .page-title {
        font-size: 1.25rem;
      }

      .action-btn {
        padding: 0.5rem;
      }

      .action-label {
        display: none;
      }

      .quick-nav {
        padding: 0.5rem 1rem;
      }

      .quick-nav-items {
        overflow-x: auto;
        padding-bottom: 0.25rem;
      }

      .quick-nav-items::-webkit-scrollbar {
        height: 2px;
      }

      .quick-nav-items::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      .quick-nav-items::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 2px;
      }
    }

    @media (max-width: 480px) {
      .breadcrumb-content {
        padding: 0.75rem;
      }

      .page-title {
        font-size: 1.125rem;
      }

      .breadcrumb-actions {
        flex-wrap: wrap;
      }

      .contextual-actions,
      .custom-actions {
        flex-wrap: wrap;
      }
    }
  `]
})
export class BreadcrumbComponent implements OnInit {
  @Input() showBreadcrumb = true;
  @Input() showTitle = true;
  @Input() showActions = true;
  @Input() showQuickNav = false;
  @Input() subtitle = '';
  @Input() loading = false;
  @Input() customActions: {
    label: string;
    icon?: string;
    action: string;
    class?: string;
  }[] = [];

  @Output() actionClick = new EventEmitter<string>();
  @Output() customActionClick = new EventEmitter<any>();

  breadcrumbs$: Observable<BreadcrumbItem[]>;
  title$: Observable<string>;
  contextualActions: { label: string; icon: string; action: string }[] = [];
  quickNavItems: BreadcrumbItem[] = [];

  constructor(private routeTitleService: RouteTitleService) {
    this.breadcrumbs$ = this.routeTitleService.breadcrumb$;
    this.title$ = this.routeTitleService.title$;
  }

  ngOnInit(): void {
    this.loadContextualActions();
    this.loadQuickNavigation();
  }

  private loadContextualActions(): void {
    this.contextualActions = this.routeTitleService.getContextualActions();
  }

  private loadQuickNavigation(): void {
    this.quickNavItems = this.routeTitleService.getQuickNavigation();
  }

  onActionClick(action: string): void {
    this.actionClick.emit(action);
  }

  onCustomActionClick(action: any): void {
    this.customActionClick.emit(action);
  }

  // Method to manually update contextual actions
  updateContextualActions(actions: { label: string; icon: string; action: string }[]): void {
    this.contextualActions = actions;
  }

  // Method to manually update quick navigation
  updateQuickNavigation(items: BreadcrumbItem[]): void {
    this.quickNavItems = items;
  }
}