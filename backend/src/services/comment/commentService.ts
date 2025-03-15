import { MovieComment } from '../../models/MovieComment';
import { Movie } from '../../models/Movie';
import { User } from '../../models/User';
import { Logger } from '../../utils/logger';

const logger = Logger.getLogger('CommentService');

/**
 * Interface cho tham số phân trang và sắp xếp
 */
export interface ListCommentsParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

/**
 * Interface cho dữ liệu bình luận
 */
export interface CommentData {
  movieId: number;
  userId: number;
  userName: string;
  comment: string;
}

/**
 * Service quản lý bình luận phim
 */
export class CommentService {
  /**
   * Lấy danh sách bình luận của một phim
   */
  async getMovieComments(movieId: number, params: ListCommentsParams = {}): Promise<MovieComment[]> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sort = 'createdAt', 
        order = 'DESC' 
      } = params;
      
      const offset = (page - 1) * limit;
      
      const comments = await MovieComment.findAll({
        where: { movieId },
        limit,
        offset,
        order: [[sort, order]],
        include: [
          {
            model: User,
            attributes: ['id', 'full_name']
          }
        ]
      });
      
      return comments;
    } catch (error) {
      logger.error('Error fetching movie comments:', error);
      throw new Error('Lỗi khi lấy danh sách bình luận');
    }
  }

  /**
   * Lấy chi tiết một bình luận
   */
  async getCommentById(id: number): Promise<MovieComment> {
    try {
      const comment = await MovieComment.findByPk(id, {
        include: [
          {
            model: User,
            attributes: ['id', 'full_name']
          },
          {
            model: Movie,
            attributes: ['id', 'title']
          }
        ]
      });
      
      if (!comment) {
        throw new Error('Không tìm thấy bình luận');
      }
      
      return comment;
    } catch (error) {
      logger.error('Error fetching comment details:', error);
      throw error;
    }
  }

  /**
   * Tạo bình luận mới
   */
  async createComment(data: CommentData): Promise<MovieComment> {
    try {
      // Kiểm tra phim tồn tại
      const movie = await Movie.findByPk(data.movieId);
      if (!movie) {
        throw new Error('Không tìm thấy phim');
      }
      
      // Kiểm tra người dùng tồn tại
      const user = await User.findByPk(data.userId);
      if (!user) {
        throw new Error('Không tìm thấy người dùng');
      }
      
      // Tạo bình luận mới
      const comment = await MovieComment.create({
        movieId: data.movieId,
        userId: data.userId,
        userName: data.userName,
        comment: data.comment
      });
      
      return comment;
    } catch (error) {
      logger.error('Error creating comment:', error);
      throw error;
    }
  }

  /**
   * Cập nhật bình luận
   */
  async updateComment(id: number, userId: number, commentText: string): Promise<MovieComment> {
    try {
      const comment = await MovieComment.findByPk(id);
      
      if (!comment) {
        throw new Error('Không tìm thấy bình luận');
      }
      
      // Kiểm tra quyền: chỉ chủ bình luận mới được sửa
      if (comment.userId !== userId) {
        throw new Error('Không có quyền sửa bình luận này');
      }
      
      // Cập nhật bình luận
      comment.comment = commentText;
      await comment.save();
      
      return comment;
    } catch (error) {
      logger.error('Error updating comment:', error);
      throw error;
    }
  }

  /**
   * Xóa bình luận
   */
  async deleteComment(id: number, userId: number, isAdmin: boolean): Promise<void> {
    try {
      const comment = await MovieComment.findByPk(id);
      
      if (!comment) {
        throw new Error('Không tìm thấy bình luận');
      }
      
      // Kiểm tra quyền: admin hoặc chủ bình luận mới được xóa
      if (!isAdmin && comment.userId !== userId) {
        throw new Error('Không có quyền xóa bình luận này');
      }
      
      // Xóa bình luận
      await comment.destroy();
    } catch (error) {
      logger.error('Error deleting comment:', error);
      throw error;
    }
  }
} 