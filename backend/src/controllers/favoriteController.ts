import { Request, Response } from 'express';
import { UserFavorite } from '../models/UserFavorite';
import { Movie } from '../models/Movie';
import { Genre } from '../models/Genre';

// Thêm phim vào danh sách yêu thích
export const addFavorite = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để thực hiện chức năng này' });
    }

    const { movieId } = req.body;
    
    // Kiểm tra phim có tồn tại không
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }
    
    // Kiểm tra xem đã thêm vào danh sách yêu thích chưa
    const existingFavorite = await UserFavorite.findOne({
      where: {
        userId: req.user.id,
        movieId
      }
    });
    
    if (existingFavorite) {
      return res.status(400).json({ message: 'Phim đã có trong danh sách yêu thích' });
    }
    
    // Thêm vào danh sách yêu thích
    const favorite = await UserFavorite.create({
      userId: req.user.id,
      movieId,
      favoritedAt: new Date()
    });
    
    // Lấy thông tin chi tiết
    const favoriteWithDetails = await UserFavorite.findByPk(favorite.id, {
      include: [
        {
          model: Movie,
          include: [Genre]
        }
      ]
    });
    
    return res.status(201).json({
      message: 'Đã thêm phim vào danh sách yêu thích',
      favorite: favoriteWithDetails
    });
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
    
    // Tìm mục yêu thích
    const favorite = await UserFavorite.findOne({
      where: {
        userId: req.user.id,
        movieId
      }
    });
    
    if (!favorite) {
      return res.status(404).json({ message: 'Không tìm thấy phim trong danh sách yêu thích' });
    }
    
    // Xóa khỏi danh sách yêu thích
    await favorite.destroy();
    
    return res.status(200).json({ message: 'Đã xóa phim khỏi danh sách yêu thích' });
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
    
    const favorites = await UserFavorite.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Movie,
          include: [Genre]
        }
      ],
      order: [['favoritedAt', 'DESC']]
    });
    
    return res.status(200).json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách phim yêu thích' });
  }
}; 