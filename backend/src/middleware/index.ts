// Export tất cả các middleware từ một nơi duy nhất
import { authenticate, optionalAuth, requireAdmin, requireSubscriber, JwtPayload } from './auth';
import { videoUpload, imageUpload, validateFileType, handleMulterError } from './uploadMiddleware';

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
  handleMulterError
}; 