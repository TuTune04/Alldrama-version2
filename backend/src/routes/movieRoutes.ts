import express, { Request, Response } from 'express';
import * as movieController from '../controllers/movieController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Tìm kiếm phim
router.get('/search', async (req: Request, res: Response) => {
  await movieController.searchMovies(req, res);
});

// Lấy danh sách phim
router.get('/', async (req: Request, res: Response) => {
  await movieController.getMovies(req, res);
});

// Lấy chi tiết phim theo ID
router.get('/:id', async (req: Request, res: Response) => {
  await movieController.getMovieById(req, res);
});

// Tạo phim mới (chỉ admin)
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
  await movieController.createMovie(req, res);
});

// Cập nhật phim (chỉ admin)
router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  await movieController.updateMovie(req, res);
});

// Xóa phim (chỉ admin)
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  await movieController.deleteMovie(req, res);
});

export default router; 