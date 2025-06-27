import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
  // Thêm biến để theo dõi số lần chuyển hướng
  private redirectCount = 0;
  private MAX_REDIRECTS = 2;
  private lastRedirectTime = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    if (!this.authService.isUser()) {
      this.router.navigate([this.authService.getDefaultRoute()]);
      return false;
    }

      return true;
    }
  
  // Hàm lấy dữ liệu người dùng mới nhất từ localStorage
  private getRefreshedUserData(user: any): any {
    try {
      // Luôn đảm bảo đọc từ localStorage để có dữ liệu mới nhất
      const storedUserData = localStorage.getItem('currentUser');
      if (storedUserData) {
        const refreshedUser = JSON.parse(storedUserData);
        console.log('UserGuard - Refreshed user data before processing:', refreshedUser);
        
        // Bổ sung xử lý dữ liệu
        if (refreshedUser) {
          // Đảm bảo role được chuẩn hóa viết hoa
          if (refreshedUser.role) {
            refreshedUser.role = refreshedUser.role.toUpperCase();
          }
          
          // Nếu có email admin mà không có role ADMIN, cập nhật
          if (refreshedUser.email && refreshedUser.email.includes('admin') && 
              refreshedUser.role !== 'ADMIN') {
            console.log('UserGuard - Fixing admin role based on email');
            refreshedUser.role = 'ADMIN';
            refreshedUser.userRole = 'ADMIN';
            refreshedUser.isAdmin = true;
            refreshedUser.isHR = false;
            refreshedUser.isUser = false;
            
            // Lưu lại để đảm bảo nhất quán
            localStorage.setItem('currentUser', JSON.stringify(refreshedUser));
          }
          
          // Nếu có email hr mà không có role HR, cập nhật
          if (refreshedUser.email && refreshedUser.email.includes('hr') && 
              !refreshedUser.email.includes('admin') && 
              refreshedUser.role !== 'HR') {
            console.log('UserGuard - Fixing HR role based on email');
            refreshedUser.role = 'HR';
            refreshedUser.userRole = 'HR';
            refreshedUser.isAdmin = false;
            refreshedUser.isHR = true;
            refreshedUser.isUser = false;
            
            // Lưu lại để đảm bảo nhất quán
            localStorage.setItem('currentUser', JSON.stringify(refreshedUser));
          }
        }
        
        console.log('UserGuard - Final refreshed user data:', {
          email: refreshedUser.email,
          role: refreshedUser.role,
          userRole: refreshedUser.userRole,
          isAdmin: refreshedUser.isAdmin,
          isHR: refreshedUser.isHR,
          isUser: refreshedUser.isUser
        });
        
        return refreshedUser;
      }
    } catch (e) {
      console.error('UserGuard - Error getting refreshed user data:', e);
    }
    return user;
  }
  
  // Cập nhật thông tin role người dùng nếu cần
  private updateUserRoleIfNeeded(user: any, role: string): void {
    try {
      if ((user.role !== role || user.userRole !== role) || 
          (user.isUser !== (role === 'USER')) || 
          (user.isAdmin !== (role === 'ADMIN')) || 
          (user.isHR !== (role === 'HR'))) {
        
        console.log('UserGuard - Updating user role data');
        user.role = role;
        user.userRole = role;
        user.isAdmin = role === 'ADMIN';
        user.isHR = role === 'HR';
        user.isUser = role === 'USER';
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        console.log('UserGuard - User role data updated');
      }
    } catch (e) {
      console.error('UserGuard - Error updating user role data:', e);
    }
  }
  
  // Hàm bắt buộc chuyển hướng đến trang Admin
  private forceRedirectToAdmin(user: any): void {
    console.log('UserGuard - ForceRedirectToAdmin called');
    
    // Tạo bản sao để tránh tham chiếu
    const updatedUser = { ...user };
    
    // Cập nhật role thành ADMIN
    updatedUser.role = 'ADMIN';
    updatedUser.userRole = 'ADMIN';
    updatedUser.isAdmin = true;
    updatedUser.isHR = false;
    updatedUser.isUser = false;
    
    // Lưu lại vào localStorage
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    console.log('UserGuard - Updated user to ADMIN role in localStorage');
    
    try {
      // Chuyển hướng đến trang admin
      console.log('UserGuard - Redirecting to admin dashboard');
      this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
    } catch (e) {
      console.error('UserGuard - Navigation error:', e);
      // Backup: chuyển hướng với window.location
      window.location.href = '/admin/dashboard';
    }
  }
  
  // Hàm bắt buộc chuyển hướng đến trang HR
  private forceRedirectToHR(user: any): void {
    console.log('UserGuard - ForceRedirectToHR called');
    
    // Tạo bản sao để tránh tham chiếu
    const updatedUser = { ...user };
    
    // Cập nhật role thành HR
    updatedUser.role = 'HR';
    updatedUser.userRole = 'HR';
    updatedUser.isAdmin = false;
    updatedUser.isHR = true;
    updatedUser.isUser = false;
    
    // Lưu lại vào localStorage
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    console.log('UserGuard - Updated user to HR role in localStorage');
    
    try {
      // Chuyển hướng đến trang HR
      console.log('UserGuard - Redirecting to HR dashboard');
      this.router.navigate(['/hr/dashboard'], { replaceUrl: true });
    } catch (e) {
      console.error('UserGuard - Navigation error:', e);
      // Backup: chuyển hướng với window.location
      window.location.href = '/hr/dashboard';
    }
  }
} 