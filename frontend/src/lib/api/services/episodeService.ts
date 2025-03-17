import { Episode, EpisodeListResponse } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export const episodeService = {
  /**
   * Lấy danh sách tập phim theo Movie ID
   * @param movieId ID của phim
   * @param page Số trang
   * @param limit Số lượng mỗi trang
   */
  async getEpisodesByMovieId(
    movieId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<EpisodeListResponse> {
    return apiClient.get<EpisodeListResponse>(API_ENDPOINTS.EPISODES.LIST, {
      params: { movieId, page, limit },
    });
  },

  /**
   * Lấy chi tiết tập phim theo ID
   * @param id ID của tập phim
   */
  async getEpisodeById(id: string): Promise<Episode> {
    return apiClient.get<Episode>(API_ENDPOINTS.EPISODES.DETAIL(id));
  },

  /**
   * Tăng lượt xem cho tập phim
   * @param episodeId ID của tập phim
   */
  async incrementView(episodeId: string): Promise<{ message: string; views: number }> {
    return apiClient.post<{ message: string; views: number }>(
      API_ENDPOINTS.VIEWS.INCREMENT_EPISODE(episodeId)
    );
  },
}; 