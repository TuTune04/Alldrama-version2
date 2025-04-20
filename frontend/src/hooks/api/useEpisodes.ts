import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { Episode, EpisodeListResponse } from '@/types';
import { toast } from 'react-hot-toast';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export const useEpisodes = (movieId: string | number) => {
  // SWR key - note that the backend returns all episodes for a movie, not paginated
  const key = movieId ? API_ENDPOINTS.EPISODES.LIST(movieId) : null;

  // Fetcher function for SWR
  const fetcher = useCallback(
    async (url: string) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch episodes');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching episodes:', error);
        throw error;
      }
    },
    []
  );

  // Using SWR hook
  const { data, error, isLoading, isValidating, mutate } = useSWR<EpisodeListResponse>(
    key,
    fetcher
  );

  // Get episode details
  const getEpisode = useCallback(
    async (episodeId: string | number): Promise<Episode | null> => {
      try {
        const response = await fetch(API_ENDPOINTS.EPISODES.DETAIL(episodeId));
        if (!response.ok) {
          throw new Error('Failed to fetch episode');
        }
        return await response.json();
      } catch (err) {
        toast.error('Không thể tải thông tin tập phim');
        return null;
      }
    },
    []
  );

  // Get next episode
  const getNextEpisode = useCallback(
    async (episodeId: string | number): Promise<Episode | null> => {
      try {
        const response = await fetch(API_ENDPOINTS.EPISODES.NEXT(episodeId));
        if (!response.ok) {
          if (response.status === 404) {
            // No next episode is available
            return null;
          }
          throw new Error('Failed to fetch next episode');
        }
        return await response.json();
      } catch (err) {
        console.error('Error fetching next episode:', err);
        return null;
      }
    },
    []
  );

  // Get previous episode
  const getPreviousEpisode = useCallback(
    async (episodeId: string | number): Promise<Episode | null> => {
      try {
        const response = await fetch(API_ENDPOINTS.EPISODES.PREVIOUS(episodeId));
        if (!response.ok) {
          if (response.status === 404) {
            // No previous episode is available
            return null;
          }
          throw new Error('Failed to fetch previous episode');
        }
        return await response.json();
      } catch (err) {
        console.error('Error fetching previous episode:', err);
        return null;
      }
    },
    []
  );

  // Increment view count
  const incrementView = useCallback(
    async (episodeId: string | number) => {
      try {
        const response = await fetch(`/api/views/episode/${episodeId}`, {
          method: 'POST',
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to increment view count');
        }
        
        return await response.json();
      } catch (err) {
        // View count increment errors are not critical, just log them
        console.error('Không thể tăng lượt xem:', err);
        return null;
      }
    },
    []
  );

  return {
    episodes: data?.episodes || [],
    totalEpisodes: data?.totalItems || 0,
    loading: isLoading,
    isValidating,
    error,
    getEpisode,
    getNextEpisode,
    getPreviousEpisode,
    incrementView,
    refreshEpisodes: mutate,
  };
};