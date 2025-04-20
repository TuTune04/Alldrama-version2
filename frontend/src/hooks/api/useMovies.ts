import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { MovieSearchParams, MovieListResponse, Movie } from '@/types';
import { toast } from 'react-hot-toast';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export const useMovies = (initialParams?: MovieSearchParams) => {
  const [searchParams, setSearchParams] = useState<MovieSearchParams>(initialParams || {});

  // Create key for SWR based on params
  const getKey = useCallback((params: MovieSearchParams) => {
    if (params.q) {
      // If there's a search query, use search endpoint
      const searchPath = API_ENDPOINTS.MOVIES.SEARCH;
      let queryString = new URLSearchParams({
        ...(params.q ? { q: params.q } : {}),
        ...(params.page ? { page: params.page.toString() } : {}),
        ...(params.limit ? { limit: params.limit.toString() } : {}),
        ...(params.genre ? { genre: String(params.genre) } : {}),
        ...(params.year ? { year: params.year.toString() } : {}),
        ...(params.sort ? { sort: params.sort } : {}),
        ...(params.order ? { order: params.order } : {})
      }).toString();
      
      return queryString ? `${searchPath}?${queryString}` : searchPath;
    } else if (params.genre) {
      // If genre is specified, use the genre-specific endpoint
      const genrePath = API_ENDPOINTS.MOVIES.BY_GENRE(params.genre);
      let queryString = new URLSearchParams({
        ...(params.page ? { page: params.page.toString() } : {}),
        ...(params.limit ? { limit: params.limit.toString() } : {}),
        ...(params.sort ? { sort: params.sort } : {}),
        ...(params.order ? { order: params.order } : {})
      }).toString();
      
      return queryString ? `${genrePath}?${queryString}` : genrePath;
    } else {
      // Otherwise use the list endpoint
      const listPath = API_ENDPOINTS.MOVIES.LIST;
      let queryString = new URLSearchParams({
        ...(params.page ? { page: params.page.toString() } : {}),
        ...(params.limit ? { limit: params.limit.toString() } : {}),
        ...(params.year ? { year: params.year.toString() } : {}),
        ...(params.sort ? { sort: params.sort } : {}),
        ...(params.order ? { order: params.order } : {})
      }).toString();
      
      return queryString ? `${listPath}?${queryString}` : listPath;
    }
  }, []);

  // Fetcher function for SWR - sử dụng URL tương đối (không có API_BASE_URL)
  const fetcher = useCallback(async (url: string) => {
    console.log('Fetching movies from:', url);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }
  }, []);

  // Use SWR hook
  const { data, error, isLoading, isValidating, mutate } = useSWR<MovieListResponse>(
    getKey(searchParams),
    fetcher
  );

  // Get featured movies
  const getFeaturedMovies = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.MOVIES.FEATURED);
      if (!response.ok) {
        throw new Error('Failed to fetch featured movies');
      }
      return await response.json();
    } catch (err) {
      toast.error('Không thể tải phim đặc sắc');
      return null;
    }
  }, []);

  // Get popular movies
  const getPopularMovies = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.MOVIES.POPULAR);
      if (!response.ok) {
        throw new Error('Failed to fetch popular movies');
      }
      return await response.json();
    } catch (err) {
      toast.error('Không thể tải phim phổ biến');
      return null;
    }
  }, []);

  // Get trending movies
  const getTrendingMovies = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.MOVIES.TRENDING);
      if (!response.ok) {
        throw new Error('Failed to fetch trending movies');
      }
      return await response.json();
    } catch (err) {
      toast.error('Không thể tải phim xu hướng');
      return null;
    }
  }, []);

  // Get newest movies
  const getNewestMovies = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.MOVIES.NEWEST);
      if (!response.ok) {
        throw new Error('Failed to fetch newest movies');
      }
      return await response.json();
    } catch (err) {
      toast.error('Không thể tải phim mới nhất');
      return null;
    }
  }, []);

  // Get similar movies
  const getSimilarMovies = useCallback(async (movieId: string | number) => {
    try {
      const response = await fetch(API_ENDPOINTS.MOVIES.SIMILAR(movieId));
      if (!response.ok) {
        throw new Error('Failed to fetch similar movies');
      }
      return await response.json();
    } catch (err) {
      console.error('Không thể tải phim tương tự:', err);
      return null;
    }
  }, []);

  // Get movie details by ID
  const getMovie = useCallback(async (id: string | number): Promise<Movie | null> => {
    try {
      const response = await fetch(API_ENDPOINTS.MOVIES.DETAIL(id));
      if (!response.ok) {
        throw new Error('Failed to fetch movie details');
      }
      return await response.json();
    } catch (err) {
      toast.error('Không thể tải thông tin phim');
      return null;
    }
  }, []);

  // Search movies
  const searchMovies = useCallback(async (params: MovieSearchParams) => {
    setSearchParams(params);
    await mutate();
  }, [mutate]);

  return {
    movies: data?.movies || [],
    pagination: data?.pagination || { total: 0, totalPages: 0, currentPage: 1, limit: 10 },
    loading: isLoading,
    isValidating,
    error,
    searchParams,
    searchMovies,
    getMovie,
    getFeaturedMovies,
    getPopularMovies,
    getTrendingMovies,
    getNewestMovies,
    getSimilarMovies,
    refreshMovies: mutate
  };
};