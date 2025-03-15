import { MovieService } from './movie/movieService';
import { MediaService } from './media/mediaService';
import { AuthService } from './auth/authService';
import { EpisodeService } from './episode/episodeService';
import { GenreService } from './genre/genreService';
import { UserService } from './user/userService';
import { FavoriteService } from './favorite/favoriteService';
import { WatchHistoryService } from './watchHistory/watchHistoryService';
import { CommentService } from './comment/commentService';

/**
 * Lớp quản lý dịch vụ (Service Container)
 * Cung cấp dependency injection pattern
 */
class ServiceContainer {
  private services: Map<string, unknown> = new Map();

  /**
   * Đăng ký một service vào container
   */
  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  /**
   * Lấy một service từ container
   */
  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} không được tìm thấy trong container`);
    }
    return service as T;
  }

  /**
   * Kiểm tra xem service có tồn tại trong container không
   */
  has(name: string): boolean {
    return this.services.has(name);
  }
}

// Khởi tạo container
export const serviceContainer = new ServiceContainer();

// Đăng ký các service
serviceContainer.register('movieService', new MovieService());
serviceContainer.register('mediaService', new MediaService());
serviceContainer.register('authService', new AuthService());
serviceContainer.register('episodeService', new EpisodeService());
serviceContainer.register('genreService', new GenreService());
serviceContainer.register('userService', new UserService());
serviceContainer.register('favoriteService', new FavoriteService());
serviceContainer.register('watchHistoryService', new WatchHistoryService());
serviceContainer.register('commentService', new CommentService());

// Export các service factory
export const getMovieService = (): MovieService => {
  return serviceContainer.get<MovieService>('movieService');
};

export const getMediaService = (): MediaService => {
  return serviceContainer.get<MediaService>('mediaService');
};

export const getAuthService = (): AuthService => {
  return serviceContainer.get<AuthService>('authService');
};

export const getEpisodeService = (): EpisodeService => {
  return serviceContainer.get<EpisodeService>('episodeService');
};

export const getGenreService = (): GenreService => {
  return serviceContainer.get<GenreService>('genreService');
};

export const getUserService = (): UserService => {
  return serviceContainer.get<UserService>('userService');
};

export const getFavoriteService = (): FavoriteService => {
  return serviceContainer.get<FavoriteService>('favoriteService');
};

export const getWatchHistoryService = (): WatchHistoryService => {
  return serviceContainer.get<WatchHistoryService>('watchHistoryService');
};

export const getCommentService = (): CommentService => {
  return serviceContainer.get<CommentService>('commentService');
};

// Export các loại service để có thể import trực tiếp
export { 
  MovieService, 
  MediaService, 
  AuthService, 
  EpisodeService, 
  GenreService, 
  UserService, 
  FavoriteService,
  WatchHistoryService,
  CommentService 
}; 