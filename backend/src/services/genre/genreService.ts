import { Genre } from '../../models/Genre';
import { Movie } from '../../models/Movie';
import { MoviesGenre } from '../../models/MoviesGenre';

/**
 * Service xử lý business logic cho Genre
 */
export class GenreService {
  /**
   * Lấy danh sách thể loại
   */
  public async getGenres() {
    const genres = await Genre.findAll({
      order: [['name', 'ASC']]
    });
    
    return genres;
  }

  /**
   * Lấy chi tiết thể loại
   */
  public async getGenreById(id: number) {
    const genre = await Genre.findByPk(id);
    
    if (!genre) {
      throw new Error('Không tìm thấy thể loại');
    }
    
    return genre;
  }

  /**
   * Tạo thể loại mới
   */
  public async createGenre(name: string) {
    // Kiểm tra tên thể loại đã tồn tại chưa
    const existingGenre = await Genre.findOne({
      where: { name }
    });
    
    if (existingGenre) {
      throw new Error('Thể loại này đã tồn tại');
    }
    
    // Tạo thể loại mới
    const newGenre = await Genre.create({ name });
    
    return newGenre;
  }

  /**
   * Cập nhật thể loại
   */
  public async updateGenre(id: number, name: string) {
    const genre = await Genre.findByPk(id);
    
    if (!genre) {
      throw new Error('Không tìm thấy thể loại');
    }
    
    // Kiểm tra tên thể loại đã tồn tại chưa
    if (name && name !== genre.name) {
      const existingGenre = await Genre.findOne({
        where: { name }
      });
      
      if (existingGenre) {
        throw new Error('Thể loại này đã tồn tại');
      }
    }
    
    // Cập nhật thông tin
    await genre.update({ name });
    
    return genre;
  }

  /**
   * Xóa thể loại
   */
  public async deleteGenre(id: number) {
    const genre = await Genre.findByPk(id);
    
    if (!genre) {
      throw new Error('Không tìm thấy thể loại');
    }
    
    // Kiểm tra xem thể loại có đang được sử dụng không
    const moviesCount = await MoviesGenre.count({
      where: { genreId: id }
    });
    
    if (moviesCount > 0) {
      throw new Error(`Không thể xóa thể loại này vì đang được sử dụng bởi ${moviesCount} phim`);
    }
    
    // Xóa thể loại
    await genre.destroy();
    
    return true;
  }

  /**
   * Lấy danh sách phim theo thể loại
   */
  public async getMoviesByGenre(id: number) {
    const genre = await Genre.findByPk(id);
    
    if (!genre) {
      throw new Error('Không tìm thấy thể loại');
    }
    
    const movies = await Movie.findAll({
      include: [
        {
          model: Genre,
          where: { id },
          through: { attributes: [] }
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return {
      genre,
      movies
    };
  }
} 