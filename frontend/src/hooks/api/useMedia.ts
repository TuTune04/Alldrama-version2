import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export const useMedia = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');

  // Upload poster for movie
  const uploadPoster = useCallback(async (movieId: string | number, file: File): Promise<string | null> => {
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
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('movieId', String(movieId));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prevProgress + 10;
        });
      }, 300);

      const response = await fetch(API_ENDPOINTS.MEDIA.POSTER, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error('Failed to upload poster');
      }
      
      const data = await response.json();
      setProgress(100);
      setUploading(false);
      
      toast.success('Đã tải poster lên thành công');
      return data.url;
    } catch (err) {
      setError('Không thể tải poster lên');
      toast.error('Không thể tải poster lên');
      setUploading(false);
      setProgress(0);
      return null;
    }
  }, []);

  // Upload backdrop for movie
  const uploadBackdrop = useCallback(async (movieId: string | number, file: File): Promise<string | null> => {
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

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('movieId', String(movieId));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prevProgress + 10;
        });
      }, 300);

      const response = await fetch(API_ENDPOINTS.MEDIA.BACKDROP, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error('Failed to upload backdrop');
      }
      
      const data = await response.json();
      setProgress(100);
      setUploading(false);
      
      toast.success('Đã tải backdrop lên thành công');
      return data.url;
    } catch (err) {
      setError('Không thể tải backdrop lên');
      toast.error('Không thể tải backdrop lên');
      setUploading(false);
      setProgress(0);
      return null;
    }
  }, []);

  // Upload video for episode
  const uploadEpisodeVideo = useCallback(async (
    movieId: string | number, 
    episodeId: string | number, 
    file: File
  ): Promise<{
    originalUrl: string;
    thumbnailUrl: string;
    processingStatus: string;
  } | null> => {
    if (!file) {
      setError('Không có file được chọn');
      return null;
    }

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/x-matroska'];
    if (!validTypes.includes(file.type)) {
      setError('Chỉ hỗ trợ file video MP4, WebM, MKV');
      toast.error('Chỉ hỗ trợ file video MP4, WebM, MKV');
      return null;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setProcessingStatus('processing');

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('movieId', String(movieId));
      formData.append('episodeId', String(episodeId));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prevProgress + 5;
        });
      }, 500);

      const response = await fetch(API_ENDPOINTS.MEDIA.VIDEO, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error('Failed to upload video');
      }
      
      const data = await response.json();
      setProgress(100);
      
      // Video uploaded but still processing HLS
      toast.success('Đã tải video lên, đang xử lý...');
      
      return {
        originalUrl: data.originalUrl,
        thumbnailUrl: data.thumbnailUrl,
        processingStatus: data.processingStatus
      };
    } catch (err) {
      setError('Không thể tải video lên');
      toast.error('Không thể tải video lên');
      setUploading(false);
      setProgress(0);
      setProcessingStatus('failed');
      return null;
    }
  }, []);

  // Check video processing status
  const checkProcessingStatus = useCallback(async (episodeId: string | number) => {
    try {
      const response = await fetch(`/api/episodes/${episodeId}/processing-status`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to check processing status');
      }
      
      const status = await response.json();
      
      setProcessingStatus(status.status);
      
      if (status.status === 'completed') {
        toast.success('Video đã xử lý xong và sẵn sàng phát');
      } else if (status.status === 'failed') {
        setError(status.error || 'Xử lý video thất bại');
        toast.error('Xử lý video thất bại');
      }
      
      return status;
    } catch (err) {
      console.error('Không thể kiểm tra trạng thái xử lý:', err);
      return null;
    }
  }, []);

  // Get full URL for image
  const getImageUrl = useCallback((path?: string): string => {
    if (!path) return '';
    
    // If it's already a full URL, return it
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Otherwise, assume it's a relative path and prepend the API base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }, []);

  // Upload thumbnail for episode
  const uploadThumbnail = useCallback(async (episodeId: string | number, file: File): Promise<string | null> => {
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

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('episodeId', String(episodeId));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prevProgress + 10;
        });
      }, 300);

      const response = await fetch(API_ENDPOINTS.MEDIA.THUMBNAIL, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error('Failed to upload thumbnail');
      }
      
      const data = await response.json();
      setProgress(100);
      setUploading(false);
      
      toast.success('Đã tải thumbnail lên thành công');
      return data.url;
    } catch (err) {
      setError('Không thể tải thumbnail lên');
      toast.error('Không thể tải thumbnail lên');
      setUploading(false);
      setProgress(0);
      return null;
    }
  }, []);

  return {
    uploadPoster,
    uploadBackdrop,
    uploadEpisodeVideo,
    uploadThumbnail,
    checkProcessingStatus,
    getImageUrl,
    uploading,
    progress,
    error,
    processingStatus,
    reset: () => {
      setUploading(false);
      setProgress(0);
      setError(null);
      setProcessingStatus('idle');
    },
  };
};