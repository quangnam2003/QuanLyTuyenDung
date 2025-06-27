import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
    }
  `]
})
export class AppComponent implements OnInit {
  private navigationCounter = 0;
  private lastNavigationTime = 0;
  private MAX_NAVIGATIONS_THRESHOLD = 5;
  private NAVIGATION_TIME_WINDOW = 3000; // 3 seconds

  constructor(private router: Router) {}

  ngOnInit() {
    console.log('App initialized, checking storage...');
    
    // Tạo key đặc biệt để đánh dấu đã xóa cache
    const cacheCleanKey = 'cache_cleaned_v3';
    const now = new Date().toISOString();
    
    try {
      // Lấy thời điểm xóa cache gần nhất
      const lastCleanTime = localStorage.getItem(cacheCleanKey);
      
      // Thời gian khởi động mới (8 tiếng = 28800000 ms)
      const SESSION_TIMEOUT = 28800000;
      const shouldClean = !lastCleanTime || 
                          (new Date().getTime() - new Date(lastCleanTime).getTime() > SESSION_TIMEOUT);
      
      if (shouldClean) {
        console.log('Cleaning storage cache due to new session or timeout...');
        
        // Xóa dữ liệu đăng nhập
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        
        // Đánh dấu đã xóa cache
        localStorage.setItem(cacheCleanKey, now);
        console.log('Cache cleaned successfully');
      } else {
        console.log('Using existing session, cache cleaning skipped');
      }
    } catch (error) {
      console.error('Error handling cache:', error);
    }

    // Theo dõi các sự kiện điều hướng để phát hiện vòng lặp refresh
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const now = Date.now();
      
      // Kiểm tra nếu có quá nhiều điều hướng trong một khoảng thời gian ngắn
      if (now - this.lastNavigationTime < this.NAVIGATION_TIME_WINDOW) {
        this.navigationCounter++;
        console.warn(`⚠️ App - Navigation counter: ${this.navigationCounter} - URL: ${event.urlAfterRedirects}`);
        
        if (this.navigationCounter >= this.MAX_NAVIGATIONS_THRESHOLD) {
          console.error('🛑 App - Infinite navigation loop detected! Breaking the loop...');
          
          // Xóa localStorage để ngắt vòng lặp
          localStorage.clear();
          
          // Chuyển hướng đến trang đăng nhập và ngăn chặn điều hướng tiếp theo
          this.router.navigate(['/login'], { 
            replaceUrl: true,
            skipLocationChange: true,
            queryParams: { error: 'infinite_loop_detected' }
          });
          
          // Hiển thị thông báo cho người dùng
          alert('Phát hiện vòng lặp điều hướng vô tận. Hệ thống đã tự động xóa cache và chuyển hướng đến trang đăng nhập.');
          
          // Reset bộ đếm
          this.navigationCounter = 0;
        }
      } else {
        // Reset bộ đếm nếu đã qua khoảng thời gian
        this.navigationCounter = 0;
      }
      
      this.lastNavigationTime = now;
    });
  }
}
