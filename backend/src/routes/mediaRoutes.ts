import express from 'express';
import { 
  uploadMoviePoster,
  uploadMovieBackdrop,
  uploadMovieTrailer,
  uploadEpisodeVideo,
  getPresignedUploadUrl,
  deleteMedia,
  getVideoProcessingStatus,
  processVideo
} from '../controllers/mediaController';
import { imageUpload, videoUpload, validateFileType } from '../middlewares/uploadMiddleware';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Routes cho phim
router.post('/movies/:movieId/poster', 
  authenticate, 
  requireAdmin, 
  imageUpload.single('poster'),
  validateFileType(['image/']),
  uploadMoviePoster
);

router.post('/movies/:movieId/backdrop',
  authenticate,
  requireAdmin,
  imageUpload.single('backdrop'),
  validateFileType(['image/']),
  uploadMovieBackdrop
);

router.post('/movies/:movieId/trailer',
  authenticate,
  requireAdmin,
  videoUpload.single('trailer'),
  validateFileType(['video/']),
  uploadMovieTrailer
);

// Routes cho tập phim
router.post('/episodes/:movieId/:episodeId/video',
  authenticate,
  requireAdmin,
  videoUpload.single('video'),
  validateFileType(['video/']),
  uploadEpisodeVideo
);

// Route tạo presigned URL
router.post('/presigned-url',
  authenticate,
  requireAdmin,
  getPresignedUploadUrl
);

// Route để xóa media
router.delete('/:key',
  authenticate,
  requireAdmin,
  deleteMedia
);

// Route lấy trạng thái xử lý video
router.get('/episodes/:episodeId/processing-status',
  authenticate,
  getVideoProcessingStatus
);

// Thêm route cho xử lý video từ worker
router.post('/process-video', processVideo);

export default router; 