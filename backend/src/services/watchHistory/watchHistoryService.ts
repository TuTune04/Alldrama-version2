import { UserWatchHistory } from '../../models/UserWatchHistory';
import { Movie } from '../../models/Movie';
import { Episode } from '../../models/Episode';
import { Genre } from '../../models/Genre';
import { User } from '../../models/User';

/**
 * Interface cho watch history response
 */
export interface WatchHistoryResponse {
  id: number;
  userId: number;
  movieId?: number;
  episodeId?: number;
  watchedAt: Date;
  progress?: number;
  duration?: number;
  isCompleted?: boolean;
  movie?: Movie;
  episode?: Episode;
}

/**
 * Dữ liệu để thêm lịch sử xem
 */
export interface AddWatchHistoryData {
  movieId: number;
  episodeId?: number;
  progress?: number;
  duration?: number;
}

/**
 * Service xử lý business logic cho lịch sử xem phim của người dùng
 */
export class WatchHistoryService {
  /**
   * Lấy lịch sử xem phim của người dùng
   */
  public async getUserWatchHistory(userId: number): Promise<WatchHistoryResponse[]> {
    // Kiểm tra tồn tại của user
    const userExists = await User.findByPk(userId);
    if (!userExists) {
      throw new Error('Không tìm thấy người dùng');
    }
    
    const watchHistory = await UserWatchHistory.findAll({
      where: { userId },
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
    
    return watchHistory as unknown as WatchHistoryResponse[];
  }

  /**
   * Thêm bản ghi vào lịch sử xem phim
   */
  public async addToWatchHistory(
    userId: number, 
    data: AddWatchHistoryData
  ): Promise<{ watchHistory: WatchHistoryResponse; viewIncreased: boolean }> {
    // Đặt giá trị mặc định
    const progress = data.progress || 0;
    const duration = data.duration || 0;

    // Kiểm tra phim có tồn tại không
    const movie = await Movie.findByPk(data.movieId);
    if (!movie) {
      throw new Error('Không tìm thấy phim');
    }
    
    // Thiết lập biến để xác định có tăng lượt xem hay không
    let shouldIncreaseViews = false;
    
    // Kiểm tra tập phim nếu có
    let episode = null;
    if (data.episodeId) {
      episode = await Episode.findOne({
        where: {
          id: data.episodeId,
          movieId: data.movieId
        }
      });
      
      if (!episode) {
        throw new Error('Không tìm thấy tập phim');
      }
    }
    
    // Kiểm tra xem đã có trong lịch sử xem chưa
    const existingHistory = await UserWatchHistory.findOne({
      where: {
        userId,
        movieId: data.movieId,
        ...(data.episodeId ? { episodeId: data.episodeId } : {})
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
      if (duration > 0 && progress / duration >= 0.7 && existingHistory.isCompleted === false) {
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
        isCompleted: duration > 0 ? progress / duration >= 0.9 : existingHistory.isCompleted // Đánh dấu là đã xem hoàn thành nếu > 90%
      });
      
      historyRecord = existingHistory;
    } else {
      // Thêm mới vào lịch sử xem
      historyRecord = await UserWatchHistory.create({
        userId,
        movieId: data.movieId,
        episodeId: data.episodeId,
        watchedAt: new Date(),
        progress,
        duration,
        isCompleted: duration > 0 ? progress / duration >= 0.9 : false
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
    
    return {
      watchHistory: historyWithDetails as unknown as WatchHistoryResponse,
      viewIncreased: shouldIncreaseViews
    };
  }

  /**
   * Xóa một bản ghi khỏi lịch sử xem phim
   */
  public async removeFromWatchHistory(id: number, userId: number): Promise<boolean> {
    // Kiểm tra tồn tại của bản ghi và quyền sở hữu
    const watchHistory = await UserWatchHistory.findOne({
      where: { id, userId }
    });

    if (!watchHistory) {
      throw new Error('Không tìm thấy mục trong lịch sử xem');
    }

    // Xóa khỏi lịch sử
    await watchHistory.destroy();

    return true;
  }

  /**
   * Xóa tất cả lịch sử xem phim của người dùng
   */
  public async clearWatchHistory(userId: number): Promise<boolean> {
    // Kiểm tra tồn tại của user
    const userExists = await User.findByPk(userId);
    if (!userExists) {
      throw new Error('Không tìm thấy người dùng');
    }

    // Xóa tất cả lịch sử xem phim
    await UserWatchHistory.destroy({
      where: { userId }
    });

    return true;
  }
} 