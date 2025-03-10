import { Request, Response } from 'express';
import { UserWatchHistory } from '../models/UserWatchHistory';
import { Movie } from '../models/Movie';
import { Episode } from '../models/Episode';
import { Genre } from '../models/Genre';

// Thêm vào lịch sử xem
export const addWatchHistory = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để thực hiện chức năng này' });
    }

    const { movieId, episodeId } = req.body;
    
    // Kiểm tra phim có tồn tại không
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }
    
    // Kiểm tra tập phim nếu có
    if (episodeId) {
      const episode = await Episode.findOne({
        where: {
          id: episodeId,
          movieId
        }
      });
      
      if (!episode) {
        return res.status(404).json({ message: 'Không tìm thấy tập phim' });
      }
    }
    
    // Kiểm tra xem đã có trong lịch sử xem chưa
    const existingHistory = await UserWatchHistory.findOne({
      where: {
        userId: req.user.userId,
        movieId,
        ...(episodeId ? { episodeId } : {})
      }
    });
    
    // Nếu đã có, cập nhật thời gian xem
    if (existingHistory) {
      await existingHistory.update({
        watchedAt: new Date()
      });
      
      // Lấy thông tin chi tiết
      const historyWithDetails = await UserWatchHistory.findByPk(existingHistory.id, {
        include: [
          {
            model: Movie,
            include: [Genre]
          },
          {
            model: Episode
          }
        ]
      });
      
      return res.status(200).json({
        message: 'Đã cập nhật lịch sử xem',
        watchHistory: historyWithDetails
      });
    }
    
    // Nếu chưa có, thêm mới vào lịch sử xem
    const watchHistory = await UserWatchHistory.create({
      userId: req.user.userId,
      movieId,
      episodeId,
      watchedAt: new Date()
    });
    
    // Lấy thông tin chi tiết
    const historyWithDetails = await UserWatchHistory.findByPk(watchHistory.id, {
      include: [
        {
          model: Movie,
          include: [Genre]
        },
        {
          model: Episode
        }
      ]
    });
    
    // Tăng lượt xem cho phim
    await movie.increment('views', { by: 1 });
    
    // Tăng lượt xem cho tập phim nếu có
    if (episodeId) {
      const episode = await Episode.findByPk(episodeId);
      if (episode) {
        await episode.increment('views', { by: 1 });
      }
    }
    
    return res.status(201).json({
      message: 'Đã thêm vào lịch sử xem',
      watchHistory: historyWithDetails
    });
  } catch (error) {
    console.error('Error adding watch history:', error);
    return res.status(500).json({ message: 'Lỗi khi thêm vào lịch sử xem' });
  }
};

// Xóa khỏi lịch sử xem
export const removeWatchHistory = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để thực hiện chức năng này' });
    }

    const { id } = req.params;
    
    // Tìm mục lịch sử xem
    const watchHistory = await UserWatchHistory.findOne({
      where: {
        id,
        userId: req.user.userId
      }
    });
    
    if (!watchHistory) {
      return res.status(404).json({ message: 'Không tìm thấy mục trong lịch sử xem' });
    }
    
    // Xóa khỏi lịch sử xem
    await watchHistory.destroy();
    
    return res.status(200).json({ message: 'Đã xóa khỏi lịch sử xem' });
  } catch (error) {
    console.error('Error removing watch history:', error);
    return res.status(500).json({ message: 'Lỗi khi xóa khỏi lịch sử xem' });
  }
};

// Lấy lịch sử xem của người dùng hiện tại
export const getCurrentUserWatchHistory = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để xem lịch sử xem' });
    }
    
    const watchHistory = await UserWatchHistory.findAll({
      where: { userId: req.user.userId },
      include: [
        {
          model: Movie,
          include: [Genre]
        },
        {
          model: Episode
        }
      ],
      order: [['watchedAt', 'DESC']]
    });
    
    return res.status(200).json(watchHistory);
  } catch (error) {
    console.error('Error fetching watch history:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy lịch sử xem' });
  }
}; 