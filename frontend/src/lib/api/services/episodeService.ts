import { Episode, EpisodeListResponse, PaginatedEpisodeResponse } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export const episodeService = {
  /**
   * Lấy danh sách tập phim theo Movie ID
   * @param movieId ID của phim
   * @param page Số trang (không dùng trong API hiện tại)
   * @param limit Số lượng mỗi trang (không dùng trong API hiện tại)
   */
  async getEpisodesByMovieId(
    movieId: string | number,
    page?: number,
    limit?: number
  ): Promise<EpisodeListResponse> {
    // API returns array directly, not paginated
    return apiClient.get<EpisodeListResponse>(API_ENDPOINTS.EPISODES.LIST_BY_MOVIE(String(movieId)));
  },
  
  /**
   * Lấy danh sách tập phim theo Movie ID với phân trang (tùy chỉnh cho frontend)
   * @param movieId ID của phim
   * @param page Số trang
   * @param limit Số lượng mỗi trang
   */
  async getPaginatedEpisodesByMovieId(
    movieId: string | number,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedEpisodeResponse> {
    const episodes = await this.getEpisodesByMovieId(movieId);
    // Client-side pagination 
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEpisodes = episodes.slice(startIndex, endIndex);
    
    return {
      episodes: paginatedEpisodes,
      pagination: {
        total: episodes.length,
        totalPages: Math.ceil(episodes.length / limit),
        currentPage: page,
        limit
      }
    };
  },

  /**
   * Lấy chi tiết tập phim theo ID
   * @param id ID của tập phim
   */
  async getEpisodeById(id: string | number): Promise<Episode> {
    // ID in API is number, but we accept string | number for flexibility
    return apiClient.get<Episode>(API_ENDPOINTS.EPISODES.DETAIL(String(id)));
  },

  /**
   * Tạo tập phim mới (Admin)
   * @param data Dữ liệu tập phim
   */
  async createEpisode(data: {
    title: string;
    episodeNumber: number;
    movieId: string | number;
    playlistUrl: string;
    thumbnailUrl: string;
    description: string;
    duration: number;
  }): Promise<Episode> {
    // Convert movieId to number if string is provided
    const payload = {
      ...data,
      movieId: typeof data.movieId === 'string' ? parseInt(data.movieId, 10) : data.movieId
    };
    
    return apiClient.post<Episode>(API_ENDPOINTS.EPISODES.CREATE, payload);
  },

  /**
   * Cập nhật tập phim (Admin)
   * @param id ID của tập phim
   * @param data Dữ liệu cập nhật
   */
  async updateEpisode(
    id: string | number,
    data: Partial<{
      title: string;
      playlistUrl: string;
      thumbnailUrl: string;
      description: string;
      duration: number;
    }>
  ): Promise<Episode> {
    return apiClient.put<Episode>(API_ENDPOINTS.EPISODES.UPDATE(String(id)), data);
  },

  /**
   * Xóa tập phim (Admin)
   * @param id ID của tập phim
   */
  async deleteEpisode(id: string | number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.EPISODES.DELETE(String(id)));
  },

  /**
   * Tăng lượt xem cho tập phim
   * @param episodeId ID của tập phim
   */
  async incrementView(episodeId: string | number): Promise<{ message: string; views: number }> {
    return apiClient.post<{ message: string; views: number }>(
      API_ENDPOINTS.VIEWS.INCREMENT_EPISODE(String(episodeId))
    );
  },

  /**
   * Kiểm tra trạng thái xử lý video của tập phim
   * @param episodeId ID của tập phim
   */
  async getProcessingStatus(episodeId: string | number): Promise<{
    episodeId: string | number;
    status: 'completed' | 'processing' | 'failed';
    progress: number;
    message: string;
  }> {
    return apiClient.get(API_ENDPOINTS.MEDIA.PROCESSING_STATUS(String(episodeId)));
  }
};