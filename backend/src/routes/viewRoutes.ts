import express from 'express';
import * as viewController from '../controllers/viewController';
import { optionalAuth } from '../middleware/auth';

const router = express.Router();

// Tăng lượt xem cho phim
// optionalAuth cho phép cả người dùng đã đăng nhập và chưa đăng nhập đều có thể tăng lượt xem
router.post('/movie/:movieId', optionalAuth, viewController.incrementMovieView);

// Tăng lượt xem cho tập phim
router.post('/episode/:episodeId', optionalAuth, viewController.incrementEpisodeView);

export default router; 