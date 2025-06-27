import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HttpHandlerFn, HttpRequest, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { AuthInterceptor } from './interceptors/auth.interceptor';

import { routes } from './app-routing.module';

// Ignore SSL certificate in development
const ignoreSSLInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  if (!environment.production) {
    // Clone request and modify headers
    const modifiedReq = req.clone({
      setHeaders: {
        'X-Skip-SSL-Verify': 'true',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return next(modifiedReq);
  }
  return next(req);
};

// Auth token interceptor
const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  if (token) {
    // Clone request and add authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }
  
  return next(req);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        ignoreSSLInterceptor,
        authInterceptor
      ])
    ),
    provideClientHydration(withEventReplay()),
    AuthService,
    AuthInterceptor
  ]
};