import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User, UserRole } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { getAuthService } from '../services';

// Đăng ký tài khoản
export const register = async (req: Request, res: Response) => {
  try {
    const authService = getAuthService();
    const { full_name, email, password } = req.body;

    const result = await authService.register(full_name, email, password);

    // Trả về thông tin người dùng và token
    return res.status(201).json({
      message: 'Đăng ký thành công',
      user: result.user,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken
    });
  } catch (error) {
    console.error('Error registering user:', error);
    if (error instanceof Error && error.message === 'Email đã được sử dụng') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Lỗi khi đăng ký tài khoản' });
  }
};

// Đăng nhập
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const authService = getAuthService();
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    // Lưu refresh token vào cookie HttpOnly
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Chỉ dùng HTTPS trong production
      sameSite: 'lax', // Thay đổi từ 'strict' sang 'lax' để tương thích với NextAuth
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
      path: '/api/auth/refresh' // Chỉ gửi đến endpoint refresh
    });

    // Trả về thông tin
    res.json({
      message: 'Đăng nhập thành công',
      accessToken: result.tokens.accessToken,
      user: result.user
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    if (error instanceof Error) {
      if (error.message === 'Email hoặc mật khẩu không chính xác') {
        res.status(401).json({ message: error.message });
        return;
      }
      if (error.message === 'Email và mật khẩu là bắt buộc') {
        res.status(400).json({ message: error.message });
        return;
      }
    }
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Hàm refresh token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const authService = getAuthService();
    // Lấy refresh token từ cookie
    const refreshToken = req.cookies.refreshToken;
    
    const tokens = await authService.refreshToken(refreshToken);

    // Cập nhật cookie refresh token
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Thay đổi từ 'strict' sang 'lax' để tương thích với NextAuth
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh'
    });

    // Trả về access token mới
    res.json({
      message: 'Refresh token thành công',
      accessToken: tokens.accessToken
    });
  } catch (error) {
    console.error('Lỗi refresh token:', error);
    res.status(401).json({ message: 'Refresh token không hợp lệ hoặc đã hết hạn' });
    return;
  }
};

// Đăng xuất
export const logout = async (req: Request, res: Response) => {
  try {
    const authService = getAuthService();
    
    if (req.user?.id) {
      await authService.logout(req.user.id, req.tokenId);
    }
    
    // Xóa cookie refresh token
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/refresh'
    });
    
    res.status(200).json({ message: 'Đăng xuất thành công' });
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Đăng xuất khỏi tất cả các thiết bị
export const logoutAll = async (req: Request, res: Response) => {
  try {
    const authService = getAuthService();
    
    if (req.user?.id) {
      await authService.logoutAllDevices(req.user.id);
    }
    
    // Xóa cookie refresh token
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/refresh'
    });
    
    res.status(200).json({ message: 'Đã đăng xuất khỏi tất cả các thiết bị' });
  } catch (error) {
    console.error('Lỗi đăng xuất khỏi tất cả thiết bị:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const authService = getAuthService();
    
    if (!req.user) {
      return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    const user = await authService.getCurrentUser(req.user.id);
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error getting current user:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng' });
  }
};

// Xác thực thông qua liên kết email
export const emailAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const authService = getAuthService();
    const { email, token, isSignUp } = req.body;

    const result = await authService.emailAuth(email, isSignUp);

    // Lưu refresh token vào cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Thay đổi sang 'lax' để hoạt động với NextAuth
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh'
    });

    res.json({
      message: isSignUp ? 'Đăng ký thành công' : 'Đăng nhập thành công',
      accessToken: result.tokens.accessToken,
      user: result.user
    });
  } catch (error) {
    console.error('Lỗi xác thực email:', error);
    if (error instanceof Error) {
      if (error.message === 'Email đã được sử dụng') {
        res.status(400).json({ message: error.message });
        return;
      }
      if (error.message === 'Không tìm thấy tài khoản với email này') {
        res.status(404).json({ message: error.message });
        return;
      }
    }
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}; 