export interface StatsOverview {
  totalUsers: number;
  totalMovies: number;
  totalViews: number;
  newUsersToday: number;
  viewsToday: number;
}

export interface StatsTimeSeries {
  labels: string[];
  data: number[];
  metric: 'users' | 'views' | 'movies';
  timeRange: 'day' | 'week' | 'month' | 'year';
}

export interface StatsTimeSeriesParams {
  metric: 'users' | 'views' | 'movies';
  timeRange: 'day' | 'week' | 'month' | 'year';
} 