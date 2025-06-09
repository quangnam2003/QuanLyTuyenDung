export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
} 