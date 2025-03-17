import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { CommentListResponse, AddCommentDto, UpdateCommentDto } from '@/types';
import { commentService } from '@/lib/api';
import { toast } from 'react-hot-toast';

export const useComments = (movieId: string, initialPage: number = 1, initialLimit: number = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  // SWR key
  const key = movieId ? `comments/movie/${movieId}?page=${page}&limit=${limit}` : null;

  // Fetcher function cho SWR
  const fetcher = useCallback(
    async (key: string) => {
      const match = key.match(/comments\/movie\/(.+?)\?/);
      if (!match) throw new Error('Invalid key format');
      
      const movieId = match[1];
      const url = new URL(key.replace(/^comments\/movie\/[^?]+/, ''), 'http://example.com');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');

      return await commentService.getCommentsByMovieId(movieId, page, limit);
    },
    []
  );

  // Sử dụng SWR hook
  const { data, error, isLoading, isValidating, mutate } = useSWR<CommentListResponse>(
    key,
    fetcher
  );

  // Thêm bình luận mới
  const addComment = useCallback(
    async (content: string, parentId?: string) => {
      if (!movieId) {
        toast.error('Không thể thêm bình luận');
        return null;
      }

      try {
        const commentData: AddCommentDto = {
          content,
          movieId,
          parentId: parentId || null,
        };

        const result = await commentService.addComment(commentData);
        // Refresh bình luận
        await mutate();
        toast.success('Đã thêm bình luận');
        return result;
      } catch (err) {
        toast.error('Không thể thêm bình luận');
        return null;
      }
    },
    [movieId, mutate]
  );

  // Cập nhật bình luận
  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      try {
        const updateData: UpdateCommentDto = { content };
        const result = await commentService.updateComment(commentId, updateData);
        // Refresh bình luận
        await mutate();
        toast.success('Đã cập nhật bình luận');
        return result;
      } catch (err) {
        toast.error('Không thể cập nhật bình luận');
        return null;
      }
    },
    [mutate]
  );

  // Xóa bình luận
  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        await commentService.deleteComment(commentId);
        // Refresh bình luận
        await mutate();
        toast.success('Đã xóa bình luận');
        return true;
      } catch (err) {
        toast.error('Không thể xóa bình luận');
        return false;
      }
    },
    [mutate]
  );

  // Phản hồi bình luận
  const replyToComment = useCallback(
    async (parentId: string, content: string) => {
      if (!movieId) {
        toast.error('Không thể thêm phản hồi');
        return null;
      }

      try {
        const result = await commentService.addReply(parentId, movieId, content);
        // Refresh bình luận
        await mutate();
        toast.success('Đã thêm phản hồi');
        return result;
      } catch (err) {
        toast.error('Không thể thêm phản hồi');
        return null;
      }
    },
    [movieId, mutate]
  );

  // Phân trang
  const goToPage = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    []
  );

  return {
    comments: data?.comments || [],
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || page,
    totalComments: data?.totalComments || 0,
    loading: isLoading,
    isValidating,
    error,
    addComment,
    updateComment,
    deleteComment,
    replyToComment,
    goToPage,
    setLimit,
    refreshComments: mutate,
  };
}; 