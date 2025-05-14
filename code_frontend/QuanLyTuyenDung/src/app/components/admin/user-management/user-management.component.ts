import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  userID: number;
  fullName: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'https://localhost:7029/api/Users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateUserRole(id: number, newRole: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/role`, newRole, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  updateUserInfo(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.userID}`, user);
  }
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent {
  error: string = '';

  constructor(public userService: UserService) {}

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
          // Optionally reload users or remove from local array
        },
        error: () => {
          this.error = 'Xóa người dùng thất bại!';
        }
      });
    }
  }
}
