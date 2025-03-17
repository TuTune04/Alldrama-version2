import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { FavoriteListResponse } from '@/types';
import { favoriteService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useApiCache } from './useApiCache';

export const useFavorites = (initialPage: number = 1, initialLimit: number = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const { clearFavoritesCache, clearMoviesCache } = useApiCache();

  // SWR key
  const key = `favorites?page=${page}&limit=${limit}`;

  // Fetcher function cho SWR
  const fetcher = useCallback(
    async (key: string) => {
      const url = new URL(key, 'http://example.com');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');

      return await favoriteService.getFavorites(page, limit);
    },
    []
  );

  // Sử dụng SWR hook
  const { data, error, isLoading, isValidating, mutate } = useSWR<FavoriteListResponse>(
    key,
    fetcher
  );

  // Thêm phim vào yêu thích
  const addToFavorites = useCallback(
    async (movieId: string) => {
      try {
        await favoriteService.addFavorite(movieId);
        // Refresh danh sách yêu thích sau khi thêm
        await mutate();
        toast.success('Đã thêm vào danh sách yêu thích');
        return true;
      } catch (err) {
        toast.error('Không thể thêm vào danh sách yêu thích');
        return false;
      }
    },
    [mutate]
  );

  // Xóa phim khỏi yêu thích
  const removeFromFavorites = useCallback(
    async (movieId: string) => {
      try {
        await favoriteService.removeFavorite(movieId);
        // Refresh danh sách yêu thích sau khi xóa
        await mutate();
        toast.success('Đã xóa khỏi danh sách yêu thích');
        return true;
      } catch (err) {
        toast.error('Không thể xóa khỏi danh sách yêu thích');
        return false;
      }
    },
    [mutate]
  );

  // Kiểm tra phim có trong yêu thích không
  const checkIsFavorite = useCallback(async (movieId: string) => {
    try {
      return await favoriteService.checkIsFavorite(movieId);
    } catch (err) {
      return false;
    }
  }, []);

  // Toggle trạng thái yêu thích
  const toggleFavorite = useCallback(
    async (movieId: string, currentStatus?: boolean) => {
      // Nếu không biết trạng thái hiện tại, kiểm tra
      if (currentStatus === undefined) {
        currentStatus = await checkIsFavorite(movieId);
      }

      if (currentStatus) {
        return removeFromFavorites(movieId);
      } else {
        return addToFavorites(movieId);
      }
    },
    [addToFavorites, checkIsFavorite, removeFromFavorites]
  );

  // Phân trang
  const goToPage = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    []
  );

  return {
    favorites: data?.favorites || [],
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || page,
    totalFavorites: data?.totalFavorites || 0,
    loading: isLoading,
    isValidating,
    error,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    checkIsFavorite,
    goToPage,
    setLimit,
    refreshFavorites: mutate,
  };
}; 