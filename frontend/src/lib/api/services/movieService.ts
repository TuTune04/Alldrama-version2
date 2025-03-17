import { CreateMovieDto, Movie, MovieListResponse, MovieSearchParams, UpdateMovieDto } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export const movieService = {
  /**
   * Lấy danh sách phim
   * @param params Tham số tìm kiếm và phân trang
   */
  async getMovies(params?: MovieSearchParams): Promise<MovieListResponse> {
    return apiClient.get<MovieListResponse>(API_ENDPOINTS.MOVIES.LIST, {
      params,
    });
  },

  /**
   * Tìm kiếm phim
   * @param params Tham số tìm kiếm
   */
  async searchMovies(params: MovieSearchParams): Promise<MovieListResponse> {
    return apiClient.get<MovieListResponse>(API_ENDPOINTS.MOVIES.SEARCH, {
      params,
    });
  },

  /**
   * Lấy chi tiết phim theo ID
   * @param id ID của phim
   */
  async getMovieById(id: string): Promise<Movie> {
    return apiClient.get<Movie>(API_ENDPOINTS.MOVIES.DETAIL(id));
  },

  /**
   * Tạo phim mới (Admin)
   * @param data Dữ liệu phim
   */
  async createMovie(data: CreateMovieDto): Promise<Movie> {
    return apiClient.post<Movie>(API_ENDPOINTS.MOVIES.CREATE, data);
  },

  /**
   * Cập nhật phim (Admin)
   * @param id ID của phim
   * @param data Dữ liệu cập nhật
   */
  async updateMovie(id: string, data: UpdateMovieDto): Promise<Movie> {
    return apiClient.put<Movie>(API_ENDPOINTS.MOVIES.UPDATE(id), data);
  },

  /**
   * Xóa phim (Admin)
   * @param id ID của phim
   */
  async deleteMovie(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.MOVIES.DELETE(id));
  },
}; 