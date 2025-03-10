import { Request, Response } from 'express';
import { Genre } from '../models/Genre';
import { Movie } from '../models/Movie';
import { MoviesGenre } from '../models/MoviesGenre';

// Lấy danh sách thể loại
export const getGenres = async (req: Request, res: Response) => {
  try {
    const genres = await Genre.findAll({
      order: [['name', 'ASC']]
    });
    
    return res.status(200).json(genres);
  } catch (error) {
    console.error('Error fetching genres:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách thể loại' });
  }
};

// Lấy chi tiết thể loại
export const getGenreById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const genre = await Genre.findByPk(id);
    
    if (!genre) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }
    
    return res.status(200).json(genre);
  } catch (error) {
    console.error('Error fetching genre:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy thông tin thể loại' });
  }
};

// Tạo thể loại mới
export const createGenre = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    // Kiểm tra tên thể loại đã tồn tại chưa
    const existingGenre = await Genre.findOne({
      where: { name }
    });
    
    if (existingGenre) {
      return res.status(400).json({ message: 'Thể loại này đã tồn tại' });
    }
    
    // Tạo thể loại mới
    const newGenre = await Genre.create({ name });
    
    return res.status(201).json({
      message: 'Tạo thể loại thành công',
      genre: newGenre
    });
  } catch (error) {
    console.error('Error creating genre:', error);
    return res.status(500).json({ message: 'Lỗi khi tạo thể loại mới' });
  }
};

// Cập nhật thể loại
export const updateGenre = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const genre = await Genre.findByPk(id);
    
    if (!genre) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }
    
    // Kiểm tra tên thể loại đã tồn tại chưa
    if (name && name !== genre.name) {
      const existingGenre = await Genre.findOne({
        where: { name }
      });
      
      if (existingGenre) {
        return res.status(400).json({ message: 'Thể loại này đã tồn tại' });
      }
    }
    
    // Cập nhật thông tin
    await genre.update({ name });
    
    return res.status(200).json({
      message: 'Cập nhật thể loại thành công',
      genre
    });
  } catch (error) {
    console.error('Error updating genre:', error);
    return res.status(500).json({ message: 'Lỗi khi cập nhật thể loại' });
  }
};

// Xóa thể loại
export const deleteGenre = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const genre = await Genre.findByPk(id);
    
    if (!genre) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }
    
    // Kiểm tra xem thể loại có đang được sử dụng không
    const moviesCount = await MoviesGenre.count({
      where: { genreId: id }
    });
    
    if (moviesCount > 0) {
      return res.status(400).json({ 
        message: 'Không thể xóa thể loại này vì đang được sử dụng bởi một số phim',
        moviesCount
      });
    }
    
    // Xóa thể loại
    await genre.destroy();
    
    return res.status(200).json({ message: 'Xóa thể loại thành công' });
  } catch (error) {
    console.error('Error deleting genre:', error);
    return res.status(500).json({ message: 'Lỗi khi xóa thể loại' });
  }
};

// Lấy danh sách phim theo thể loại
export const getMoviesByGenre = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const genre = await Genre.findByPk(id);
    
    if (!genre) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
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
    
    return res.status(200).json({
      genre,
      movies
    });
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách phim theo thể loại' });
  }
}; 