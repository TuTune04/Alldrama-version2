import { WatchHistory, WatchHistoryListResponse, AddWatchHistoryDto } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export const watchHistoryService = {
  /**
   * Lấy lịch sử xem phim
   * @param page Số trang
   * @param limit Số lượng mỗi trang
   */
  async getWatchHistory(page: number = 1, limit: number = 10): Promise<WatchHistoryListResponse> {
    return apiClient.get<WatchHistoryListResponse>(API_ENDPOINTS.WATCH_HISTORY.LIST, {
      params: { page, limit },
    });
  },

  /**
   * Thêm vào lịch sử xem phim
   * @param data Dữ liệu lịch sử xem
   */
  async addToWatchHistory(data: AddWatchHistoryDto): Promise<WatchHistory> {
    return apiClient.post<WatchHistory>(API_ENDPOINTS.WATCH_HISTORY.ADD, data);
  },

  /**
   * Cập nhật tiến độ xem
   * @param episodeId ID của tập phim
   * @param progress Thời gian đã xem (giây)
   * @param completed Đã xem xong chưa
   */
  async updateProgress(
    episodeId: string,
    progress: number,
    completed: boolean = false
  ): Promise<WatchHistory> {
    const data: AddWatchHistoryDto = {
      episodeId,
      progress,
      completed,
    };
    return this.addToWatchHistory(data);
  },
}; 