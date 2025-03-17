import { Comment, CommentListResponse, AddCommentDto, UpdateCommentDto } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export const commentService = {
  /**
   * Lấy bình luận cho phim
   * @param movieId ID của phim
   * @param page Số trang
   * @param limit Số lượng mỗi trang
   */
  async getCommentsByMovieId(
    movieId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<CommentListResponse> {
    return apiClient.get<CommentListResponse>(API_ENDPOINTS.COMMENTS.LIST_BY_MOVIE(movieId), {
      params: { page, limit },
    });
  },

  /**
   * Thêm bình luận mới
   * @param data Dữ liệu bình luận
   */
  async addComment(data: AddCommentDto): Promise<Comment> {
    return apiClient.post<Comment>(API_ENDPOINTS.COMMENTS.CREATE, data);
  },

  /**
   * Cập nhật bình luận
   * @param id ID của bình luận
   * @param data Dữ liệu cập nhật
   */
  async updateComment(id: string, data: UpdateCommentDto): Promise<Comment> {
    return apiClient.put<Comment>(API_ENDPOINTS.COMMENTS.UPDATE(id), data);
  },

  /**
   * Xóa bình luận
   * @param id ID của bình luận
   */
  async deleteComment(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.COMMENTS.DELETE(id));
  },

  /**
   * Thêm phản hồi cho bình luận
   * @param parentId ID của bình luận gốc
   * @param movieId ID của phim
   * @param content Nội dung phản hồi
   */
  async addReply(parentId: string, movieId: string, content: string): Promise<Comment> {
    const data: AddCommentDto = {
      content,
      movieId,
      parentId,
    };
    return this.addComment(data);
  },
}; 