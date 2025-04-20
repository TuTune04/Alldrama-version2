import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { CommentListResponse, AddCommentDto, UpdateCommentDto } from '@/types';
import { commentService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export const useComments = (movieId: string | number, initialPage: number = 1, initialLimit: number = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  // SWR key
  const key = movieId ? `${API_ENDPOINTS.COMMENTS.BY_MOVIE(movieId)}?page=${page}&limit=${limit}` : null;

  // Fetcher function for SWR
  const fetcher = useCallback(
    async (url: string) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }
    },
    []
  );

  // Use SWR hook
  const { data, error, isLoading, isValidating, mutate } = useSWR<CommentListResponse>(
    key,
    fetcher
  );

  // Add a new comment
  const addComment = useCallback(
    async (comment: string, parentId?: string) => {
      if (!movieId) {
        toast.error('Không thể thêm bình luận');
        return null;
      }

      try {
        const commentData: AddCommentDto = {
          movieId: String(movieId),
          comment,
          parentId: parentId || null,
        };

        const result = await fetch(API_ENDPOINTS.COMMENTS.CREATE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(commentData),
          credentials: 'include',
        });
        
        if (!result.ok) {
          throw new Error('Failed to add comment');
        }
        
        // Refresh comments
        await mutate();
        toast.success('Đã thêm bình luận');
        return await result.json();
      } catch (err) {
        toast.error('Không thể thêm bình luận');
        return null;
      }
    },
    [movieId, mutate]
  );

  // Update comment
  const updateComment = useCallback(
    async (commentId: string, comment: string) => {
      try {
        const updateData: UpdateCommentDto = { comment };
        const result = await fetch(API_ENDPOINTS.COMMENTS.UPDATE(commentId), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
          credentials: 'include',
        });
        
        if (!result.ok) {
          throw new Error('Failed to update comment');
        }
        
        // Refresh comments
        await mutate();
        toast.success('Đã cập nhật bình luận');
        return await result.json();
      } catch (err) {
        toast.error('Không thể cập nhật bình luận');
        return null;
      }
    },
    [mutate]
  );

  // Delete comment
  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        const result = await fetch(API_ENDPOINTS.COMMENTS.DELETE(commentId), {
          method: 'DELETE',
          credentials: 'include',
        });
        
        if (!result.ok) {
          throw new Error('Failed to delete comment');
        }
        
        // Refresh comments
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

  // Reply to comment
  const replyToComment = useCallback(
    async (parentId: string, comment: string) => {
      if (!movieId) {
        toast.error('Không thể thêm phản hồi');
        return null;
      }

      try {
        const commentData = {
          movieId: String(movieId),
          comment,
          parentId,
        };

        const result = await fetch(API_ENDPOINTS.COMMENTS.CREATE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(commentData),
          credentials: 'include',
        });
        
        if (!result.ok) {
          throw new Error('Failed to add reply');
        }
        
        // Refresh comments
        await mutate();
        toast.success('Đã thêm phản hồi');
        return await result.json();
      } catch (err) {
        toast.error('Không thể thêm phản hồi');
        return null;
      }
    },
    [movieId, mutate]
  );

  // Pagination
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