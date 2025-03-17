import { StatsOverview, StatsTimeSeries, StatsTimeSeriesParams } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

/**
 * Chuyển đổi timeRange thành khoảng thời gian start-end
 */
function convertTimeRangeToDateRange(timeRange: 'day' | 'week' | 'month' | 'year'): { startDate: string, endDate: string } {
  const endDate = new Date().toISOString().split('T')[0]; // Định dạng YYYY-MM-DD
  let startDate = new Date();
  
  switch(timeRange) {
    case 'day': startDate.setDate(startDate.getDate() - 1); break;
    case 'week': startDate.setDate(startDate.getDate() - 7); break;
    case 'month': startDate.setMonth(startDate.getMonth() - 1); break;
    case 'year': startDate.setFullYear(startDate.getFullYear() - 1); break;
  }
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate
  };
}

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
    const { startDate, endDate } = convertTimeRangeToDateRange(timeRange);
    
    return this.getTimeSeries({
      startDate,
      endDate,
      metric: 'users',
      timeRange,
    });
  },

  /**
   * Lấy thống kê lượt xem theo thời gian
   * @param timeRange Khoảng thời gian
   */
  async getViewStats(timeRange: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<StatsTimeSeries> {
    const { startDate, endDate } = convertTimeRangeToDateRange(timeRange);
    
    return this.getTimeSeries({
      startDate,
      endDate,
      metric: 'views',
      timeRange,
    });
  },

  /**
   * Lấy thống kê phim theo thời gian
   * @param timeRange Khoảng thời gian
   */
  async getMovieStats(timeRange: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<StatsTimeSeries> {
    const { startDate, endDate } = convertTimeRangeToDateRange(timeRange);
    
    return this.getTimeSeries({
      startDate,
      endDate,
      metric: 'movies',
      timeRange,
    });
  },

  /**
   * Lấy thống kê tổng quan (dashboard)
   * @param startDate Ngày bắt đầu (định dạng YYYY-MM-DD)
   * @param endDate Ngày kết thúc (định dạng YYYY-MM-DD)
   */
  async getDashboardStats(startDate?: string, endDate?: string): Promise<{
    totalUsers: number;
    totalMovies: number;
    totalEpisodes: number;
    newUsersThisMonth: number;
    totalViews: number;
    topMovies: Array<{
      _id: string;
      title: string;
      posterUrl: string;
      views: number;
    }>;
    viewsOverTime: Array<{
      date: string;
      views: number;
    }>;
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return apiClient.get(
      `${API_ENDPOINTS.STATS.DASHBOARD}?${params.toString()}`
    );
  },

  /**
   * Lấy thống kê phim phổ biến
   * @param limit Số lượng phim muốn lấy
   */
  async getPopularMovies(limit?: number): Promise<Array<{
    _id: string;
    title: string;
    posterUrl: string;
    views: number;
  }>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    return apiClient.get(
      `${API_ENDPOINTS.STATS.POPULAR_MOVIES}?${params.toString()}`
    );
  },

  /**
   * Lấy thống kê người dùng mới
   * @param limit Số lượng người dùng muốn lấy
   */
  async getNewUsers(limit?: number): Promise<Array<{
    _id: string;
    email: string;
    full_name: string;
    createdAt: string;
  }>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    return apiClient.get(
      `${API_ENDPOINTS.STATS.NEW_USERS}?${params.toString()}`
    );
  },

  /**
   * Lấy thống kê theo thể loại
   */
  async getGenreStats(): Promise<Array<{
    _id: string;
    name: string;
    movieCount: number;
  }>> {
    return apiClient.get(API_ENDPOINTS.STATS.GENRES);
  }
}; 