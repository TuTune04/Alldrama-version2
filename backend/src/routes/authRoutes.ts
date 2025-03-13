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
router.post('/refresh', authController.refreshToken);

// Lấy thông tin người dùng hiện tại (yêu cầu xác thực)
router.get('/me', authenticate, async (req: Request, res: Response) => {
  await authController.getCurrentUser(req, res);
});

// Route đăng xuất - yêu cầu xác thực
router.post('/logout', authenticate, authController.logout);

// Route đăng xuất khỏi tất cả thiết bị - yêu cầu xác thực
router.post('/logout-all', authenticate, authController.logoutAll);

// Route cho xác thực email (tích hợp NextAuth)
router.post('/email-auth', authController.emailAuth);

export default router; 