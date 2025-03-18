export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin' | 'subscriber';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
} 