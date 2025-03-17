import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export const authService = {
  /**
   * Đăng ký người dùng mới
   * @param credentials Thông tin đăng ký
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, credentials);
  },

  /**
   * Đăng nhập
   * @param credentials Thông tin đăng nhập
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  /**
   * Đăng xuất
   */
  async logout(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(API_ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Lấy thông tin người dùng hiện tại
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
  },

  /**
   * Lưu token vào localStorage
   * @param token JWT token
   */
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  },

  /**
   * Xóa token khỏi localStorage
   */
  clearToken(): void {
    localStorage.removeItem('token');
  },

  /**
   * Kiểm tra xem người dùng đã đăng nhập chưa
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
}; 