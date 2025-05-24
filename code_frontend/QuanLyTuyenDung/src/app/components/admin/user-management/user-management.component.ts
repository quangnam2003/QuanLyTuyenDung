import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../../services/user.service';

@Component({
  selector: 'app-user-management',
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
    this.userService.updateUserRole(user.userID, newRole).subscribe({
      next: () => {
        user.role = newRole;
      },
      error: () => {
        this.error = 'Cập nhật vai trò thất bại!';
      }
    });
  }

  deleteUser(user: User) {
    if (confirm(`Bạn có chắc muốn xóa người dùng ${user.fullName}?`)) {
      this.userService.deleteUser(user.userID).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: () => {
          this.error = 'Xóa người dùng thất bại!';
        }
      });
    }
  }
}
