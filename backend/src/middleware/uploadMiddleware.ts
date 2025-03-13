import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, '../../uploads/temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu trữ tạm thời
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniquePrefix = `${Date.now()}-${uuidv4()}`;
    cb(null, `${uniquePrefix}${path.extname(file.originalname)}`);
  }
});

// Middleware cho video
export const videoUpload = multer({
  storage,
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(null, false);
      // Không dùng cb(new Error()) vì nó sẽ dừng toàn bộ request
      // Ta sẽ xử lý file không hợp lệ bằng middleware handleMulterError
    }
  },
  limits: {
    fileSize: 1024 * 1024 * parseInt(process.env.MAX_UPLOAD_SIZE || '500'), // Default 500MB
  }
});

// Middleware cho hình ảnh
export const imageUpload = multer({
  storage,
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
      // Không dùng cb(new Error()) vì nó sẽ dừng toàn bộ request
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB
  }
});

// Kiểm tra file type sau khi multer đã xử lý
export const validateFileType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Không tìm thấy file' });
      return;
    }
    
    const fileType = req.file.mimetype;
    const isAllowed = allowedTypes.some(type => fileType.startsWith(type));
    
    if (!isAllowed) {
      res.status(400).json({ 
        success: false, 
        message: `Định dạng file không hợp lệ. Chỉ chấp nhận: ${allowedTypes.join(', ')}` 
      });
      return;
    }
    
    next();
  };
};

// Xử lý lỗi multer
export const handleMulterError = (error: Error, _req: Request, res: Response, next: NextFunction): void => {
  if (error instanceof multer.MulterError) {
    // Lỗi multer
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ 
        success: false, 
        message: 'File quá lớn. Kích thước tối đa cho phép là 500MB đối với video và 10MB đối với hình ảnh.' 
      });
      return;
    }
    res.status(400).json({ success: false, message: error.message });
    return;
  } else if (error) {
    // Lỗi khác
    res.status(500).json({ success: false, message: error.message });
    return;
  }
  
  next();
}; 