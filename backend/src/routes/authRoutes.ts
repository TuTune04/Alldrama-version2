import express, { Request, Response } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Đăng ký tài khoản
router.post('/register', async (req: Request, res: Response) => {
  await authController.register(req, res);
});

// Đăng nhập
router.post('/login', async (req: Request, res: Response) => {
  await authController.login(req, res);
});

// Làm mới token
router.post('/refresh-token', (req: Request, res: Response) => {
  authController.refreshToken(req, res);
});

// Lấy thông tin người dùng hiện tại (yêu cầu xác thực)
router.get('/me', authenticate, async (req: Request, res: Response) => {
  await authController.getCurrentUser(req, res);
});

export default router; 