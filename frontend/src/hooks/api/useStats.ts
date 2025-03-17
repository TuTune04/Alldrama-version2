import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { StatsOverview, StatsTimeSeries } from '@/types';
import { statsService } from '@/lib/api';

export const useStats = () => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  
  // SWR key cho overview
  const overviewKey = 'stats/overview';
  
  // SWR keys cho time series
  const userStatsKey = `stats/time-series/users/${timeRange}`;
  const viewStatsKey = `stats/time-series/views/${timeRange}`;
  const movieStatsKey = `stats/time-series/movies/${timeRange}`;

  // Fetcher functions
  const overviewFetcher = useCallback(async () => {
    return await statsService.getOverview();
  }, []);

  const userStatsFetcher = useCallback(async () => {
    return await statsService.getUserStats(timeRange);
  }, [timeRange]);

  const viewStatsFetcher = useCallback(async () => {
    return await statsService.getViewStats(timeRange);
  }, [timeRange]);

  const movieStatsFetcher = useCallback(async () => {
    return await statsService.getMovieStats(timeRange);
  }, [timeRange]);

  // Sử dụng SWR hooks
  const { 
    data: overviewData, 
    error: overviewError, 
    isLoading: overviewLoading,
    mutate: refreshOverview 
  } = useSWR<StatsOverview>(overviewKey, overviewFetcher);

  const { 
    data: userStatsData, 
    error: userStatsError, 
    isLoading: userStatsLoading,
    mutate: refreshUserStats 
  } = useSWR<StatsTimeSeries>(userStatsKey, userStatsFetcher);

  const { 
    data: viewStatsData, 
    error: viewStatsError, 
    isLoading: viewStatsLoading,
    mutate: refreshViewStats 
  } = useSWR<StatsTimeSeries>(viewStatsKey, viewStatsFetcher);

  const { 
    data: movieStatsData, 
    error: movieStatsError, 
    isLoading: movieStatsLoading,
    mutate: refreshMovieStats 
  } = useSWR<StatsTimeSeries>(movieStatsKey, movieStatsFetcher);

  // Refresh toàn bộ dữ liệu
  const refreshAllStats = useCallback(async () => {
    await Promise.all([
      refreshOverview(),
      refreshUserStats(),
      refreshViewStats(),
      refreshMovieStats()
    ]);
  }, [refreshMovieStats, refreshOverview, refreshUserStats, refreshViewStats]);

  return {
    // Overview stats
    overview: overviewData,
    overviewLoading,
    overviewError,
    
    // User stats
    userStats: userStatsData,
    userStatsLoading,
    userStatsError,
    
    // View stats
    viewStats: viewStatsData,
    viewStatsLoading,
    viewStatsError,
    
    // Movie stats
    movieStats: movieStatsData,
    movieStatsLoading,
    movieStatsError,
    
    // Actions
    setTimeRange,
    timeRange,
    refreshAllStats,
    refreshOverview,
    refreshUserStats,
    refreshViewStats,
    refreshMovieStats,
    
    // Loading indicator
    isLoading: overviewLoading || userStatsLoading || viewStatsLoading || movieStatsLoading,
  };
}; 