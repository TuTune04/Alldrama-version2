import { Logger } from '../utils/logger';
import { Request, Response } from 'express';
import { incrementMovieViews, incrementEpisodeViews } from '../services/redisService';
import { UserWatchHistory } from '../models/UserWatchHistory';
import { JwtPayload } from '../middleware/auth';

const logger = Logger.getLogger('viewController');

// Định nghĩa lại interface cho Request để có thể truy cập user
interface AuthRequest extends Request {
  user?: JwtPayload;
}

// API đếm lượt xem cho phim
export const incrementMovieView = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId } = req.params;
    const userId = req.user?.id;
    
    // Tăng lượt xem trong Redis
    await incrementMovieViews(Number(movieId));
    
    // Nếu người dùng đã đăng nhập, ghi lại lịch sử xem
    if (userId) {
      const { progress = 0, duration = 0 } = req.body;
      
      // Kiểm tra xem người dùng đã có lịch sử xem phim này chưa
      const existingHistory = await UserWatchHistory.findOne({
        where: {
          userId,
          movieId: Number(movieId),
          episodeId: null
        }
      });
      
      if (existingHistory) {
        // Cập nhật lịch sử hiện có
        existingHistory.progress = progress;
        existingHistory.duration = duration;
        
        // Đánh dấu hoàn thành nếu đã xem hơn 90% thời lượng
        if (progress / duration >= 0.9) {
          existingHistory.isCompleted = true;
        }
        
        await existingHistory.save();
      } else {
        // Tạo mới lịch sử xem
        await UserWatchHistory.create({
          userId,
          movieId: Number(movieId),
          progress,
          duration,
          isCompleted: progress / duration >= 0.9,
          watchedAt: new Date()
        });
      }
    }
    
    res.status(200).json({ success: true, message: 'Đã tăng lượt xem cho phim' });
  } catch (error) {
    logger.error('Lỗi khi tăng lượt xem cho phim:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tăng lượt xem cho phim' });
  }
};

// API đếm lượt xem cho tập phim
export const incrementEpisodeView = async (req: Request, res: Response): Promise<void> => {
  try {
    const { episodeId } = req.params;
    const { movieId } = req.body;
    const userId = req.user?.id;
    
    if (!movieId) {
      res.status(400).json({ success: false, message: 'Thiếu movieId' });
      return;
    }
    
    // Tăng lượt xem trong Redis
    await incrementEpisodeViews(Number(episodeId), Number(movieId));
    
    // Nếu người dùng đã đăng nhập, ghi lại lịch sử xem
    if (userId) {
      const { progress = 0, duration = 0 } = req.body;
      
      // Kiểm tra xem người dùng đã có lịch sử xem tập phim này chưa
      const existingHistory = await UserWatchHistory.findOne({
        where: {
          userId,
          movieId: Number(movieId),
          episodeId: Number(episodeId)
        }
      });
      
      if (existingHistory) {
        // Cập nhật lịch sử hiện có
        existingHistory.progress = progress;
        existingHistory.duration = duration;
        
        // Đánh dấu hoàn thành nếu đã xem hơn 90% thời lượng
        if (progress / duration >= 0.9) {
          existingHistory.isCompleted = true;
        }
        
        await existingHistory.save();
      } else {
        // Tạo mới lịch sử xem
        await UserWatchHistory.create({
          userId,
          movieId: Number(movieId),
          episodeId: Number(episodeId),
          progress,
          duration,
          isCompleted: progress / duration >= 0.9,
          watchedAt: new Date()
        });
      }
    }
    
    res.status(200).json({ success: true, message: 'Đã tăng lượt xem cho tập phim' });
  } catch (error) {
    logger.error('Lỗi khi tăng lượt xem cho tập phim:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tăng lượt xem cho tập phim' });
  }
}; 