import { MediaUploadResponse } from '@/types';
import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export const mediaService = {
  /**
   * Tải lên ảnh
   * @param file File ảnh cần tải lên
   */
  async uploadImage(file: File): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post<MediaUploadResponse>(API_ENDPOINTS.MEDIA.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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