import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export const mediaService = {
  /**
   * Upload hình ảnh poster cho phim
   * @param movieId ID của phim
   * @param file File hình ảnh
   */
  async uploadPoster(
    movieId: string | number,
    file: File
  ): Promise<{ url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('movieId', String(movieId));

    return apiClient.post<{ url: string; message: string }>(
      API_ENDPOINTS.MEDIA.POSTER,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  /**
   * Upload hình nền (backdrop) cho phim
   * @param movieId ID của phim
   * @param file File hình ảnh
   */
  async uploadBackdrop(
    movieId: string | number,
    file: File
  ): Promise<{ url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('movieId', String(movieId));

    return apiClient.post<{ url: string; message: string }>(
      API_ENDPOINTS.MEDIA.BACKDROP,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  /**
   * Upload video cho tập phim
   * @param movieId ID của phim
   * @param episodeId ID của tập phim
   * @param file File video
   */
  async uploadEpisodeVideo(
    movieId: string | number,
    episodeId: string | number,
    file: File
  ): Promise<{
    originalUrl: string;
    thumbnailUrl: string;
    processingStatus: string;
    message: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('movieId', String(movieId));
    formData.append('episodeId', String(episodeId));

    return apiClient.post<{
      originalUrl: string;
      thumbnailUrl: string;
      processingStatus: string;
      message: string;
    }>(API_ENDPOINTS.MEDIA.VIDEO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Upload hình thumbnail cho tập phim
   * @param episodeId ID của tập phim
   * @param file File hình ảnh
   */
  async uploadThumbnail(
    episodeId: string | number,
    file: File
  ): Promise<{ url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('episodeId', String(episodeId));

    return apiClient.post<{ url: string; message: string }>(
      API_ENDPOINTS.MEDIA.THUMBNAIL,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  /**
   * Lấy URL đầy đủ cho tài nguyên media
   * @param path Đường dẫn tương đối của tài nguyên
   */
  getImageUrl(path?: string): string {
    if (!path) return '';
    
    // Nếu đã là URL đầy đủ, trả về nguyên bản
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Dùng API base URL từ biến môi trường hoặc giá trị mặc định
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  },

  /**
   * Kiểm tra trạng thái xử lý video của tập phim
   * @param episodeId ID của tập phim
   */
  async getProcessingStatus(episodeId: string | number): Promise<{
    status: 'processing' | 'completed' | 'failed';
    error?: string;
    progress?: number;
  }> {
    return apiClient.get<{
      status: 'processing' | 'completed' | 'failed';
      error?: string;
      progress?: number;
    }>(`/api/episodes/${episodeId}/processing-status`);
  }
};