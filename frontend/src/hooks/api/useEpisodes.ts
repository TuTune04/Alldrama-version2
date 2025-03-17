import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { Episode, EpisodeListResponse } from '@/types';
import { episodeService } from '@/lib/api';
import { toast } from 'react-hot-toast';

export const useEpisodes = (movieId: string, initialPage: number = 1, initialLimit: number = 20) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  // SWR key
  const key = movieId ? `episodes?movieId=${movieId}&page=${page}&limit=${limit}` : null;

  // Fetcher function cho SWR
  const fetcher = useCallback(
    async (key: string) => {
      const url = new URL(key, 'http://example.com');
      const movieId = url.searchParams.get('movieId') as string;
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');

      return await episodeService.getEpisodesByMovieId(movieId, page, limit);
    },
    []
  );

  // Sử dụng SWR hook
  const { data, error, isLoading, isValidating, mutate } = useSWR<EpisodeListResponse>(
    key,
    fetcher
  );

  // Lấy chi tiết tập phim
  const getEpisode = useCallback(
    async (episodeId: string): Promise<Episode | null> => {
      try {
        return await episodeService.getEpisodeById(episodeId);
      } catch (err) {
        toast.error('Không thể tải thông tin tập phim');
        return null;
      }
    },
    []
  );

  // Tăng lượt xem
  const incrementView = useCallback(
    async (episodeId: string) => {
      try {
        const result = await episodeService.incrementView(episodeId);
        return result.views;
      } catch (err) {
        // Lỗi tăng lượt xem không quá nghiêm trọng, chỉ log
        console.error('Không thể tăng lượt xem:', err);
        return null;
      }
    },
    []
  );

  // Phân trang
  const goToPage = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    []
  );

  return {
    episodes: data?.episodes || [],
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || page,
    totalEpisodes: data?.totalEpisodes || 0,
    loading: isLoading,
    isValidating,
    error,
    getEpisode,
    incrementView,
    goToPage,
    setLimit,
    mutate,
  };
}; 