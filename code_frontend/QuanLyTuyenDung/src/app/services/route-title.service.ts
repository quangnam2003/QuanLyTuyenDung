import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

export interface BreadcrumbItem {
  label: string;
  url: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RouteTitleService {
  private titleSubject = new BehaviorSubject<string>('Quản Lý Tuyển Dụng');
  private breadcrumbSubject = new BehaviorSubject<BreadcrumbItem[]>([]);

  public title$ = this.titleSubject.asObservable();
  public breadcrumb$ = this.breadcrumbSubject.asObservable();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        switchMap(route => route.data)
      )
      .subscribe(data => {
        const title = data['title'] || 'Quản Lý Tuyển Dụng';
        this.setTitle(title);
        this.updateBreadcrumb();
      });
  }

  setTitle(title: string): void {
    this.titleService.setTitle(title);
    this.titleSubject.next(title);
  }

  private updateBreadcrumb(): void {
    const breadcrumbs: BreadcrumbItem[] = [];
    const url = this.router.url;
    const segments = url.split('/').filter(segment => segment);

    // Add home
    breadcrumbs.push({
      label: 'Trang chủ',
      url: '/',
      icon: 'bi-house'
    });

    // Build breadcrumb based on URL segments
    let currentUrl = '';
    segments.forEach((segment, index) => {
      currentUrl += `/${segment}`;
      
      const breadcrumbItem = this.getBreadcrumbItem(segment, currentUrl, segments, index);
      if (breadcrumbItem) {
        breadcrumbs.push(breadcrumbItem);
      }
    });

    this.breadcrumbSubject.next(breadcrumbs);
  }

  private getBreadcrumbItem(
    segment: string, 
    url: string, 
    allSegments: string[], 
    index: number
  ): BreadcrumbItem | null {
    // Skip numeric IDs and action parameters
    if (/^\d+$/.test(segment) || segment === 'new') {
      return null;
    }

    const breadcrumbMap: { [key: string]: BreadcrumbItem } = {
      // Admin routes
      'admin': {
        label: 'Quản trị',
        url: '/admin',
        icon: 'bi-gear'
      },
      
      // HR routes
      'hr': {
        label: 'HR',
        url: '/hr',
        icon: 'bi-people'
      },
      'dashboard': {
        label: 'Tổng quan',
        url: url,
        icon: 'bi-speedometer2'
      },
      'applications': {
        label: 'Đơn ứng tuyển',
        url: url,
        icon: 'bi-file-text'
      },
      'candidates': {
        label: 'Ứng viên',
        url: url,
        icon: 'bi-people'
      },
      'interviews': {
        label: 'Phỏng vấn',
        url: url,
        icon: 'bi-calendar-check'
      },
      'jobs': {
        label: 'Công việc',
        url: url,
        icon: 'bi-briefcase'
      },
      'reports': {
        label: 'Báo cáo',
        url: url,
        icon: 'bi-graph-up'
      },
      'settings': {
        label: 'Cài đặt',
        url: url,
        icon: 'bi-gear'
      },
      
      // User routes
      'user': {
        label: 'Người dùng',
        url: '/user',
        icon: 'bi-person'
      },
      'profile': {
        label: 'Hồ sơ',
        url: url,
        icon: 'bi-person-circle'
      },
      'saved-jobs': {
        label: 'Việc làm đã lưu',
        url: url,
        icon: 'bi-bookmark'
      },
      
      // Admin specific
      'users': {
        label: 'Quản lý người dùng',
        url: url,
        icon: 'bi-people'
      }
    };

    return breadcrumbMap[segment] || {
      label: this.formatSegmentLabel(segment),
      url: url
    };
  }

  private formatSegmentLabel(segment: string): string {
    // Convert kebab-case to title case
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Helper methods for components
  getCurrentTitle(): string {
    return this.titleSubject.value;
  }

  getCurrentBreadcrumbs(): BreadcrumbItem[] {
    return this.breadcrumbSubject.value;
  }

  // Method to manually set breadcrumbs for complex scenarios
  setBreadcrumbs(breadcrumbs: BreadcrumbItem[]): void {
    this.breadcrumbSubject.next(breadcrumbs);
  }

  // Method to add a breadcrumb item
  addBreadcrumb(item: BreadcrumbItem): void {
    const current = this.breadcrumbSubject.value;
    this.breadcrumbSubject.next([...current, item]);
  }

  // Method to get contextual actions based on current route
  getContextualActions(): { label: string; icon: string; action: string }[] {
    const url = this.router.url;
    const actions: { label: string; icon: string; action: string }[] = [];

    // Add actions based on current route
    if (url.includes('/hr/applications')) {
      actions.push(
        { label: 'Lọc', icon: 'bi-funnel', action: 'filter' },
        { label: 'Xuất Excel', icon: 'bi-download', action: 'export' }
      );
    } else if (url.includes('/hr/interviews')) {
      actions.push(
        { label: 'Lên lịch mới', icon: 'bi-calendar-plus', action: 'create' },
        { label: 'Xem lịch', icon: 'bi-calendar3', action: 'calendar' }
      );
    } else if (url.includes('/hr/jobs')) {
      actions.push(
        { label: 'Tạo công việc', icon: 'bi-plus-circle', action: 'create' },
        { label: 'Mẫu công việc', icon: 'bi-file-text', action: 'templates' }
      );
    } else if (url.includes('/hr/candidates')) {
      actions.push(
        { label: 'Thêm ứng viên', icon: 'bi-person-plus', action: 'create' },
        { label: 'Import CV', icon: 'bi-upload', action: 'import' }
      );
    }

    return actions;
  }

  // Method to get quick navigation items
  getQuickNavigation(): BreadcrumbItem[] {
    const url = this.router.url;
    const quickNav: BreadcrumbItem[] = [];

    if (url.includes('/hr/')) {
      quickNav.push(
        { label: 'Dashboard', url: '/hr/dashboard', icon: 'bi-speedometer2' },
        { label: 'Ứng tuyển mới', url: '/hr/applications?status=New', icon: 'bi-file-plus' },
        { label: 'Phỏng vấn hôm nay', url: '/hr/interviews?date=today', icon: 'bi-calendar-day' },
        { label: 'Báo cáo', url: '/hr/reports', icon: 'bi-graph-up' }
      );
    } else if (url.includes('/admin/')) {
      quickNav.push(
        { label: 'Dashboard', url: '/admin/dashboard', icon: 'bi-speedometer2' },
        { label: 'Người dùng', url: '/admin/users', icon: 'bi-people' },
        { label: 'Công việc', url: '/admin/jobs', icon: 'bi-briefcase' }
      );
    } else if (url.includes('/user/')) {
      quickNav.push(
        { label: 'Trang chủ', url: '/user/dashboard', icon: 'bi-house' },
        { label: 'Hồ sơ', url: '/user/profile', icon: 'bi-person' },
        { label: 'Đơn ứng tuyển', url: '/user/applications', icon: 'bi-file-text' }
      );
    }

    return quickNav;
  }
}