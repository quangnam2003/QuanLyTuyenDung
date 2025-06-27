import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2 class="mb-4">Quản lý người dùng</h2>
      
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.id }}</td>
              <td>{{ user.fullName }}</td>
              <td>{{ user.email }}</td>
              <td>
                <select 
                  [(ngModel)]="user.role" 
                  class="form-select" 
                  (change)="onRoleChange(user)"
                >
                  <option *ngFor="let role of roles" [value]="role">{{ role }}</option>
                </select>
              </td>
              <td>
                <button class="btn btn-danger" (click)="deleteUser(user.id)">Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
    }
    
    .table {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-radius: 4px;
    }
    
    .form-select {
      min-width: 120px;
    }
  `]
})
export class UsersComponent implements OnInit {
  // Danh sách người dùng
  users: User[] = [];
  
  // Danh sách các role có thể gán (chỉ có 3 role)
  roles: string[] = ['Admin', 'User', 'HR'];
  
  constructor(private userService: UserService) {}
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  // Tải danh sách người dùng
  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        console.log('Loaded users:', users);
        this.users = users;
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
      }
    });
  }
  
  // Xử lý khi thay đổi role
  onRoleChange(user: User): void {
    console.log('Role changed for user:', user);
    this.userService.updateUserRole(user.id, user.role).subscribe({
      next: (response) => {
        console.log('Role updated successfully:', response);
      },
      error: (error) => {
        console.error('Error updating role:', error);
        // Khôi phục role cũ nếu cập nhật thất bại
        this.loadUsers();
      }
    });
  }
  
  // Xóa người dùng
  deleteUser(userId: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          console.log('User deleted successfully');
          this.users = this.users.filter(user => user.id !== userId);
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }
} 