import { useState, useCallback, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { Favorite } from '@/types';
import { favoriteService, FavoriteResponse } from '@/lib/api/services/favoriteService';
import { toast } from 'react-hot-toast';
import { useApiCache } from './useApiCache';
import { useAuthStore } from '@/store/authStore';

// Cache configuration
const FAVORITE_CACHE_KEY = 'favorites-cache';
const FAVORITE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const ERROR_RESET_TIME = 5 * 60 * 1000; // 5 minutes
const MAX_ERROR_COUNT = 3;

// Cache singleton
class FavoriteCache {
  private static instance: FavoriteCache;
  private cache: Record<string, boolean> = {};
  private timestamp: number = 0;
  private favorites: Favorite[] | null = null;
  private isClient: boolean;

  private constructor() {
    this.isClient = typeof window !== 'undefined';
    if (this.isClient) {
      this.loadFromLocalStorage();
    }
  }

  public static getInstance(): FavoriteCache {
    if (!FavoriteCache.instance) {
      FavoriteCache.instance = new FavoriteCache();
    }
    return FavoriteCache.instance;
  }

  private loadFromLocalStorage(): void {
    if (!this.isClient) return;
    
    try {
      const cacheData = localStorage.getItem(FAVORITE_CACHE_KEY);
      if (cacheData) {
        const { favorites, timestamp } = JSON.parse(cacheData);
        if (favorites && timestamp && Date.now() - timestamp < FAVORITE_CACHE_TTL) {
          this.favorites = favorites;
          this.timestamp = timestamp;
          // Update item cache
          favorites.forEach((fav: Favorite) => {
            if (fav.movieId) {
              this.cache[String(fav.movieId)] = true;
            }
          });
        }
      }
    } catch (e) {
      console.error('Error loading favorites from localStorage', e);
    }
  }

  public saveToLocalStorage(favorites: Favorite[]): void {
    if (!this.isClient) return;
    
    try {
      const cacheData = {
        favorites,
        timestamp: Date.now()
      };
      localStorage.setItem(FAVORITE_CACHE_KEY, JSON.stringify(cacheData));
      this.timestamp = cacheData.timestamp;
      this.favorites = favorites;
      
      // Update item cache
      this.cache = {};
      favorites.forEach(fav => {
        if (fav.movieId) {
          this.cache[String(fav.movieId)] = true;
        }
      });
    } catch (e) {
      console.error('Error saving favorites to localStorage', e);
    }
  }

  public getFavorites(): Favorite[] | null {
    if (this.isExpired()) {
      return null;
    }
    return this.favorites;
  }

  public isMovieFavorite(movieId: string | number): boolean | null {
    if (this.isExpired()) {
      return null;
    }
    return !!this.cache[String(movieId)];
  }

  public setMovieFavorite(movieId: string | number, isFavorite: boolean): void {
    this.cache[String(movieId)] = isFavorite;
    
    // Update favorites list for consistency
    if (this.favorites) {
      const movieIdStr = String(movieId);
      if (isFavorite && !this.favorites.some(fav => String(fav.movieId) === movieIdStr)) {
        this.favorites.push({
          id: Date.now(),
          movieId,
          favoritedAt: new Date().toISOString()
        } as Favorite);
      } else if (!isFavorite) {
        this.favorites = this.favorites.filter(fav => String(fav.movieId) !== movieIdStr);
      }
      this.saveToLocalStorage(this.favorites);
    }
  }

  public clearCache(): void {
    this.cache = {};
    this.favorites = null;
    this.timestamp = 0;
    
    if (this.isClient) {
      try {
        localStorage.removeItem(FAVORITE_CACHE_KEY);
      } catch (e) {
        console.error('Error removing favorites from localStorage', e);
      }
    }
  }

  public isExpired(): boolean {
    return !this.timestamp || (Date.now() - this.timestamp > FAVORITE_CACHE_TTL);
  }
}

export const useFavorites = () => {
  const { clearFavoritesCache, clearMoviesCache } = useApiCache();
  const [favoriteCache, setFavoriteCache] = useState<FavoriteCache | null>(null);
  const errorCountRef = useRef(0);
  const lastErrorTimeRef = useRef(0);
  const [isFetchingFavorites, setIsFetchingFavorites] = useState(false);
  const { isAuthenticated } = useAuthStore();

  // Initialize favorite cache only on client-side 
  useEffect(() => {
    setFavoriteCache(FavoriteCache.getInstance());
  }, []);

  // Reset error count after timeout
  useEffect(() => {
    const checkErrorReset = () => {
      const now = Date.now();
      if (now - lastErrorTimeRef.current > ERROR_RESET_TIME) {
        errorCountRef.current = 0;
      }
    };
    
    const interval = setInterval(checkErrorReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // SWR key for favorites - only fetch if logged in and in browser environment
  const key = isAuthenticated && typeof window !== 'undefined' ? 'favorites' : null;

  // Kiểm tra xem có nên thử lại sau lỗi không
  const shouldRetryAfterError = () => {
    const now = Date.now();
    
    // Reset error count after ERROR_RESET_TIME
    if (now - lastErrorTimeRef.current > ERROR_RESET_TIME) {
      errorCountRef.current = 0;
    }
    
    // Don't retry if error count exceeds MAX_ERROR_COUNT
    return errorCountRef.current < MAX_ERROR_COUNT;
  };

  // Fetcher function for SWR with error tracking
  const fetcher = useCallback(
    async () => {
      // Skip if not logged in
      if (!isAuthenticated) {
        return [];
      }
      
      // Skip if already fetching or too many errors
      if (isFetchingFavorites || !shouldRetryAfterError()) {
        console.log('Skipping favorites fetch:', 
          isFetchingFavorites ? 'already fetching' : 'too many errors');
        
        // Return cached data if available
        const cachedFavorites = favoriteCache?.getFavorites();
        return cachedFavorites || [];
      }
      
      console.log('Fetching favorites list');
      setIsFetchingFavorites(true);
      
      try {
        const result = await favoriteService.getFavorites();
        console.log('Favorites fetched successfully:', result);
        
        // Save to cache if valid
        if (result && Array.isArray(result)) {
          favoriteCache?.saveToLocalStorage(result);
        }
        
        return result;
      } catch (error) {
        console.error('Error fetching favorites:', error);
        
        // Increase error count and update time
        errorCountRef.current += 1;
        lastErrorTimeRef.current = Date.now();
        
        // Return from cache if available
        const cachedFavorites = favoriteCache?.getFavorites();
        return cachedFavorites || [];
      } finally {
        setIsFetchingFavorites(false);
      }
    },
    [isFetchingFavorites, isAuthenticated, favoriteCache]
  );

  // Use SWR hook with optimized config
  const { data, error, isLoading, isValidating, mutate } = useSWR<Favorite[]>(
    key,
    fetcher,
    { 
      revalidateOnFocus: false,      // Don't reload on focus
      revalidateOnReconnect: true,   // Reload on network reconnect
      refreshInterval: 0,            // No automatic refresh
      dedupingInterval: 10000,       // Reduce duplicate calls (10 seconds)
      errorRetryCount: 2,            // Only retry twice on error
      errorRetryInterval: 5000,      // Wait 5 seconds before retry
      revalidateOnMount: true,       // Validate when component mounts
      shouldRetryOnError: (err) => {
        // Don't retry on auth errors
        if (err.response?.status === 401 || err.response?.status === 403) {
          return false;
        }
        return true;
      }
    }
  );

  // Check if movie is in favorites - optimized with cache
  const isFavorite = useCallback(
    async (movieId: string | number) => {
      if (!movieId || !isAuthenticated || !favoriteCache) return false;
      
      const movieIdStr = String(movieId);
      
      // Check cache first
      const cachedStatus = favoriteCache.isMovieFavorite(movieIdStr);
      if (cachedStatus !== null && cachedStatus !== undefined) {
        return Boolean(cachedStatus);
      }
      
      try {
        console.log('Checking if movie is favorite:', movieId);
        
        // Try to find it in the current data first
        if (data && Array.isArray(data)) {
          const isFav = data.some(fav => String(fav.movieId) === movieIdStr);
          favoriteCache.setMovieFavorite(movieIdStr, isFav);
          return isFav;
        }
        
        // If not found or no data, check with API
        const result = await favoriteService.isFavorite(movieId);
        favoriteCache.setMovieFavorite(movieIdStr, result);
        return result;
      } catch (err) {
        console.error('Error checking favorite status:', err);
        
        // Return cached value if available
        const cachedFav = favoriteCache.isMovieFavorite(movieIdStr);
        return cachedFav === true; // Ensure we return a boolean
      }
    },
    [data, isAuthenticated, favoriteCache]
  );

  // Toggle a movie's favorite status
  const toggleFavorite = useCallback(
    async (movieId: string | number) => {
      // Skip if not authenticated or cache not initialized
      if (!isAuthenticated || !favoriteCache) return false;
      
      const movieIdStr = String(movieId);
      
      try {
        // Get current status
        const currentStatus = await isFavorite(movieId);
        
        // Optimistic update - update UI immediately
        const newFavState = !currentStatus;
        favoriteCache.setMovieFavorite(movieIdStr, newFavState);
        
        // Update data optimistically
        if (data && Array.isArray(data)) {
          const optimisticData = newFavState
            ? [...data, { movieId, favoritedAt: new Date().toISOString() } as Favorite]
            : data.filter(fav => String(fav.movieId) !== movieIdStr);
          mutate(optimisticData, false);
        }
        
        // Call API
        const result = await favoriteService.toggleFavorite(movieId);
        
        // Update cache with actual result
        favoriteCache.setMovieFavorite(movieIdStr, result.favorited);
        
        // Revalidate after API call succeeds
        mutate();
        return result.favorited;
      } catch (error) {
        console.error('Error toggling favorite:', error);
        
        try {
          // Revert optimistic update
          const currentStatus = await isFavorite(movieId);
          favoriteCache.setMovieFavorite(movieIdStr, currentStatus);
          await mutate(); // Revalidate to revert UI
          
          // Show error message
          toast.error('Không thể cập nhật danh sách yêu thích');
        } catch (revertError) {
          console.error('Error reverting optimistic update:', revertError);
        }
        
        return false;
      }
    },
    [mutate, isFavorite, isAuthenticated, favoriteCache, data]
  );
  
  // Remove a movie from favorites
  const removeFavorite = useCallback(
    async (movieId: string | number) => {
      // Skip if not authenticated or cache not initialized
      if (!isAuthenticated || !favoriteCache) return false;
      
      const movieIdStr = String(movieId);
      
      try {
        // Optimistic update - update UI immediately
        favoriteCache.setMovieFavorite(movieIdStr, false);
        
        // Update data optimistically
        if (data && Array.isArray(data)) {
          const optimisticData = data.filter(fav => String(fav.movieId) !== movieIdStr);
          mutate(optimisticData, false);
        }
        
        // Call API
        await favoriteService.removeFromFavorites(movieId);
        
        // Revalidate after API call succeeds
        mutate();
        return true;
      } catch (error) {
        console.error('Error removing favorite:', error);
        
        try {
          // Revert optimistic update
          favoriteCache.setMovieFavorite(movieIdStr, true);
          await mutate(); // Revalidate to revert UI
          
          // Show error message
          toast.error('Không thể xóa khỏi danh sách yêu thích');
        } catch (revertError) {
          console.error('Error reverting optimistic update:', revertError);
        }
        
        return false;
      }
    },
    [mutate, isFavorite, isAuthenticated, favoriteCache, data]
  );

  // Clear all cache
  const clearFavoriteCache = useCallback(() => {
    favoriteCache?.clearCache();
    errorCountRef.current = 0;
    lastErrorTimeRef.current = 0;
    mutate([], false);
  }, [mutate, favoriteCache]);

  // Clear favorites when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      clearFavoriteCache();
    }
  }, [isAuthenticated, clearFavoriteCache]);

  return {
    data,
    isLoading,
    isValidating,
    error,
    isFavorite,
    toggleFavorite,
    removeFromFavorites: removeFavorite,
    refreshFavorites: mutate,
    clearFavoriteCache,
    addToFavorites: (movieId: string | number) => toggleFavorite(movieId)
  };
};