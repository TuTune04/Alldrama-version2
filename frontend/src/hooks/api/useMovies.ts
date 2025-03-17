import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { MovieSearchParams, MovieListResponse, Movie } from '@/types';
import { movieService } from '@/lib/api';
import { toast } from 'react-hot-toast';

export const useMovies = (initialParams?: MovieSearchParams) => {
  const [searchParams, setSearchParams] = useState<MovieSearchParams>(initialParams || {});

  // Tạo key cho SWR dựa trên params
  const getKey = useCallback((params: MovieSearchParams) => {
    const query = new URLSearchParams();
    
    if (params.query) query.append('query', params.query);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.genre) query.append('genre', params.genre);
    if (params.year) query.append('year', params.year.toString());
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    
    return `movies?${query.toString()}`;
  }, []);

  // Fetcher function cho SWR
  const fetcher = useCallback(async (key: string) => {
    // Phân tích key để lấy params
    const url = new URL(key, 'http://example.com');
    const params: Partial<MovieSearchParams> = {};
    
    url.searchParams.forEach((value, key) => {
      if (key === 'page' || key === 'limit' || key === 'year') {
        params[key as keyof MovieSearchParams] = parseInt(value) as any;
      } else {
        params[key as keyof MovieSearchParams] = value as any;
      }
    });
    
    // Gọi service
    return await movieService.getMovies(params);
  }, []);

  // Sử dụng SWR hook
  const { data, error, isLoading, isValidating, mutate } = useSWR<MovieListResponse>(
    getKey(searchParams),
    fetcher
  );

  // Lấy chi tiết phim bằng ID
  const getMovie = useCallback(async (id: string): Promise<Movie | null> => {
    try {
      return await movieService.getMovieById(id);
    } catch (err) {
      toast.error('Không thể tải thông tin phim');
      return null;
    }
  }, []);

  // Tìm kiếm phim
  const searchMovies = useCallback(async (params: MovieSearchParams) => {
    setSearchParams(params);
    await mutate();
  }, [mutate]);

  return {
    movies: data?.movies || [],
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || 1,
    totalMovies: data?.totalMovies || 0,
    loading: isLoading,
    isValidating,
    error,
    searchParams,
    searchMovies,
    getMovie,
    mutate
  };
}; 