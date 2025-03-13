import { Request, Response } from 'express';
import { getWatchHistoryService } from '../services';

// Thêm vào lịch sử xem
export const addWatchHistory = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để thực hiện chức năng này' });
    }

    const { movieId, episodeId, progress = 0, duration = 0 } = req.body;
    const watchHistoryService = getWatchHistoryService();
    
    try {
      const result = await watchHistoryService.addToWatchHistory(req.user.id, {
        movieId: Number(movieId),
        episodeId: episodeId ? Number(episodeId) : undefined,
        progress,
        duration
      });
      
      return res.status(200).json({
        message: 'Đã thêm/cập nhật lịch sử xem',
        watchHistory: result.watchHistory,
        viewIncreased: result.viewIncreased
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Không tìm thấy phim') {
          return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Không tìm thấy tập phim') {
          return res.status(404).json({ message: error.message });
        }
      }
      throw error;
    }
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
    const watchHistoryService = getWatchHistoryService();
    
    try {
      await watchHistoryService.removeFromWatchHistory(Number(id), req.user.id);
      return res.status(200).json({ message: 'Đã xóa khỏi lịch sử xem' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Không tìm thấy mục trong lịch sử xem') {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
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
    
    const watchHistoryService = getWatchHistoryService();
    const watchHistory = await watchHistoryService.getUserWatchHistory(req.user.id);
    
    return res.status(200).json(watchHistory);
  } catch (error) {
    console.error('Error fetching watch history:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy lịch sử xem' });
  }
}; 