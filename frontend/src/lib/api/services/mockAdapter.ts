import {
  mockGenres,
  mockMovies,
  mockMovieListResponse,
  mockEpisodes,
  getEpisodeListResponse,
  mockUsers,
  mockCurrentUser,
  mockWatchHistory,
  getUserWatchHistory,
  mockFavorites,
  getUserFavorites,
  mockComments,
  getMovieComments,
  mockStatsOverview,
  mockDashboardStats,
  mockPopularMovies,
  mockNewUsers,
  mockGenreStats,
  mockTimeSeriesStats
} from '@/mocks';

/**
 * Adapter để sử dụng mock data thay vì gọi API thật
 * Sử dụng lớp này để phát triển UI trước khi tích hợp API
 */
export class MockAdapter {
  // Auth
  static getCurrentUser() {
    return Promise.resolve(mockCurrentUser);
  }

  // Movies
  static getMovieList(params?: any) {
    return Promise.resolve(mockMovieListResponse);
  }

  static getMovieById(id: string) {
    const movie = mockMovies.find(m => m.id === id);
    return Promise.resolve(movie || null);
  }

  // Episodes
  static getEpisodesByMovieId(movieId: string, params?: any) {
    return Promise.resolve(getEpisodeListResponse(movieId));
  }

  static getEpisodeById(id: string) {
    const episode = mockEpisodes.find(e => e.id === id);
    return Promise.resolve(episode || null);
  }

  // Genres
  static getGenres() {
    return Promise.resolve(mockGenres);
  }

  // Watch History
  static getUserWatchHistory(userId: string, params?: any) {
    return Promise.resolve(getUserWatchHistory(userId));
  }

  static addWatchHistory(data: any) {
    return Promise.resolve({ success: true });
  }

  static updateWatchHistory(id: string, data: any) {
    return Promise.resolve({ success: true });
  }

  // Favorites
  static getUserFavorites(userId: string, params?: any) {
    return Promise.resolve(getUserFavorites(userId));
  }

  static addFavorite(data: any) {
    return Promise.resolve({ success: true, id: 'new-favorite-id' });
  }

  static removeFavorite(id: string) {
    return Promise.resolve({ success: true });
  }

  // Comments
  static getMovieComments(movieId: string, params?: any) {
    return Promise.resolve(getMovieComments(movieId));
  }

  static addComment(data: any) {
    return Promise.resolve({ 
      success: true, 
      id: 'new-comment-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  static updateComment(id: string, data: any) {
    return Promise.resolve({ success: true });
  }

  static deleteComment(id: string) {
    return Promise.resolve({ success: true });
  }

  // Stats
  static getStatsOverview() {
    return Promise.resolve(mockStatsOverview);
  }

  static getDashboardStats() {
    return Promise.resolve(mockDashboardStats);
  }

  static getPopularMovies() {
    return Promise.resolve(mockPopularMovies);
  }

  static getNewUsers() {
    return Promise.resolve(mockNewUsers);
  }

  static getGenreStats() {
    return Promise.resolve(mockGenreStats);
  }

  static getTimeSeriesStats(params: any) {
    return Promise.resolve(mockTimeSeriesStats);
  }
} 