import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User, UserRole } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

// Đăng ký tài khoản
export const register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = await User.create({
      full_name,
      email,
      password: hashedPassword,
      role: UserRole.USER
    });

    // Tạo token
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Trả về thông tin người dùng và token
    return res.status(201).json({
      message: 'Đăng ký thành công',
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Lỗi khi đăng ký tài khoản' });
  }
};

// Đăng nhập
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
      return;
    }

    // Tìm user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
      return;
    }

    // Kiểm tra mật khẩu
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
      return;
    }

    // Tạo access token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    // Tạo refresh token
    const refreshToken = jwt.sign(
      { id: user.id, tokenVersion: user.tokenVersion },
      process.env.REFRESH_TOKEN_SECRET || 'refresh_default_secret',
      { expiresIn: '30d' }
    );

    // Lưu refresh token vào cookie HttpOnly
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Chỉ dùng HTTPS trong production
      sameSite: 'lax', // Thay đổi từ 'strict' sang 'lax' để tương thích với NextAuth
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
      path: '/api/auth/refresh' // Chỉ gửi đến endpoint refresh
    });

    // Trả về access token và thông tin user
    res.json({
      message: 'Đăng nhập thành công',
      accessToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Hàm refresh token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Lấy refresh token từ cookie
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ message: 'Không tìm thấy refresh token' });
      return;
    }

    // Xác thực refresh token
    try {
      const decoded = jwt.verify(
        refreshToken, 
        process.env.REFRESH_TOKEN_SECRET || 'refresh_default_secret'
      ) as { id: number; tokenVersion: number };
      
      // Tìm user theo ID
      const user = await User.findByPk(decoded.id);
      if (!user) {
        res.status(401).json({ message: 'Người dùng không tồn tại' });
        return;
      }

      // Kiểm tra token version (ngăn chặn reuse của token cũ khi logout)
      if (user.tokenVersion !== decoded.tokenVersion) {
        res.status(401).json({ message: 'Refresh token không hợp lệ' });
        return;
      }

      // Tạo access token mới
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1h' }
      );

      // Tạo refresh token mới (token rotation)
      const newRefreshToken = jwt.sign(
        { id: user.id, tokenVersion: user.tokenVersion },
        process.env.REFRESH_TOKEN_SECRET || 'refresh_default_secret',
        { expiresIn: '30d' }
      );

      // Cập nhật cookie refresh token
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Thay đổi từ 'strict' sang 'lax' để tương thích với NextAuth
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/api/auth/refresh'
      });

      // Trả về access token mới
      res.json({
        message: 'Refresh token thành công',
        accessToken
      });
    } catch (error) {
      res.status(401).json({ message: 'Refresh token không hợp lệ hoặc đã hết hạn' });
    }
  } catch (error) {
    console.error('Lỗi khi refresh token:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Hàm đăng xuất
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Lấy ID người dùng từ token
    const userId = (req.user as { id: number })?.id;
    if (userId) {
      // Tìm user
      const user = await User.findByPk(userId);
      if (user) {
        // Tăng token version để vô hiệu hóa refresh token hiện tại
        user.tokenVersion += 1;
        await user.save();
      }
    }

    // Xóa cookie refresh token
    res.clearCookie('refreshToken', {
      path: '/api/auth/refresh',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' // Thay đổi từ 'strict' sang 'lax'
    });

    res.json({ message: 'Đăng xuất thành công' });
  } catch (error) {
    console.error('Lỗi khi đăng xuất:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Hàm đăng xuất khỏi tất cả thiết bị
export const logoutAll = async (req: Request, res: Response): Promise<void> => {
  try {
    // Lấy ID người dùng từ token
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
      return;
    }

    // Tìm user
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
      return;
    }

    // Reset token version để hủy tất cả refresh token
    user.tokenVersion = (user.tokenVersion || 0) + 1000; // Tăng một số lớn để đảm bảo tất cả token đều bị vô hiệu
    await user.save();

    // Xóa cookie refresh token hiện tại
    res.clearCookie('refreshToken', {
      path: '/api/auth/refresh',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' // Thay đổi từ 'strict' sang 'lax'
    });

    res.json({ message: 'Đã đăng xuất khỏi tất cả thiết bị' });
  } catch (error) {
    console.error('Lỗi khi đăng xuất khỏi tất cả thiết bị:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    return res.status(200).json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      subscriptionExpiredAt: user.subscriptionExpiredAt
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng' });
  }
};

// Xác thực thông qua liên kết email
export const emailAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, token, isSignUp } = req.body;

    // Nếu là đăng ký mới
    if (isSignUp) {
      // Kiểm tra email đã tồn tại chưa
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).json({ message: 'Email đã được sử dụng' });
        return;
      }

      // Tạo mật khẩu ngẫu nhiên
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Tạo người dùng mới
      const user = await User.create({
        full_name: email.split('@')[0], // Tạm thời lấy phần trước @ làm tên
        email,
        password: hashedPassword,
        role: UserRole.USER
      });

      // Tạo token
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        { id: user.id, tokenVersion: user.tokenVersion },
        process.env.REFRESH_TOKEN_SECRET || 'refresh_default_secret',
        { expiresIn: '30d' }
      );

      // Lưu refresh token vào cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Thay đổi sang 'lax' để hoạt động với NextAuth
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/api/auth/refresh'
      });

      res.json({
        message: 'Đăng ký thành công',
        accessToken,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role
        }
      });
      return;
    }

    // Nếu là đăng nhập
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy tài khoản với email này' });
      return;
    }

    // Tạo token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, tokenVersion: user.tokenVersion },
      process.env.REFRESH_TOKEN_SECRET || 'refresh_default_secret',
      { expiresIn: '30d' }
    );

    // Lưu refresh token vào cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Thay đổi sang 'lax' để hoạt động với NextAuth
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh'
    });

    res.json({
      message: 'Đăng nhập thành công',
      accessToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi xác thực email:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}; 