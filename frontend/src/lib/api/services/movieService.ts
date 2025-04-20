import { Movie, MovieListResponse, MovieSearchParams } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export const movieService = {
  /**
   * Lấy danh sách phim với phân trang và lọc
   * @param params Tham số tìm kiếm và phân trang
   */
  async getMovies(params?: Partial<MovieSearchParams>): Promise<MovieListResponse> {
    const queryParams: Record<string, string> = {};
    
    if (params) {
      if (params.q) queryParams.q = params.q;
      if (params.page) queryParams.page = String(params.page);
      if (params.limit) queryParams.limit = String(params.limit);
      if (params.genre) queryParams.genre = String(params.genre);
      if (params.year) queryParams.year = String(params.year);
      if (params.sort) queryParams.sort = params.sort;
      if (params.order) queryParams.order = params.order;
    }
    
    return apiClient.get<MovieListResponse>(API_ENDPOINTS.MOVIES.LIST, { params: queryParams });
  },

  /**
   * Lấy chi tiết phim theo ID
   * @param movieId ID của phim
   */
  async getMovieById(movieId: string | number): Promise<Movie> {
    return apiClient.get<Movie>(API_ENDPOINTS.MOVIES.DETAIL(movieId));
  },

  /**
   * Tìm kiếm phim theo từ khóa
   * @param query Từ khóa tìm kiếm
   * @param page Số trang
   * @param limit Số lượng mỗi trang
   */
  async searchMovies(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<MovieListResponse> {
    return apiClient.get<MovieListResponse>(API_ENDPOINTS.MOVIES.SEARCH, {
      params: { q: query, page, limit }
    });
  },

  /**
   * Lấy danh sách phim nổi bật
   */
  async getFeaturedMovies(): Promise<Movie[]> {
    return apiClient.get<Movie[]>(API_ENDPOINTS.MOVIES.FEATURED);
  },

  /**
   * Lấy danh sách phim phổ biến
   * @param limit Số lượng phim trả về
   */
  async getPopularMovies(limit: number = 10): Promise<Movie[]> {
    return apiClient.get<Movie[]>(API_ENDPOINTS.MOVIES.POPULAR, {
      params: { limit }
    });
  },

  /**
   * Lấy danh sách phim xu hướng
   * @param limit Số lượng phim trả về
   */
  async getTrendingMovies(limit: number = 10): Promise<Movie[]> {
    return apiClient.get<Movie[]>(API_ENDPOINTS.MOVIES.TRENDING, {
      params: { limit }
    });
  },

  /**
   * Lấy danh sách phim mới nhất
   * @param limit Số lượng phim trả về
   */
  async getNewestMovies(limit: number = 10): Promise<Movie[]> {
    return apiClient.get<Movie[]>(API_ENDPOINTS.MOVIES.NEWEST, {
      params: { limit }
    });
  },

  /**
   * Lấy danh sách phim tương tự
   * @param movieId ID của phim
   * @param limit Số lượng phim trả về
   */
  async getSimilarMovies(movieId: string | number, limit: number = 10): Promise<Movie[]> {
    return apiClient.get<Movie[]>(API_ENDPOINTS.MOVIES.SIMILAR(movieId), {
      params: { limit }
    });
  }
};