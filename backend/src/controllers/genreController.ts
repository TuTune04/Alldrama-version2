import { Request, Response } from 'express';
import { getGenreService } from '../services';

// Lấy danh sách thể loại
export const getGenres = async (req: Request, res: Response) => {
  try {
    const genreService = getGenreService();
    const genres = await genreService.getGenres();
    
    return res.status(200).json(genres);
  } catch (error) {
    console.error('Error fetching genres:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách thể loại' });
  }
};

// Lấy chi tiết thể loại
export const getGenreById = async (req: Request, res: Response) => {
  try {
    const genreService = getGenreService();
    const { id } = req.params;
    
    const genre = await genreService.getGenreById(Number(id));
    
    return res.status(200).json(genre);
  } catch (error) {
    console.error('Error fetching genre:', error);
    if (error instanceof Error && error.message === 'Không tìm thấy thể loại') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Lỗi khi lấy thông tin thể loại' });
  }
};

// Tạo thể loại mới
export const createGenre = async (req: Request, res: Response) => {
  try {
    const genreService = getGenreService();
    const { name } = req.body;
    
    const newGenre = await genreService.createGenre(name);
    
    return res.status(201).json({
      message: 'Tạo thể loại thành công',
      genre: newGenre
    });
  } catch (error) {
    console.error('Error creating genre:', error);
    if (error instanceof Error && error.message === 'Thể loại này đã tồn tại') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Lỗi khi tạo thể loại mới' });
  }
};

// Cập nhật thể loại
export const updateGenre = async (req: Request, res: Response) => {
  try {
    const genreService = getGenreService();
    const { id } = req.params;
    const { name } = req.body;
    
    const updatedGenre = await genreService.updateGenre(Number(id), name);
    
    return res.status(200).json({
      message: 'Cập nhật thể loại thành công',
      genre: updatedGenre
    });
  } catch (error) {
    console.error('Error updating genre:', error);
    if (error instanceof Error) {
      if (error.message === 'Không tìm thấy thể loại') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Thể loại này đã tồn tại') {
        return res.status(400).json({ message: error.message });
      }
    }
    return res.status(500).json({ message: 'Lỗi khi cập nhật thể loại' });
  }
};

// Xóa thể loại
export const deleteGenre = async (req: Request, res: Response) => {
  try {
    const genreService = getGenreService();
    const { id } = req.params;
    
    await genreService.deleteGenre(Number(id));
    
    return res.status(200).json({ message: 'Xóa thể loại thành công' });
  } catch (error) {
    console.error('Error deleting genre:', error);
    if (error instanceof Error) {
      if (error.message === 'Không tìm thấy thể loại') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('Không thể xóa thể loại này vì đang được sử dụng')) {
        return res.status(400).json({ 
          message: error.message
        });
      }
    }
    return res.status(500).json({ message: 'Lỗi khi xóa thể loại' });
  }
};

// Lấy danh sách phim theo thể loại
export const getMoviesByGenre = async (req: Request, res: Response) => {
  try {
    const genreService = getGenreService();
    const { id } = req.params;
    
    const result = await genreService.getMoviesByGenre(Number(id));
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    if (error instanceof Error && error.message === 'Không tìm thấy thể loại') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách phim theo thể loại' });
  }
}; 