export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  fullName: string;
  role: string;
  token: string;
  createdAt?: Date;
  updatedAt?: Date;
} 