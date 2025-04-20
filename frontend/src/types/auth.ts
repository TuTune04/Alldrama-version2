export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  subscriptionExpiredAt?: string;
  createdAt?: string;
  updatedAt?: string;
  avatar_url?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken?: string;
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

export interface EmailAuthRequest {
  email: string;
}

export interface RefreshTokenResponse {
  message: string;
  accessToken: string;
}