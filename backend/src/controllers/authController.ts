import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User, UserRole } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

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
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Tìm người dùng theo email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Trả về thông tin người dùng và token
    return res.status(200).json({
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Lỗi khi đăng nhập' });
  }
};

// Làm mới token
export const refreshToken = (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token không được cung cấp' });
    }

    // Xác thực refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Tạo token mới
    const user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    } as User;

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    return res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return res.status(401).json({ message: 'Refresh token không hợp lệ hoặc đã hết hạn' });
  }
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    const user = await User.findByPk(req.user.userId);
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