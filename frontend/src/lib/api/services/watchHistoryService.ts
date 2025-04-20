import { WatchHistory } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export const watchHistoryService = {
  /**
   * Lấy lịch sử xem phim của người dùng
   */
  async getWatchHistory(): Promise<WatchHistory[]> {
    return apiClient.get<WatchHistory[]>(API_ENDPOINTS.WATCH_HISTORY.LIST);
  },

  /**
   * Thêm hoặc cập nhật lịch sử xem
   * @param data Dữ liệu lịch sử xem
   */
  async addOrUpdateWatchHistory(data: {
    movieId: string | number;
    episodeId?: string | number;
    progress: number;
    duration: number;
  }): Promise<{ message: string; watchHistory: WatchHistory }> {
    // Chuyển đổi ID từ chuỗi sang số nếu cần
    const payload = {
      movieId: String(data.movieId),
      episodeId: data.episodeId ? String(data.episodeId) : undefined,
      progress: data.progress,
      duration: data.duration
    };

    return apiClient.post<{ message: string; watchHistory: WatchHistory }>(
      API_ENDPOINTS.WATCH_HISTORY.UPDATE,
      payload
    );
  },

  /**
   * Xóa mục lịch sử xem
   * @param historyId ID của mục lịch sử cần xóa
   */
  async deleteWatchHistory(historyId: string | number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.WATCH_HISTORY.DELETE(historyId));
  },

  /**
   * Lấy tiến trình xem phim của người dùng cho một tập phim cụ thể
   * @param episodeId ID của tập phim
   */
  async getEpisodeProgress(episodeId: string | number): Promise<{
    progress: number;
    duration: number;
    completed: boolean;
  } | null> {
    try {
      const watchHistory = await this.getWatchHistory();
      const entry = watchHistory.find(item => String(item.episodeId) === String(episodeId));
      
      if (!entry) return null;
      
      return {
        progress: entry.progress,
        duration: entry.duration,
        completed: entry.isCompleted
      };
    } catch (error) {
      console.error('Error fetching episode progress:', error);
      return null;
    }
  },

  /**
   * Lấy tiến trình xem mới nhất cho một phim (để tiếp tục xem)
   * @param movieId ID của phim
   */
  async getLatestProgressForMovie(movieId: string | number): Promise<{
    episodeId: string | number;
    progress: number;
    duration: number;
    completed: boolean;
  } | null> {
    try {
      const watchHistory = await this.getWatchHistory();
      
      // Lọc các mục lịch sử của phim này
      const movieEntries = watchHistory.filter(
        item => String(item.movieId) === String(movieId)
      );
      
      if (movieEntries.length === 0) return null;
      
      // Sắp xếp theo thời gian xem gần nhất
      movieEntries.sort((a, b) => 
        new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
      );
      
      const latestEntry = movieEntries[0];
      
      return {
        episodeId: latestEntry.episodeId,
        progress: latestEntry.progress,
        duration: latestEntry.duration,
        completed: latestEntry.isCompleted
      };
    } catch (error) {
      console.error('Error fetching latest movie progress:', error);
      return null;
    }
  }
};