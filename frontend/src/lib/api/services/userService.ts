import { User } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export const userService = {
  /**
   * Lấy danh sách người dùng (Admin)
   * @param page Số trang
   * @param limit Số lượng mỗi trang
   */
  async getUsers(page: number = 1, limit: number = 10): Promise<{
    users: User[];
    totalPages: number;
    currentPage: number;
    totalUsers: number;
  }> {
    return apiClient.get(API_ENDPOINTS.USERS.LIST, {
      params: { page, limit },
    });
  },

  /**
   * Lấy thông tin người dùng theo ID
   * @param id ID người dùng
   */
  async getUserById(id: string): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.USERS.DETAIL(id));
  },

  /**
   * Cập nhật thông tin người dùng
   * @param id ID người dùng
   * @param data Dữ liệu cập nhật
   */
  async updateUser(id: string, data: { name?: string; email?: string }): Promise<User> {
    return apiClient.put<User>(API_ENDPOINTS.USERS.UPDATE(id), data);
  },

  /**
   * Xóa người dùng (Admin)
   * @param id ID người dùng
   */
  async deleteUser(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.USERS.DELETE(id));
  },

  /**
   * Cập nhật thông tin cá nhân
   * @param data Dữ liệu cập nhật
   */
  async updateProfile(data: { name?: string; email?: string }): Promise<User> {
    return apiClient.put<User>('/api/users/me', data);
  },

  /**
   * Đổi mật khẩu
   * @param currentPassword Mật khẩu hiện tại
   * @param newPassword Mật khẩu mới
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/api/users/change-password', {
      currentPassword,
      newPassword,
    });
  },
}; 