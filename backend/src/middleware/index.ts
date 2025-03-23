// Export tất cả các middleware từ một nơi duy nhất
import { authenticate, optionalAuth, requireAdmin, requireSubscriber, JwtPayload } from './auth';
import { videoUpload, imageUpload, validateFileType, handleMulterError } from './uploadMiddleware';
import { errorHandler, catchAsync, AppError } from './errorHandler';
import process from 'process';

// Xử lý lỗi heap overflow khi làm việc với file lớn
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Nếu lỗi là RangeError hoặc lỗi về memory, có thể là do xử lý file quá lớn
  if (err instanceof RangeError || err.message.includes('heap') || err.message.includes('memory')) {
    console.error('Có thể xảy ra lỗi khi xử lý file lớn. Kiểm tra lại giới hạn node memory.');
    console.error('Thử chạy Node với tham số --max-old-space-size=4096 hoặc cao hơn.');
  }
});

export { 
  // Auth middleware
  authenticate,
  optionalAuth,
  requireAdmin,
  requireSubscriber,
  JwtPayload,
  
  // Upload middleware
  videoUpload,
  imageUpload,
  validateFileType,
  handleMulterError,
  
  // Error handling
  errorHandler,
  catchAsync,
  AppError
};

export * from './security';
export * from './rateLimit'; 