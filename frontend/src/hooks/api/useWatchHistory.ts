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

export const useWatchHistory = () => {
  const { clearWatchHistoryCache } = useApiCache();

  // SWR key
  const key = 'watch-history';

  // Fetcher function for SWR
  const fetcher = useCallback(
    async () => {
      return await watchHistoryService.getWatchHistory();
    },
    []
  );

  // Use SWR hook
  const { data, error, isLoading, isValidating, mutate } = useSWR<WatchHistory[]>(
    key,
    fetcher
  );

  // Add or update watch history
  const addOrUpdateWatchHistory = useCallback(
    async (data: WatchHistoryRequest) => {
      try {
        const response = await watchHistoryService.addOrUpdateWatchHistory(data);
        // Refresh watch history
        await mutate();
        return response.watchHistory;
      } catch (err) {
        console.error('Không thể cập nhật lịch sử xem:', err);
        return null;
      }
    },
    [mutate]
  );

  // Delete watch history entry
  const deleteWatchHistory = useCallback(
    async (historyId: string | number) => {
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
    [mutate]
  );

  // Get episode progress
  const getEpisodeProgress = useCallback(
    async (episodeId: string | number) => {
      return watchHistoryService.getEpisodeProgress(episodeId);
    },
    []
  );

  // Get latest progress for a movie
  const getLatestProgressForMovie = useCallback(
    async (movieId: string | number) => {
      return watchHistoryService.getLatestProgressForMovie(movieId);
    },
    []
  );

  // Update progress for an episode
  const updateProgress = useCallback(
    async (movieId: string | number, episodeId: string | number, progress: number, duration: number) => {
      const data: WatchHistoryRequest = {
        movieId,
        episodeId,
        progress,
        duration
      };
      return addOrUpdateWatchHistory(data);
    },
    [addOrUpdateWatchHistory]
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