import { Genre, Movie, MovieListResponse } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export const genreService = {
  /**
   * Lấy danh sách tất cả thể loại
   */
  async getAllGenres(): Promise<Genre[]> {
    return apiClient.get<Genre[]>(API_ENDPOINTS.GENRES.LIST);
  },

  /**
   * Lấy thông tin chi tiết thể loại
   * @param genreId ID của thể loại
   */
  async getGenreById(genreId: string | number): Promise<Genre> {
    return apiClient.get<Genre>(API_ENDPOINTS.GENRES.DETAIL(genreId));
  },

  /**
   * Lấy danh sách phim theo thể loại
   * @param genreId ID của thể loại
   * @param page Số trang
   * @param limit Số lượng mỗi trang
   * @param sort Trường sắp xếp
   * @param order Thứ tự sắp xếp
   */
  async getMoviesByGenreId(
    genreId: string | number,
    page: number = 1,
    limit: number = 20,
    sort: string = 'createdAt',
    order: 'ASC' | 'DESC' = 'DESC'
  ): Promise<MovieListResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort,
      order
    });
    
    return apiClient.get<MovieListResponse>(
      `${API_ENDPOINTS.MOVIES.BY_GENRE(genreId)}?${params.toString()}`
    );
  }
};