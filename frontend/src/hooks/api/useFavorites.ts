import { useCallback } from 'react';
import { Favorite } from '@/types';
import { favoriteService } from '@/lib/api/services/favoriteService';
import { toast } from 'react-hot-toast';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAuthStore } from '@/store/auth';

export const useFavorites = () => {
  const { isAuthenticated } = useAuthStore();
  const { 
    favorites, 
    setFavorites, 
    addFavorite, 
    removeFavorite, 
    clearFavorites,
    isFavorite: isFavoriteInStore 
  } = useFavoritesStore();

  // Fetch favorites from API
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const result = await favoriteService.getFavorites();
      setFavorites(result);
      return result;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Không thể tải danh sách yêu thích');
      return [];
    }
  }, [isAuthenticated, setFavorites]);

  // Toggle favorite status with optimistic updates
  const toggleFavorite = useCallback(async (movieId: string | number) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào yêu thích');
      return false;
    }
    
    const currentStatus = isFavoriteInStore(movieId);
    
    // Optimistic update
    if (currentStatus) {
      removeFavorite(movieId);
    } else {
      addFavorite({ 
        id: Date.now(), // Temporary ID
        movieId, 
        favoritedAt: new Date().toISOString() 
      } as Favorite);
    }
    
    try {
      const result = await favoriteService.toggleFavorite(movieId);
      
      if (!result.favorited) {
        // Revert if failed
        fetchFavorites();
      }
      
      return result.favorited;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      fetchFavorites();
      toast.error('Không thể cập nhật danh sách yêu thích');
      return false;
    }
  }, [isAuthenticated, isFavoriteInStore, addFavorite, removeFavorite, fetchFavorites]);

  // Remove from favorites
  const removeFromFavorites = useCallback(async (movieId: string | number) => {
    if (!isAuthenticated) return false;
    
    // Optimistic update
    removeFavorite(movieId);
    
    try {
      await favoriteService.removeFromFavorites(movieId);
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      // Revert on error
      fetchFavorites();
      toast.error('Không thể xóa khỏi danh sách yêu thích');
      return false;
    }
  }, [isAuthenticated, removeFavorite, fetchFavorites]);

  return {
    data: favorites,
    isLoading: false,
    isFavorite: isFavoriteInStore,
    toggleFavorite,
    removeFromFavorites,
    refreshFavorites: fetchFavorites,
    clearFavorites
  };
};