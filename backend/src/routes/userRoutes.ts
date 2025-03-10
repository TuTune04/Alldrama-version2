import express, { Request, Response } from 'express';
import * as userController from '../controllers/userController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Lấy danh sách người dùng (chỉ admin)
router.get('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
  await userController.getUsers(req, res);
});

// Lấy thông tin người dùng theo ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  await userController.getUserById(req, res);
});

// Cập nhật thông tin người dùng
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  await userController.updateUser(req, res);
});

// Xóa người dùng (chỉ admin)
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  await userController.deleteUser(req, res);
});

// Lấy danh sách phim yêu thích của người dùng
router.get('/:id/favorites', authenticate, async (req: Request, res: Response) => {
  await userController.getUserFavorites(req, res);
});

// Lấy lịch sử xem phim của người dùng
router.get('/:id/watch-history', authenticate, async (req: Request, res: Response) => {
  await userController.getUserWatchHistory(req, res);
});

export default router; 