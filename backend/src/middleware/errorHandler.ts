import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

const logger = Logger.getLogger('ErrorHandler');

// Đối tượng lỗi tùy chỉnh
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware xử lý lỗi tập trung
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Mặc định trạng thái lỗi server
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi máy chủ nội bộ';

  // Log lỗi
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${statusCode}, Message:: ${message}`);
    logger.error(err.stack);
  } else {
    logger.warn(`[${req.method}] ${req.path} >> StatusCode:: ${statusCode}, Message:: ${message}`);
  }

  // Xử lý các loại lỗi cụ thể
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Dữ liệu không hợp lệ';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Không được xác thực';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token không hợp lệ';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token đã hết hạn';
  } else if (err.code === 'EBADCSRFTOKEN' || err.code === 'INVALID_CSRF_TOKEN') {
    statusCode = 403;
    message = 'CSRF token không hợp lệ';
  }

  // Trong môi trường development, trả về stack trace
  const error = {
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Trả về response lỗi
  res.status(statusCode).json({
    status: 'error',
    ...error,
    ...(err.errors && { errors: err.errors })
  });
};

// Middleware để xử lý lỗi không đồng bộ
export const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 