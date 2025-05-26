import { useCallback } from 'react';
import { Movie } from '@/types';
import { useMovies } from '@/hooks/api/useMovies';
import { toast } from 'react-hot-toast';
import useSWR, { mutate as globalMutate } from 'swr';

interface HomepageData {
  newest: Movie[];
  popular: Movie[];
  featured: Movie[];
  trending: Movie[];
  genres: {
    [id: number]: Movie[];
  };
}

// SWR cache key for homepage data
const SWR_CACHE_KEY = 'homepage_data';

// Static method to clear homepage cache from anywhere
export const clearHomepageCache = () => {
  globalMutate(SWR_CACHE_KEY, undefined, { revalidate: false });
};

export const useHomepageData = () => {
  const { getAllMovies } = useMovies();

  // Data fetcher for SWR - fetches all movies at once
  const fetchHomepageData = useCallback(async () => {
    try {
      // Fetch all movies at once
      const allMovies = await getAllMovies();
      
      if (!allMovies) {
        throw new Error('Failed to fetch movies');
      }

      // Sort and filter movies on the client side
      const sortedByDate = [...allMovies].sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );
      
      const sortedByViews = [...allMovies].sort((a, b) => 
        (b.views || 0) - (a.views || 0)
      );
      
      const sortedByRating = [...allMovies].sort((a, b) => 
        (b.rating || 0) - (a.rating || 0)
      );
      
      const sortedByTrending = [...allMovies].sort((a, b) => 
        ((b.views || 0) * (b.rating || 0)) - ((a.views || 0) * (a.rating || 0))
      );

      // Filter movies by genre
      const actionMovies = allMovies.filter(movie => 
        movie.genres?.some(genre => genre.id === 1)
      );
      
      const dramaMovies = allMovies.filter(movie => 
        movie.genres?.some(genre => genre.id === 3)
      );

      return {
        newest: sortedByDate.slice(0, 10),
        popular: sortedByViews.slice(0, 10),
        featured: sortedByRating.slice(0, 10),
        trending: sortedByTrending.slice(0, 10),
        genres: {
          1: actionMovies.slice(0, 10),
          3: dramaMovies.slice(0, 10)
        }
      };
    } catch (err) {
      console.error('Error fetching homepage data:', err);
      throw err;
    }
  }, [getAllMovies]);

  // Use SWR for data fetching and caching
  const { 
    data, 
    error: swrError, 
    isLoading: swrIsLoading, 
    isValidating, 
    mutate 
  } = useSWR<HomepageData>(
    SWR_CACHE_KEY, 
    fetchHomepageData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: true,
      dedupingInterval: 5000
    }
  );

  return {
    ...data || { newest: [], popular: [], featured: [], trending: [], genres: {} },
    isLoading: swrIsLoading,
    error: swrError,
    isRefreshing: isValidating && !swrIsLoading,
    refreshData: mutate
  };
};
