import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  error: string = '';

  constructor(public userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: users => {
        this.users = users;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Không thể tải danh sách người dùng.';
        this.isLoading = false;
      }
    });
  }

  changeRole(user: User, newRole: string) {
    this.userService.updateUserRole(user.id, newRole.toUpperCase()).subscribe({
      next: () => {
        user.role = newRole.toUpperCase();
      },
      error: () => {
        this.error = 'Cập nhật vai trò thất bại!';
      }
    });
  }

  deleteUser(user: User) {
    if (confirm(`Bạn có chắc muốn xóa người dùng ${user.fullName}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: () => {
          this.error = 'Xóa người dùng thất bại!';
        }
      });
    }
  }

  onRoleChange(user: User, event: Event) {
    const newRole = (event.target as HTMLSelectElement).value.toUpperCase();
    if (user.role === newRole) return;
    this.userService.updateUserRole(user.id, newRole).subscribe({
      next: (updatedUser) => {
        user.role = updatedUser.role;
        this.error = '';
      },
      error: () => {
        this.error = 'Cập nhật vai trò thất bại!';
      }
    });
  }
}
