import express, { Request, Response } from 'express';
import * as favoriteController from '../controllers/favoriteController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Lấy danh sách phim yêu thích của người dùng hiện tại
router.get('/', authenticate, async (req: Request, res: Response) => {
  await favoriteController.getCurrentUserFavorites(req, res);
});

// Thêm phim vào danh sách yêu thích
router.post('/', authenticate, async (req: Request, res: Response) => {
  await favoriteController.addFavorite(req, res);
});

// Xóa phim khỏi danh sách yêu thích
router.delete('/:movieId', authenticate, async (req: Request, res: Response) => {
  await favoriteController.removeFavorite(req, res);
});

export default router; 