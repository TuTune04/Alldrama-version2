export interface StatsOverview {
  totalUsers: number;
  totalMovies: number;
  totalEpisodes: number;
  totalViews: number;
  newUsersThisMonth: number;
}

export interface DashboardStats extends StatsOverview {
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
}

export interface PopularMovie {
  _id: string;
  title: string;
  posterUrl: string;
  views: number;
}

export interface NewUser {
  _id: string;
  email: string;
  full_name: string;
  createdAt: string;
}

export interface GenreStat {
  _id: string;
  name: string;
  movieCount: number;
}

export interface StatsTimeSeriesParams {
  // API mới sử dụng startDate/endDate
  startDate?: string;
  endDate?: string;
  
  // Hỗ trợ API cũ
  metric?: 'users' | 'views' | 'movies';
  timeRange?: 'day' | 'week' | 'month' | 'year';
}

export interface StatsTimeSeries {
  labels: string[];
  data: number[];
  metric: 'users' | 'views' | 'movies';
  timeRange: 'day' | 'week' | 'month' | 'year';
} 