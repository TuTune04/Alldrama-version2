import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { WatchHistoryListResponse, AddWatchHistoryDto } from '@/types';
import { watchHistoryService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useApiCache } from './useApiCache';

export const useWatchHistory = (initialPage: number = 1, initialLimit: number = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const { clearWatchHistoryCache } = useApiCache();

  // SWR key
  const key = `watch-history?page=${page}&limit=${limit}`;

  // Fetcher function cho SWR
  const fetcher = useCallback(
    async (key: string) => {
      const url = new URL(key, 'http://example.com');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');

      return await watchHistoryService.getWatchHistory(page, limit);
    },
    []
  );

  // Sử dụng SWR hook
  const { data, error, isLoading, isValidating, mutate } = useSWR<WatchHistoryListResponse>(
    key,
    fetcher
  );

  // Thêm vào lịch sử xem
  const addToWatchHistory = useCallback(
    async (data: AddWatchHistoryDto) => {
      try {
        await watchHistoryService.addToWatchHistory(data);
        // Refresh lịch sử xem
        await mutate();
        return true;
      } catch (err) {
        console.error('Không thể cập nhật lịch sử xem:', err);
        return false;
      }
    },
    [mutate]
  );

  // Cập nhật tiến độ xem
  const updateProgress = useCallback(
    async (episodeId: string, progress: number, completed: boolean = false) => {
      return addToWatchHistory({ episodeId, progress, completed });
    },
    [addToWatchHistory]
  );

  // Đánh dấu đã xem xong
  const markAsCompleted = useCallback(
    async (episodeId: string) => {
      return addToWatchHistory({ episodeId, progress: 0, completed: true });
    },
    [addToWatchHistory]
  );

  // Tìm lịch sử xem của một tập phim
  const findWatchProgress = useCallback(
    (episodeId: string) => {
      if (!data?.history) return null;
      
      const watchRecord = data.history.find((item) => item.episodeId === episodeId);
      return watchRecord ? { progress: watchRecord.progress, completed: watchRecord.completed } : null;
    },
    [data?.history]
  );

  // Phân trang
  const goToPage = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    []
  );

  return {
    history: data?.history || [],
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || page,
    totalItems: data?.totalItems || 0,
    loading: isLoading,
    isValidating,
    error,
    addToWatchHistory,
    updateProgress,
    markAsCompleted,
    findWatchProgress,
    goToPage,
    setLimit,
    refreshHistory: mutate,
  };
}; 