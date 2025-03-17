import { 
  StatsOverview, 
  StatsTimeSeries, 
  DashboardStats, 
  PopularMovie,
  NewUser,
  GenreStat
} from '@/types';
import { mockMovies } from './movies';
import { mockUsers } from './users';
import { mockGenres } from './genres';

// Thống kê tổng quan
export const mockStatsOverview: StatsOverview = {
  totalUsers: 156,
  totalMovies: 48,
  totalEpisodes: 245,
  totalViews: 38450,
  newUsersThisMonth: 24
};

// Thống kê dashboard
export const mockDashboardStats: DashboardStats = {
  ...mockStatsOverview,
  topMovies: [
    {
      _id: mockMovies[2].id,
      title: mockMovies[2].title,
      posterUrl: mockMovies[2].posterUrl,
      views: 210000
    },
    {
      _id: mockMovies[0].id,
      title: mockMovies[0].title,
      posterUrl: mockMovies[0].posterUrl,
      views: 145000
    },
    {
      _id: mockMovies[5].id,
      title: mockMovies[5].title,
      posterUrl: mockMovies[5].posterUrl,
      views: 91000
    },
    {
      _id: mockMovies[1].id,
      title: mockMovies[1].title,
      posterUrl: mockMovies[1].posterUrl,
      views: 98000
    },
    {
      _id: mockMovies[4].id,
      title: mockMovies[4].title,
      posterUrl: mockMovies[4].posterUrl,
      views: 78000
    }
  ],
  viewsOverTime: [
    { date: '2023-03-01', views: 1200 },
    { date: '2023-03-02', views: 1350 },
    { date: '2023-03-03', views: 1100 },
    { date: '2023-03-04', views: 980 },
    { date: '2023-03-05', views: 1400 },
    { date: '2023-03-06', views: 1650 },
    { date: '2023-03-07', views: 1320 },
    { date: '2023-03-08', views: 1180 },
    { date: '2023-03-09', views: 1420 },
    { date: '2023-03-10', views: 1580 },
    { date: '2023-03-11', views: 1720 },
    { date: '2023-03-12', views: 1900 },
    { date: '2023-03-13', views: 1750 },
    { date: '2023-03-14', views: 1620 },
    { date: '2023-03-15', views: 1480 }
  ]
};

// Phim phổ biến
export const mockPopularMovies: PopularMovie[] = mockDashboardStats.topMovies;

// Người dùng mới
export const mockNewUsers: NewUser[] = [
  {
    _id: mockUsers[4].id,
    email: mockUsers[4].email,
    full_name: mockUsers[4].full_name,
    createdAt: mockUsers[4].createdAt
  },
  {
    _id: mockUsers[3].id,
    email: mockUsers[3].email,
    full_name: mockUsers[3].full_name,
    createdAt: mockUsers[3].createdAt
  },
  {
    _id: mockUsers[2].id,
    email: mockUsers[2].email,
    full_name: mockUsers[2].full_name,
    createdAt: mockUsers[2].createdAt
  }
];

// Thống kê thể loại
export const mockGenreStats: GenreStat[] = [
  {
    _id: mockGenres[0].id,
    name: mockGenres[0].name,
    movieCount: 15
  },
  {
    _id: mockGenres[1].id,
    name: mockGenres[1].name,
    movieCount: 12
  },
  {
    _id: mockGenres[4].id,
    name: mockGenres[4].name,
    movieCount: 8
  },
  {
    _id: mockGenres[2].id,
    name: mockGenres[2].name,
    movieCount: 10
  },
  {
    _id: mockGenres[3].id,
    name: mockGenres[3].name,
    movieCount: 5
  }
];

// Thống kê theo thời gian
export const mockTimeSeriesStats: StatsTimeSeries = {
  labels: ['2023-03-01', '2023-03-02', '2023-03-03', '2023-03-04', '2023-03-05', '2023-03-06', '2023-03-07'],
  data: [12, 15, 8, 14, 10, 16, 18],
  metric: 'users',
  timeRange: 'week'
}; 