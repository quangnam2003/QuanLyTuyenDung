import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  // Thêm biến để theo dõi số lần chuyển hướng
  private redirectCount = 0;
  private MAX_REDIRECTS = 2;
  private lastRedirectTime = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('🔐 AdminGuard.canActivate() called for URL:', state.url);
    
    // Kiểm tra nếu có quá nhiều redirect trong thời gian ngắn
    const now = Date.now();
    if (now - this.lastRedirectTime < 1000) { // Dưới 1 giây
      this.redirectCount++;
      console.warn(`⚠️ AdminGuard - Redirect count: ${this.redirectCount}`);
      
      if (this.redirectCount >= this.MAX_REDIRECTS) {
        console.error('🔄 AdminGuard - Too many redirects detected! Breaking the loop and redirecting to login');
        // Clear local storage để ngắt loop
        localStorage.clear();
        // Reset counter
        this.redirectCount = 0;
        this.lastRedirectTime = now;
        // Redirect to login
        this.router.navigate(['/login'], { replaceUrl: true });
        return false;
      }
    } else {
      // Reset counter nếu quá 1 giây từ lần redirect trước
      this.redirectCount = 0;
    }
    this.lastRedirectTime = now;
    
    // STEP 1: Kiểm tra xác thực (chức năng của AuthGuard)
    // Kiểm tra trực tiếp token trong localStorage
    let token = null;
    let user = null;
    
    try {
      token = localStorage.getItem('token');
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        user = JSON.parse(userStr);
      }
    } catch (e) {
      console.error('❌ AdminGuard - Error reading from localStorage:', e);
    }
    
    // Kiểm tra xác thực với AuthService
    const isAuthenticatedInService = this.authService.isAuthenticated();
    
    // Kết luận xác thực dựa trên cả localStorage và service
    const isAuthenticated = !!(token && user) || isAuthenticatedInService;
    
    // Nếu chưa xác thực, chuyển hướng đến trang đăng nhập
    if (!isAuthenticated) {
      console.log('🚪 AdminGuard: User is not authenticated, redirecting to login');
      this.router.navigate(['/login'], { replaceUrl: true });
      return false;
    }
    
    // STEP 2: Kiểm tra vai trò là ADMIN (chức năng của AdminGuard)
    // Lấy thông tin từ service
    const userFromService = this.authService.currentUserValue;
    
    // Sử dụng user từ localStorage nếu service không có
    const finalUser = userFromService || user;
    
    // Kiểm tra email có phải admin không
    const isAdminByEmail = finalUser.email && finalUser.email.includes('admin');
    
    // Kiểm tra role có phải ADMIN không
    const isAdminByRole = 
      finalUser.role === 'ADMIN' || 
      finalUser.userRole === 'ADMIN' || 
      finalUser.isAdmin === true;
    
    // Kết luận có phải ADMIN không
    const isAdmin = isAdminByEmail || isAdminByRole;
    
    console.log('👑 AdminGuard - Admin check:', {
      email: finalUser.email,
      isAdminByEmail,
      isAdminByRole,
      isAdmin
    });
    
    if (!isAdmin) {
      console.log('⛔ AdminGuard: User is not an admin');
      
      // Xác định route mặc định dựa trên role
      let defaultRoute = '/user/dashboard'; // Mặc định
      
      if (finalUser.role === 'HR' || finalUser.userRole === 'HR' || finalUser.isHR === true || 
          (finalUser.email && finalUser.email.includes('hr') && !finalUser.email.includes('admin'))) {
        defaultRoute = '/hr/dashboard';
      }
      
      console.log('🔄 AdminGuard: Redirecting to', defaultRoute);
      this.router.navigate([defaultRoute], { replaceUrl: true });
    return false;
    }
    
    console.log('✅ AdminGuard: User is an admin, allowing access');
    return true;
  }
} 