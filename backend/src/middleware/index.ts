// Export tất cả các middleware từ một nơi duy nhất
import { authenticate, optionalAuth, requireAdmin, requireSubscriber, JwtPayload } from './auth';
import { videoUpload, imageUpload, validateFileType, handleMulterError } from './uploadMiddleware';
import { errorHandler, catchAsync, AppError } from './errorHandler';

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