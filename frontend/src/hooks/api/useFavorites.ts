import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { Favorite } from '@/types';
import { favoriteService, FavoriteResponse } from '@/lib/api/services/favoriteService';
import { toast } from 'react-hot-toast';
import { useApiCache } from './useApiCache';

export const useFavorites = () => {
  const { clearFavoritesCache, clearMoviesCache } = useApiCache();

  // SWR key for favorites
  const key = 'favorites';

  // Fetcher function for SWR
  const fetcher = useCallback(
    async () => {
      return await favoriteService.getFavorites();
    },
    []
  );

  // Use SWR hook
  const { data, error, isLoading, isValidating, mutate } = useSWR<Favorite[]>(
    key,
    fetcher
  );

  // Add movie to favorites
  const addToFavorites = useCallback(
    async (movieId: string | number) => {
      try {
        const response = await favoriteService.addToFavorites(movieId);
        await mutate();
        toast.success(response.message);
        return response.favorite;
      } catch (err) {
        toast.error('Không thể thêm vào danh sách yêu thích');
        return null;
      }
    },
    [mutate]
  );

  // Remove movie from favorites
  const removeFromFavorites = useCallback(
    async (movieId: string | number) => {
      try {
        const response = await favoriteService.removeFromFavorites(movieId);
        await mutate();
        toast.success(response.message);
        return true;
      } catch (err) {
        toast.error('Không thể xóa khỏi danh sách yêu thích');
        return false;
      }
    },
    [mutate]
  );

  // Check if movie is in favorites
  const isFavorite = useCallback(
    async (movieId: string | number) => {
      try {
        return await favoriteService.isFavorite(movieId);
      } catch (err) {
        console.error('Error checking favorite status:', err);
        return false;
      }
    },
    []
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (movieId: string | number) => {
      try {
        const result = await favoriteService.toggleFavorite(movieId);
        await mutate();
        toast.success(result.message);
        return result.favorited;
      } catch (err) {
        toast.error('Không thể thay đổi trạng thái yêu thích');
        return null;
      }
    },
    [mutate]
  );

  return {
    favorites: data || [],
    loading: isLoading,
    isValidating,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    refreshFavorites: mutate,
  };
};