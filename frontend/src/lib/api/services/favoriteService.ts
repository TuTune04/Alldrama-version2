import { Favorite } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export const favoriteService = {
  /**
   * Lấy danh sách phim yêu thích của người dùng hiện tại
   */
  async getFavorites(): Promise<Favorite[]> {
    return apiClient.get<Favorite[]>(API_ENDPOINTS.FAVORITES.LIST);
  },

  /**
   * Kiểm tra phim có trong danh sách yêu thích của người dùng hay không
   * @param movieId ID của phim
   */
  async isFavorite(movieId: string | number): Promise<boolean> {
    try {
      // Lấy danh sách yêu thích và kiểm tra movieId có trong danh sách không
      const favorites = await this.getFavorites();
      return favorites.some(fav => String(fav.movieId) === String(movieId));
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  },

  /**
   * Thêm phim vào danh sách yêu thích
   * @param movieId ID của phim
   */
  async addToFavorites(movieId: string | number): Promise<{ message: string; favorite: Favorite }> {
    return apiClient.post<{ message: string; favorite: Favorite }>(
      API_ENDPOINTS.FAVORITES.ADD,
      { movieId: String(movieId) }
    );
  },

  /**
   * Xóa phim khỏi danh sách yêu thích
   * @param movieId ID của phim
   */
  async removeFromFavorites(movieId: string | number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.FAVORITES.REMOVE(movieId));
  },

  /**
   * Toggle trạng thái yêu thích (thêm nếu chưa có, xóa nếu đã có)
   * @param movieId ID của phim
   */
  async toggleFavorite(movieId: string | number): Promise<{ favorited: boolean; message: string }> {
    try {
      const isFav = await this.isFavorite(movieId);
      
      if (isFav) {
        await this.removeFromFavorites(movieId);
        return {
          favorited: false,
          message: 'Đã xóa phim khỏi danh sách yêu thích'
        };
      } else {
        await this.addToFavorites(movieId);
        return {
          favorited: true,
          message: 'Đã thêm phim vào danh sách yêu thích'
        };
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }
};