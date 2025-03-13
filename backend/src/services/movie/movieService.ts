import { Movie } from '../../models/Movie';
import { Genre } from '../../models/Genre';
import { Op } from 'sequelize';
import { cacheMovieData, getCachedMovieData, cacheSearchResults, getCachedSearchResults } from '../redisService';

/**
 * Interface cho tham số phân trang và sắp xếp
 */
export interface ListMoviesParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

/**
 * Service xử lý business logic cho Movie
 */
export class MovieService {
  /**
   * Lấy danh sách phim với phân trang và sắp xếp
   */
  public async getMovies(params: ListMoviesParams) {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'DESC'
    } = params;

    // Tạo cache key dựa trên tham số truy vấn
    const cacheKey = `movies:${page}:${limit}:${sort}:${order}`;
    
    // Kiểm tra cache
    const cachedData = await getCachedSearchResults(cacheKey);
    if (cachedData) {
      console.log(`Đã lấy dữ liệu phim từ cache với key: ${cacheKey}`);
      return cachedData;
    }
    
    // Tính offset cho phân trang
    const offset = (Number(page) - 1) * Number(limit);
    
    // Đảm bảo sort là một trường hợp lệ
    const validSortFields = ['title', 'rating', 'views', 'releaseYear', 'createdAt'];
    const sortField = validSortFields.includes(String(sort)) ? sort : 'createdAt';
    
    // Đảm bảo order là ASC hoặc DESC
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    // Thực hiện truy vấn với phân trang
    const { count, rows: movies } = await Movie.findAndCountAll({
      include: [Genre],
      order: [[String(sortField), sortOrder]],
      limit: Number(limit),
      offset: offset
    });

    // Tính tổng số trang
    const totalPages = Math.ceil(count / Number(limit));
    
    // Kết quả trả về
    const result = {
      movies,
      pagination: {
        total: count,
        totalPages,
        currentPage: Number(page),
        limit: Number(limit)
      }
    };
    
    // Lưu vào cache
    await cacheSearchResults(cacheKey, result, 300);
    
    return result;
  }

  /**
   * Lấy chi tiết phim theo ID
   */
  public async getMovieById(id: number) {
    // Kiểm tra cache
    const cachedMovie = await getCachedMovieData(id);
    if (cachedMovie) {
      console.log(`Đã lấy thông tin phim ID ${id} từ cache`);
      return cachedMovie;
    }
    
    // Không có trong cache, truy vấn database
    const movie = await Movie.findByPk(id, {
      include: [Genre]
    });
    
    if (movie) {
      // Lưu vào cache
      await cacheMovieData(id, movie, 3600); // cache 1 giờ
    }
    
    return movie;
  }

  /**
   * Tạo phim mới
   */
  public async createMovie(movieData: any) {
    let createdMovie = await Movie.create(movieData);
    
    // Nếu có genres, thêm vào bảng liên kết
    if (movieData.genreIds && movieData.genreIds.length > 0) {
      const genres = await Genre.findAll({
        where: {
          id: movieData.genreIds
        }
      });
      
      await createdMovie.$set('genres', genres);
    }
    
    // Lấy lại phim với thông tin genres
    return Movie.findByPk(createdMovie.id, {
      include: [Genre]
    });
  }

  /**
   * Cập nhật phim
   */
  public async updateMovie(id: number, movieData: any) {
    const movie = await Movie.findByPk(id);
    
    if (!movie) {
      return null;
    }
    
    // Cập nhật thông tin phim
    await movie.update(movieData);
    
    // Nếu có genres, cập nhật bảng liên kết
    if (movieData.genreIds && movieData.genreIds.length > 0) {
      const genres = await Genre.findAll({
        where: {
          id: movieData.genreIds
        }
      });
      
      await movie.$set('genres', genres);
    }
    
    // Lấy lại phim với thông tin đã cập nhật
    return Movie.findByPk(id, {
      include: [Genre]
    });
  }

  /**
   * Xóa phim
   */
  public async deleteMovie(id: number) {
    const movie = await Movie.findByPk(id);
    
    if (!movie) {
      return false;
    }
    
    await movie.destroy();
    return true;
  }
} 