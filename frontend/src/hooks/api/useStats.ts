import { useCallback } from 'react';
import useSWR from 'swr';
import { statsService } from '@/lib/api/services/statsService';
import { useApiCache } from './useApiCache';

export const useStats = () => {
  const { clearCache } = useApiCache();

  const clearStatsCache = useCallback(() => {
    clearCache('stats');
  }, [clearCache]);

  // Dashboard stats with custom date range
  const useDashboardStats = (startDate?: string, endDate?: string) => {
    const cacheKey = startDate || endDate 
      ? `stats/dashboard?startDate=${startDate}&endDate=${endDate}` 
      : 'stats/dashboard';

    const { data, error, isLoading, mutate } = useSWR(
      cacheKey,
      () => statsService.getDashboardStats(startDate, endDate),
      {
        revalidateOnFocus: false,
        dedupingInterval: 60000, // 1 phút
      }
    );

    return {
      stats: data,
      isLoading,
      isError: error,
      mutate,
    };
  };

  // Popular movies stats
  const usePopularMovies = (limit?: number) => {
    const cacheKey = limit ? `stats/popular-movies?limit=${limit}` : 'stats/popular-movies';

    const { data, error, isLoading, mutate } = useSWR(
      cacheKey,
      () => statsService.getPopularMovies(limit),
      {
        revalidateOnFocus: false,
        dedupingInterval: 60000, // 1 phút
      }
    );

    return {
      popularMovies: data,
      isLoading,
      isError: error,
      mutate,
    };
  };

  // New users stats
  const useNewUsers = (limit?: number) => {
    const cacheKey = limit ? `stats/new-users?limit=${limit}` : 'stats/new-users';

    const { data, error, isLoading, mutate } = useSWR(
      cacheKey,
      () => statsService.getNewUsers(limit),
      {
        revalidateOnFocus: false,
        dedupingInterval: 60000, // 1 phút
      }
    );

    return {
      newUsers: data,
      isLoading,
      isError: error,
      mutate,
    };
  };

  // Genre stats
  const useGenreStats = () => {
    const { data, error, isLoading, mutate } = useSWR(
      'stats/genres',
      () => statsService.getGenreStats(),
      {
        revalidateOnFocus: false,
        dedupingInterval: 60000, // 1 phút
      }
    );

    return {
      genreStats: data,
      isLoading,
      isError: error,
      mutate,
    };
  };

  return {
    useDashboardStats,
    usePopularMovies,
    useNewUsers,
    useGenreStats,
    clearStatsCache,
  };
}; 