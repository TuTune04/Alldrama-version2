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

    const { movieId, episodeId, progress = 0, duration = 0 } = req.body;
    
    // Kiểm tra phim có tồn tại không
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }
    
    // Thiết lập biến để xác định có tăng lượt xem hay không
    let shouldIncreaseViews = false;
    
    // Kiểm tra tập phim nếu có
    let episode = null;
    if (episodeId) {
      episode = await Episode.findOne({
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
        userId: req.user.id,
        movieId,
        ...(episodeId ? { episodeId } : {})
      }
    });
    
    // Xác định có tăng lượt xem hay không
    // Nếu là nội dung mới hoặc đã xem quá 1 giờ kể từ lần trước
    if (!existingHistory) {
      shouldIncreaseViews = true;
    } else {
      const lastWatchedTime = new Date(existingHistory.watchedAt).getTime();
      const currentTime = new Date().getTime();
      const oneHourInMs = 60 * 60 * 1000;
      
      // Nếu đã qua 1 giờ kể từ lần xem trước
      if (currentTime - lastWatchedTime > oneHourInMs) {
        shouldIncreaseViews = true;
      }
      
      // Hoặc nếu tiến độ xem đã vượt qua 70% thời lượng (chỉ tính cho lần đầu tiên)
      if (duration > 0 && progress / duration >= 0.7 && !existingHistory.isCompleted) {
        shouldIncreaseViews = true;
      }
    }
    
    // Nếu đã có, cập nhật thời gian xem và tiến độ
    let historyRecord;
    
    if (existingHistory) {
      // Cập nhật thông tin
      await existingHistory.update({
        watchedAt: new Date(),
        progress: progress || existingHistory.progress,
        duration: duration || existingHistory.duration,
        isCompleted: progress / duration >= 0.9 // Đánh dấu là đã xem hoàn thành nếu > 90%
      });
      
      historyRecord = existingHistory;
    } else {
      // Thêm mới vào lịch sử xem
      historyRecord = await UserWatchHistory.create({
        userId: req.user.id,
        movieId,
        episodeId,
        watchedAt: new Date(),
        progress,
        duration,
        isCompleted: progress / duration >= 0.9
      });
    }
    
    // Tăng lượt xem nếu cần
    if (shouldIncreaseViews) {
      // Tăng lượt xem cho phim
      await movie.increment('views', { by: 1 });
      
      // Tăng lượt xem cho tập phim nếu có
      if (episode) {
        await episode.increment('views', { by: 1 });
      }
    }
    
    // Lấy thông tin chi tiết
    const historyWithDetails = await UserWatchHistory.findByPk(historyRecord.id, {
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
    
    return res.status(existingHistory ? 200 : 201).json({
      message: existingHistory ? 'Đã cập nhật lịch sử xem' : 'Đã thêm vào lịch sử xem',
      watchHistory: historyWithDetails,
      viewIncreased: shouldIncreaseViews
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
        userId: req.user.id
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
      where: { userId: req.user.id },
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