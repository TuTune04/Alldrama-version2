import jwt, { SignOptions } from 'jsonwebtoken';
import { User, UserRole } from '../models/User';

// Định nghĩa kiểu dữ liệu cho payload JWT
export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

// Tạo access token
export const generateAccessToken = (user: User): string => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const options: SignOptions = {
    expiresIn: '1d'
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key',
    options
  );
};

// Tạo refresh token
export const generateRefreshToken = (user: User): string => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const options: SignOptions = {
    expiresIn: '7d'
  };

  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-refresh-secret-key',
    options
  );
};

// Xác thực token
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Xác thực refresh token
export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-refresh-secret-key'
    ) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}; 