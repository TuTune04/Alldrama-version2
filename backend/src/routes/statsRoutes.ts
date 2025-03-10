import express, { Request, Response } from 'express';
import * as statsController from '../controllers/statsController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Lấy danh sách phim có nhiều lượt xem nhất
router.get('/movies/top', async (req: Request, res: Response) => {
  await statsController.getTopViewedMovies(req, res);
});

// Lấy danh sách tập phim có nhiều lượt xem nhất
router.get('/episodes/top', async (req: Request, res: Response) => {
  await statsController.getTopViewedEpisodes(req, res);
});

// Lấy thống kê lượt xem theo phim
router.get('/movies/:id', authenticate, async (req: Request, res: Response) => {
  await statsController.getMovieViewStats(req, res);
});

// Lấy thống kê lượt xem theo tập phim
router.get('/episodes/:id', authenticate, async (req: Request, res: Response) => {
  await statsController.getEpisodeViewStats(req, res);
});

export default router; 