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
  role?: string;
  company?: {
    name: string;
    industry: string;
    size: string;
    location: string;
    website?: string;
    description?: string;
  };
}

export interface AuthResponse {
  id: number;
  email: string;
  fullName: string;
  role: string;
  token: string;
  companyId?: number;
  createdAt?: Date;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  isHR?: boolean;
  isUser?: boolean;
  userRole?: string; // Normalized uppercase role
} 