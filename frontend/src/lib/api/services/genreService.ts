import { Genre } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export const genreService = {
  /**
   * Lấy danh sách tất cả thể loại
   */
  async getAllGenres(): Promise<Genre[]> {
    return apiClient.get<Genre[]>(API_ENDPOINTS.GENRES.LIST);
  },
}; 