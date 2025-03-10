import express, { Request, Response } from 'express';
import * as watchHistoryController from '../controllers/watchHistoryController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Lấy lịch sử xem của người dùng hiện tại
router.get('/', authenticate, async (req: Request, res: Response) => {
  await watchHistoryController.getCurrentUserWatchHistory(req, res);
});

// Thêm vào lịch sử xem
router.post('/', authenticate, async (req: Request, res: Response) => {
  await watchHistoryController.addWatchHistory(req, res);
});

// Xóa khỏi lịch sử xem
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  await watchHistoryController.removeWatchHistory(req, res);
});

export default router; 