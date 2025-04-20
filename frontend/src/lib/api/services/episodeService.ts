import { Episode, EpisodeListResponse, PaginatedEpisodeResponse } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export const episodeService = {
  /**
   * Lấy danh sách tập phim theo Movie ID
   * @param movieId ID của phim
   * @param page Số trang (tùy chọn)
   * @param limit Số lượng mỗi trang (tùy chọn)
   */
  async getEpisodesByMovieId(
    movieId: string | number,
    page?: number,
    limit?: number
  ): Promise<EpisodeListResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    
    const queryString = params.toString();
    const url = `${API_ENDPOINTS.EPISODES.LIST(movieId)}${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<EpisodeListResponse>(url);
  },
  
  /**
   * Lấy chi tiết tập phim theo ID
   * @param episodeId ID của tập phim
   */
  async getEpisodeById(episodeId: string | number): Promise<Episode> {
    return apiClient.get<Episode>(API_ENDPOINTS.EPISODES.DETAIL(episodeId));
  },
  
  /**
   * Lấy tập phim tiếp theo
   * @param episodeId ID của tập phim hiện tại
   */
  async getNextEpisode(episodeId: string | number): Promise<Episode | null> {
    try {
      return await apiClient.get<Episode>(API_ENDPOINTS.EPISODES.NEXT(episodeId));
    } catch (error: any) {
      // If 404, there is no next episode
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  },
  
  /**
   * Lấy tập phim trước đó
   * @param episodeId ID của tập phim hiện tại
   */
  async getPreviousEpisode(episodeId: string | number): Promise<Episode | null> {
    try {
      return await apiClient.get<Episode>(API_ENDPOINTS.EPISODES.PREVIOUS(episodeId));
    } catch (error: any) {
      // If 404, there is no previous episode
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  },
  
  /**
   * Tăng lượt xem cho tập phim
   * @param episodeId ID của tập phim
   */
  async incrementView(episodeId: string | number): Promise<{ message: string; views: number }> {
    return apiClient.post<{ message: string; views: number }>(`/api/views/episode/${episodeId}`);
  },
  
  /**
   * Kiểm tra trạng thái xử lý video của tập phim
   * @param episodeId ID của tập phim
   */
  async getProcessingStatus(episodeId: string | number): Promise<{
    status: 'processing' | 'completed' | 'failed';
    error?: string;
    progress?: number;
  }> {
    return apiClient.get<{
      status: 'processing' | 'completed' | 'failed';
      error?: string;
      progress?: number;
    }>(`/api/episodes/${episodeId}/processing-status`);
  }
};