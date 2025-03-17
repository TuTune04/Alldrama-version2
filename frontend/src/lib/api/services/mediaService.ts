import { MediaUploadResponse } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export const mediaService = {
  /**
   * Tải lên ảnh poster cho phim
   * @param movieId ID của phim
   * @param file File ảnh cần tải lên
   */
  async uploadPoster(movieId: string, file: File): Promise<{ posterUrl: string }> {
    const formData = new FormData();
    formData.append('poster', file);

    return apiClient.post<{ posterUrl: string }>(API_ENDPOINTS.MEDIA.UPLOAD_POSTER(movieId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Tải lên ảnh backdrop cho phim
   * @param movieId ID của phim
   * @param file File ảnh cần tải lên
   */
  async uploadBackdrop(movieId: string, file: File): Promise<{ backdropUrl: string }> {
    const formData = new FormData();
    formData.append('backdrop', file);

    return apiClient.post<{ backdropUrl: string }>(API_ENDPOINTS.MEDIA.UPLOAD_BACKDROP(movieId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Tải lên trailer cho phim
   * @param movieId ID của phim
   * @param file File video trailer
   */
  async uploadTrailer(movieId: string, file: File): Promise<{ trailerUrl: string }> {
    const formData = new FormData();
    formData.append('trailer', file);

    return apiClient.post<{ trailerUrl: string }>(API_ENDPOINTS.MEDIA.UPLOAD_TRAILER(movieId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Tải lên video cho tập phim
   * @param movieId ID của phim
   * @param episodeId ID của tập phim
   * @param file File video
   */
  async uploadEpisodeVideo(
    movieId: string, 
    episodeId: string, 
    file: File
  ): Promise<{ videoUrl: string }> {
    const formData = new FormData();
    formData.append('video', file);

    return apiClient.post<{ videoUrl: string }>(
      API_ENDPOINTS.MEDIA.UPLOAD_EPISODE_VIDEO(movieId, episodeId), 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  /**
   * Tạo Presigned URL để upload trực tiếp
   * @param fileName Tên file
   * @param contentType Loại nội dung
   * @param folder Thư mục
   */
  async getPresignedUrl(
    fileName: string, 
    contentType: string, 
    folder: string
  ): Promise<{
    url: string;
    fields: Record<string, string>;
  }> {
    return apiClient.post(API_ENDPOINTS.MEDIA.PRESIGNED_URL, {
      fileName,
      contentType,
      folder
    });
  },

  /**
   * Xóa media của phim
   * @param movieId ID của phim
   * @param mediaType Loại media (poster, backdrop, trailer)
   */
  async deleteMedia(
    movieId: string, 
    mediaType: 'poster' | 'backdrop' | 'trailer'
  ): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      API_ENDPOINTS.MEDIA.DELETE_MEDIA(movieId, mediaType)
    );
  },

  /**
   * Xóa tập phim và media liên quan
   * @param movieId ID của phim
   * @param episodeId ID của tập phim
   */
  async deleteEpisodeWithMedia(
    movieId: string, 
    episodeId: string
  ): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      API_ENDPOINTS.MEDIA.DELETE_EPISODE(movieId, episodeId)
    );
  },

  /**
   * Xóa phim và tất cả media liên quan
   * @param movieId ID của phim
   */
  async deleteMovieWithMedia(movieId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      API_ENDPOINTS.MEDIA.DELETE_MOVIE(movieId)
    );
  },

  /**
   * Tạo URL ảnh đầy đủ từ đường dẫn tương đối
   * @param path Đường dẫn tương đối của ảnh
   */
  getImageUrl(path?: string): string {
    if (!path) {
      return '/images/placeholder.jpg'; // Ảnh mặc định
    }

    if (path.startsWith('http')) {
      return path; // Đã là URL đầy đủ
    }

    // URL base của CDN hoặc API
    const baseUrl = process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_API_URL;
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  },
}; 