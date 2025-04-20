import { useCallback } from 'react';
import useSWR from 'swr';
import { Genre } from '@/types';
import { toast } from 'react-hot-toast';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export const useGenres = () => {
  // SWR key
  const key = API_ENDPOINTS.GENRES.LIST;

  // Fetcher function for SWR
  const fetcher = useCallback(async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch genres');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  }, []);

  // Using SWR hook with long-term caching config
  const { data, error, isLoading, isValidating, mutate } = useSWR<Genre[]>(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    dedupingInterval: 3600000, // 1 hour
  });

  // Find genre by ID
  const findGenreById = useCallback(
    (id: number | string): Genre | undefined => {
      return data?.find((genre) => String(genre.id) === String(id));
    },
    [data]
  );

  // Find genre by name
  const findGenreByName = useCallback(
    (name: string): Genre | undefined => {
      return data?.find((genre) => genre.name.toLowerCase() === name.toLowerCase());
    },
    [data]
  );

  // Get genre details by ID
  const getGenreById = useCallback(
    async (genreId: number | string) => {
      try {
        const response = await fetch(API_ENDPOINTS.GENRES.DETAIL(genreId));
        if (!response.ok) {
          throw new Error('Failed to fetch genre details');
        }
        return await response.json();
      } catch (err) {
        toast.error('Không thể tải thông tin thể loại');
        return null;
      }
    },
    []
  );

  // Get movies by genre
  const getMoviesByGenre = useCallback(async (genreId: number | string) => {
    try {
      const response = await fetch(API_ENDPOINTS.MOVIES.BY_GENRE(genreId));
      if (!response.ok) {
        throw new Error('Failed to fetch movies by genre');
      }
      return await response.json();
    } catch (err) {
      toast.error('Không thể tải danh sách phim theo thể loại');
      return null;
    }
  }, []);

  return {
    genres: data || [],
    loading: isLoading,
    isValidating,
    error,
    findGenreById,
    findGenreByName,
    getGenreById,
    getMoviesByGenre,
    refreshGenres: mutate,
  };
};