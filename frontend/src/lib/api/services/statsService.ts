import { StatsOverview, StatsTimeSeries, StatsTimeSeriesParams } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export const statsService = {
  /**
   * Lấy thống kê tổng quan
   */
  async getOverview(): Promise<StatsOverview> {
    return apiClient.get<StatsOverview>(API_ENDPOINTS.STATS.OVERVIEW);
  },

  /**
   * Lấy thống kê theo thời gian
   * @param params Tham số thống kê
   */
  async getTimeSeries(params: StatsTimeSeriesParams): Promise<StatsTimeSeries> {
    return apiClient.get<StatsTimeSeries>(API_ENDPOINTS.STATS.TIME_SERIES, {
      params,
    });
  },

  /**
   * Lấy thống kê người dùng theo thời gian
   * @param timeRange Khoảng thời gian
   */
  async getUserStats(timeRange: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<StatsTimeSeries> {
    return this.getTimeSeries({
      metric: 'users',
      timeRange,
    });
  },

  /**
   * Lấy thống kê lượt xem theo thời gian
   * @param timeRange Khoảng thời gian
   */
  async getViewStats(timeRange: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<StatsTimeSeries> {
    return this.getTimeSeries({
      metric: 'views',
      timeRange,
    });
  },

  /**
   * Lấy thống kê phim theo thời gian
   * @param timeRange Khoảng thời gian
   */
  async getMovieStats(timeRange: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<StatsTimeSeries> {
    return this.getTimeSeries({
      metric: 'movies',
      timeRange,
    });
  },
}; 