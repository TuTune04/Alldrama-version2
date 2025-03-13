import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

// Định nghĩa kiểu cho payload JWT
export interface JwtPayload {
  id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
  tokenId?: string;
}

// Mở rộng kiểu Request để thêm thông tin người dùng
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      tokenId?: string;
    }
  }
}

// Middleware xác thực token
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ message: 'Không tìm thấy token xác thực' });
      return;
    }
    
    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      res.status(401).json({ message: 'Token không hợp lệ' });
      return;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as JwtPayload;
    req.user = decoded;
    req.tokenId = decoded.tokenId;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    return;
  }
};

// Middleware xác thực tùy chọn - không bắt buộc phải có token
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // Không có token nhưng vẫn cho phép truy cập
      next();
      return;
    }
    
    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      // Token không hợp lệ nhưng vẫn cho phép truy cập
      next();
      return;
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as JwtPayload;
      req.user = decoded;
    } catch (error) {
      // Token không hợp lệ nhưng vẫn cho phép truy cập
      console.log('Token không hợp lệ nhưng vẫn cho phép truy cập:', error);
    }
    
    next();
  } catch (error) {
    // Xảy ra lỗi nhưng vẫn cho phép truy cập
    next();
  }
};

// Middleware kiểm tra vai trò admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
    return;
  }
  
  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({ message: 'Bạn không có quyền truy cập tài nguyên này' });
    return;
  }
  
  next();
};

// Middleware kiểm tra vai trò subscriber
export const requireSubscriber = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
    return;
  }
  
  if (req.user.role !== UserRole.SUBSCRIBER && req.user.role !== UserRole.ADMIN) {
    res.status(403).json({ message: 'Bạn cần đăng ký gói premium để truy cập tài nguyên này' });
    return;
  }
  
  next();
}; 