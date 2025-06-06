import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { WatchHistory } from '@/types';
import { 
  watchHistoryService, 
  WatchHistoryRequest, 
  WatchHistoryResponse 
} from '@/lib/api/services/watchHistoryService';
import { toast } from 'react-hot-toast';
import { useApiCache } from './useApiCache';
import { useAuthStore } from '@/store/auth';

export const useWatchHistory = () => {
  const { clearWatchHistoryCache } = useApiCache();
  const { isAuthenticated } = useAuthStore();

  // SWR key - chỉ fetch khi đã đăng nhập
  const key = isAuthenticated ? 'watch-history' : null;

  // Fetcher function for SWR
  const fetcher = useCallback(
    async () => {
      if (!isAuthenticated) return [];
      return await watchHistoryService.getWatchHistory();
    },
    [isAuthenticated]
  );

  // Use SWR hook
  const { data, error, isLoading, isValidating, mutate } = useSWR<WatchHistory[]>(
    key,
    fetcher
  );

  // Add or update watch history
  const addOrUpdateWatchHistory = useCallback(
    async (data: WatchHistoryRequest) => {
      // Không thực hiện nếu chưa đăng nhập
      if (!isAuthenticated) {
        console.log('Bỏ qua cập nhật lịch sử xem vì chưa đăng nhập');
        return null;
      }
      
      try {
        // Kiểm tra dữ liệu đầu vào
        const { movieId, episodeId, progress, duration } = data;
        
        // Đảm bảo các giá trị là số hợp lệ
        if (!movieId || isNaN(Number(movieId)) || Number(movieId) <= 0) {
          console.error('movieId không hợp lệ:', movieId);
          return null;
        }
        
        if (!episodeId || isNaN(Number(episodeId)) || Number(episodeId) <= 0) {
          console.error('episodeId không hợp lệ:', episodeId);
          return null;
        }
        
        if (progress < 0 || !isFinite(progress)) {
          console.error('progress không hợp lệ:', progress);
          return null;
        }
        
        if (duration <= 0 || !isFinite(duration)) {
          console.error('duration không hợp lệ:', duration);
          return null;
        }
        
        // Chuyển đổi số để đảm bảo dữ liệu hợp lệ
        const validData: WatchHistoryRequest = {
          movieId: Number(movieId),
          episodeId: Number(episodeId),
          progress: Math.floor(progress),
          duration: Math.floor(duration)
        };
        
        const response = await watchHistoryService.addOrUpdateWatchHistory(validData);
        
        // Refresh watch history
        await mutate();
        return response.watchHistory;
      } catch (err: any) {
        // Hiển thị thông báo lỗi chi tiết hơn
        const errorMessage = err?.response?.data?.message || 'Không thể cập nhật lịch sử xem';
        console.error('Không thể cập nhật lịch sử xem:', err);
        
        // Ghi nhật ký lỗi chi tiết
        if (err?.response?.status) {
          console.error(`Lỗi HTTP ${err.response.status}: ${errorMessage}`);
        }
        
        // Nếu đã đăng nhập, hiển thị thông báo lỗi
        if (err?.response?.status !== 401) {
          // toast.error(errorMessage);
        }
        
        return null;
      }
    },
    [mutate, isAuthenticated]
  );

  // Delete watch history entry
  const deleteWatchHistory = useCallback(
    async (historyId: string | number) => {
      if (!isAuthenticated) return false;
      
      try {
        const response = await watchHistoryService.deleteWatchHistory(historyId);
        // Refresh watch history
        await mutate();
        toast.success(response.message);
        return true;
      } catch (err) {
        toast.error('Không thể xóa lịch sử xem');
        return false;
      }
    },
    [mutate, isAuthenticated]
  );

  // Get episode progress
  const getEpisodeProgress = useCallback(
    async (episodeId: string | number) => {
      if (!isAuthenticated) return null;
      return watchHistoryService.getEpisodeProgress(episodeId);
    },
    [isAuthenticated]
  );

  // Get latest progress for a movie
  const getLatestProgressForMovie = useCallback(
    async (movieId: string | number) => {
      if (!isAuthenticated) return null;
      return watchHistoryService.getLatestProgressForMovie(movieId);
    },
    [isAuthenticated]
  );

  // Update progress for an episode
  const updateProgress = useCallback(
    async (movieId: string | number, episodeId: string | number, progress: number, duration: number) => {
      if (!isAuthenticated) return null;
      
      const data: WatchHistoryRequest = {
        movieId,
        episodeId,
        progress,
        duration
      };
      return addOrUpdateWatchHistory(data);
    },
    [addOrUpdateWatchHistory, isAuthenticated]
  );

  return {
    watchHistory: data || [],
    loading: isLoading,
    isValidating,
    error,
    addOrUpdateWatchHistory,
    deleteWatchHistory,
    getEpisodeProgress,
    getLatestProgressForMovie,
    updateProgress,
    refreshWatchHistory: mutate
  };
};