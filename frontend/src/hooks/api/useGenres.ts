import { useCallback } from 'react';
import useSWR from 'swr';
import { Genre } from '@/types';
import { genreService } from '@/lib/api';

export const useGenres = () => {
  // SWR key
  const key = 'genres';

  // Fetcher function cho SWR
  const fetcher = useCallback(async () => {
    return await genreService.getAllGenres();
  }, []);

  // Sử dụng SWR hook với cấu hình cache dài hạn
  const { data, error, isLoading, isValidating, mutate } = useSWR<Genre[]>(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    dedupingInterval: 3600000, // 1 giờ
  });

  // Tìm thể loại theo ID
  const findGenreById = useCallback(
    (id: string): Genre | undefined => {
      return data?.find((genre) => genre.id === id);
    },
    [data]
  );

  // Tìm thể loại theo tên
  const findGenreByName = useCallback(
    (name: string): Genre | undefined => {
      return data?.find((genre) => genre.name.toLowerCase() === name.toLowerCase());
    },
    [data]
  );

  return {
    genres: data || [],
    loading: isLoading,
    isValidating,
    error,
    findGenreById,
    findGenreByName,
    refreshGenres: mutate,
  };
}; 