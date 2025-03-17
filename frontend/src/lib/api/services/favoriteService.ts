import { Favorite, FavoriteListResponse, AddFavoriteDto } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export const favoriteService = {
  /**
   * Lấy danh sách phim yêu thích của người dùng
   * @param page Số trang
   * @param limit Số lượng mỗi trang
   */
  async getFavorites(page: number = 1, limit: number = 10): Promise<FavoriteListResponse> {
    return apiClient.get<FavoriteListResponse>(API_ENDPOINTS.FAVORITES.LIST, {
      params: { page, limit },
    });
  },

  /**
   * Thêm phim vào danh sách yêu thích
   * @param movieId ID của phim
   */
  async addFavorite(movieId: string): Promise<Favorite> {
    const dto: AddFavoriteDto = { movieId };
    return apiClient.post<Favorite>(API_ENDPOINTS.FAVORITES.ADD, dto);
  },

  /**
   * Xóa phim khỏi danh sách yêu thích
   * @param movieId ID của phim
   */
  async removeFavorite(movieId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.FAVORITES.REMOVE(movieId));
  },

  /**
   * Kiểm tra phim có trong danh sách yêu thích không
   * @param movieId ID của phim
   */
  async checkIsFavorite(movieId: string): Promise<boolean> {
    try {
      await apiClient.get(`${API_ENDPOINTS.FAVORITES.LIST}/${movieId}/check`);
      return true;
    } catch (error) {
      return false;
    }
  },
}; 