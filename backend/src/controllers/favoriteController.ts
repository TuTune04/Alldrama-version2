import { Request, Response } from 'express';
import { getFavoriteService } from '../services';

// Thêm phim vào danh sách yêu thích
export const addFavorite = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để thực hiện chức năng này' });
    }

    const { movieId } = req.body;
    const favoriteService = getFavoriteService();
    
    try {
      const favorite = await favoriteService.addToFavorites(req.user.id, Number(movieId));
      
      return res.status(201).json({
        message: 'Đã thêm phim vào danh sách yêu thích',
        favorite
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Không tìm thấy phim') {
          return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Phim đã tồn tại trong danh sách yêu thích') {
          return res.status(400).json({ message: error.message });
        }
        if (error.message === 'Không tìm thấy người dùng') {
          return res.status(404).json({ message: error.message });
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
    return res.status(500).json({ message: 'Lỗi khi thêm phim vào danh sách yêu thích' });
  }
};

// Xóa phim khỏi danh sách yêu thích
export const removeFavorite = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để thực hiện chức năng này' });
    }

    const { movieId } = req.params;
    const favoriteService = getFavoriteService();
    
    try {
      await favoriteService.removeFromFavorites(req.user.id, Number(movieId));
      
      return res.status(200).json({ message: 'Đã xóa phim khỏi danh sách yêu thích' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Phim không tồn tại trong danh sách yêu thích') {
        return res.status(404).json({ message: 'Không tìm thấy phim trong danh sách yêu thích' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error removing favorite:', error);
    return res.status(500).json({ message: 'Lỗi khi xóa phim khỏi danh sách yêu thích' });
  }
};

// Lấy danh sách phim yêu thích của người dùng hiện tại
export const getCurrentUserFavorites = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để xem danh sách yêu thích' });
    }
    
    const favoriteService = getFavoriteService();
    const favorites = await favoriteService.getUserFavorites(req.user.id);
    
    return res.status(200).json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách phim yêu thích' });
  }
}; 