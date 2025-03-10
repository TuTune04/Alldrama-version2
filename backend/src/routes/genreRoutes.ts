import express, { Request, Response } from 'express';
import * as genreController from '../controllers/genreController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Lấy danh sách thể loại
router.get('/', async (req: Request, res: Response) => {
  await genreController.getGenres(req, res);
});

// Lấy chi tiết thể loại
router.get('/:id', async (req: Request, res: Response) => {
  await genreController.getGenreById(req, res);
});

// Lấy danh sách phim theo thể loại
router.get('/:id/movies', async (req: Request, res: Response) => {
  await genreController.getMoviesByGenre(req, res);
});

// Tạo thể loại mới (chỉ admin)
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
  await genreController.createGenre(req, res);
});

// Cập nhật thể loại (chỉ admin)
router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  await genreController.updateGenre(req, res);
});

// Xóa thể loại (chỉ admin)
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  await genreController.deleteGenre(req, res);
});

export default router; 