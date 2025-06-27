import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private lastRedirectTime = 0;
  private redirectCount = 0;
  private readonly MAX_REDIRECTS = 5;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check for redirect loop
    const now = Date.now();
    if (now - this.lastRedirectTime < 1000) {
      this.redirectCount++;
      if (this.redirectCount >= this.MAX_REDIRECTS) {
        localStorage.clear();
        this.redirectCount = 0;
        this.lastRedirectTime = now;
        this.router.navigate(['/login'], { replaceUrl: true });
        return false;
      }
    } else {
      this.redirectCount = 0;
    }
    this.lastRedirectTime = now;

    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return false;
    }

    // Get user and role
    const user = this.authService.currentUserValue;
    if (!user) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return false;
    }

    // Get requested route from URL
    const requestedRoute = this.getRouteFromUrl(state.url);
    
    // Check role-based access
    switch (requestedRoute) {
      case 'admin':
        if (!this.authService.isAdmin()) {
          this.router.navigate([this.authService.getDefaultRoute()]);
          return false;
        }
        break;
      case 'hr':
        if (!this.authService.isHR()) {
          this.router.navigate([this.authService.getDefaultRoute()]);
          return false;
        }
        break;
      case 'user':
        if (!this.authService.isUser()) {
          this.router.navigate([this.authService.getDefaultRoute()]);
          return false;
        }
        break;
    }

    return true;
  }

  private getRouteFromUrl(url: string): string {
    const parts = url.split('/');
    return parts.length > 1 ? parts[1] : '';
  }
} 