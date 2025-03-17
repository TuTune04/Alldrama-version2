import { useState, useCallback } from 'react';
import { mediaService } from '@/lib/api';
import { toast } from 'react-hot-toast';

export const useMedia = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Upload ảnh
  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!file) {
      setError('Không có file được chọn');
      return null;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Chỉ hỗ trợ file ảnh (jpeg, jpg, png, webp)');
      toast.error('Chỉ hỗ trợ file ảnh (jpeg, jpg, png, webp)');
      return null;
    }

    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Kích thước file không được vượt quá 5MB');
      toast.error('Kích thước file không được vượt quá 5MB');
      return null;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Giả lập tiến trình upload
      const progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prevProgress + 10;
        });
      }, 300);

      const response = await mediaService.uploadImage(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      setUploading(false);
      
      toast.success('Đã tải ảnh lên thành công');
      return response.url;
    } catch (err) {
      setError('Không thể tải ảnh lên');
      toast.error('Không thể tải ảnh lên');
      setUploading(false);
      setProgress(0);
      return null;
    }
  }, []);

  // Lấy URL đầy đủ cho ảnh
  const getImageUrl = useCallback((path?: string): string => {
    return mediaService.getImageUrl(path);
  }, []);

  return {
    uploadImage,
    getImageUrl,
    uploading,
    progress,
    error,
    reset: () => {
      setUploading(false);
      setProgress(0);
      setError(null);
    },
  };
}; 