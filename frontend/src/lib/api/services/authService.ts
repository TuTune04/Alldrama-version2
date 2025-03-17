import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';
import { refreshTokenEndpoint, refreshAccessToken } from '../authHelper';

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
   * Gọi API đăng xuất để xóa refresh token cookie trên server
   */
  async logout(): Promise<{ message: string }> {
    const result = await apiClient.post<{ message: string }>(API_ENDPOINTS.AUTH.LOGOUT);
    this.clearToken();
    return result;
  },

  /**
   * Đăng xuất khỏi tất cả thiết bị
   */
  async logoutAll(): Promise<{ message: string }> {
    const result = await apiClient.post<{ message: string }>(API_ENDPOINTS.AUTH.LOGOUT_ALL);
    this.clearToken();
    return result;
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
  
  /**
   * Thực hiện refresh token
   * Backend sẽ đọc refresh token từ HTTP-Only cookie và cấp access token mới
   */
  async refreshToken(): Promise<string> {
    try {
      const newToken = await refreshAccessToken();
      this.saveToken(newToken);
      return newToken;
    } catch (error) {
      this.clearToken();
      throw error;
    }
  },

  /**
   * Gửi email xác thực đăng nhập
   * @param data Dữ liệu chứa email cần xác thực
   */
  async emailAuth(data: { email: string }): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_ENDPOINTS.AUTH.EMAIL_AUTH, 
      data
    );
  },
  
  /**
   * Lấy CSRF token
   */
  async getCsrfToken(): Promise<{ csrfToken: string }> {
    return apiClient.get<{ csrfToken: string }>(API_ENDPOINTS.AUTH.CSRF_TOKEN);
  }
}; 