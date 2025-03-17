import { useSWRConfig } from 'swr';
import { useCallback } from 'react';

/**
 * Hook quản lý cache của API
 */
export const useApiCache = () => {
  const { mutate } = useSWRConfig();
  
  /**
   * Xóa tất cả cache
   */
  const clearAllCache = useCallback(() => {
    // Xóa tất cả cache, không truyền key sẽ làm mới tất cả dữ liệu
    mutate(undefined, undefined, { revalidate: false });
  }, [mutate]);

  /**
   * Xóa cache theo key cụ thể
   * @param key Key cache cần xóa
   */
  const clearCache = useCallback((key: string | RegExp) => {
    if (typeof key === 'string') {
      // Xóa cache với key cụ thể
      mutate(key, undefined, { revalidate: false });
    } else {
      // Hiện không có API trực tiếp để xóa cache theo pattern trong SWR
      // Nếu cần thiết, có thể sử dụng hệ thống quản lý cache riêng
      console.warn('Clearing cache by RegExp pattern is not supported directly in SWR');
    }
  }, [mutate]);

  /**
   * Xóa tất cả cache liên quan đến movies
   */
  const clearMoviesCache = useCallback(() => {
    // Xóa cache với filter, làm mới tất cả key bắt đầu bằng 'movies'
    mutate((key) => typeof key === 'string' && key.startsWith('movies'), undefined, { revalidate: false });
  }, [mutate]);

  /**
   * Xóa tất cả cache liên quan đến một movie cụ thể
   * @param movieId ID của phim
   */
  const clearMovieCache = useCallback((movieId: string) => {
    // Xóa cache với filter, làm mới tất cả key chứa movieId
    mutate(
      (key) => typeof key === 'string' && key.includes(`movies`) && key.includes(movieId),
      undefined,
      { revalidate: false }
    );
  }, [mutate]);

  /**
   * Xóa tất cả cache liên quan đến episodes
   */
  const clearEpisodesCache = useCallback(() => {
    mutate((key) => typeof key === 'string' && key.startsWith('episodes'), undefined, { revalidate: false });
  }, [mutate]);

  /**
   * Xóa cache liên quan đến tất cả các favorites
   */
  const clearFavoritesCache = useCallback(() => {
    mutate((key) => typeof key === 'string' && key.startsWith('favorites'), undefined, { revalidate: false });
  }, [mutate]);

  /**
   * Xóa cache liên quan đến lịch sử xem
   */
  const clearWatchHistoryCache = useCallback(() => {
    mutate((key) => typeof key === 'string' && key.startsWith('watch-history'), undefined, { revalidate: false });
  }, [mutate]);

  return {
    clearAllCache,
    clearCache,
    clearMoviesCache,
    clearMovieCache,
    clearEpisodesCache,
    clearFavoritesCache,
    clearWatchHistoryCache,
  };
}; 