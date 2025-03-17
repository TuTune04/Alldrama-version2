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
    return apiClient.get<EpisodeListResponse>(API_ENDPOINTS.EPISODES.LIST_BY_MOVIE(movieId), {
      params: { page, limit },
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
   * Tạo tập phim mới (Admin)
   * @param data Dữ liệu tập phim
   */
  async createEpisode(data: {
    title: string;
    episodeNumber: number;
    movieId: string;
    videoUrl: string;
    duration: number;
  }): Promise<Episode> {
    return apiClient.post<Episode>(API_ENDPOINTS.EPISODES.CREATE, data);
  },

  /**
   * Cập nhật tập phim (Admin)
   * @param id ID của tập phim
   * @param data Dữ liệu cập nhật
   */
  async updateEpisode(
    id: string,
    data: Partial<{
      title: string;
      videoUrl: string;
      duration: number;
    }>
  ): Promise<Episode> {
    return apiClient.put<Episode>(API_ENDPOINTS.EPISODES.UPDATE(id), data);
  },

  /**
   * Xóa tập phim (Admin)
   * @param id ID của tập phim
   */
  async deleteEpisode(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.EPISODES.DELETE(id));
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

  /**
   * Kiểm tra trạng thái xử lý video của tập phim
   * @param episodeId ID của tập phim
   */
  async getProcessingStatus(episodeId: string): Promise<{
    episodeId: string;
    status: 'completed' | 'processing' | 'failed';
    progress: number;
    message: string;
  }> {
    return apiClient.get(API_ENDPOINTS.MEDIA.PROCESSING_STATUS(episodeId));
  }
}; 