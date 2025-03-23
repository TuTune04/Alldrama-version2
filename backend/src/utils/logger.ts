/**
 * Logger tiện ích để thay thế console.log/error
 * Giúp tránh cảnh báo ESLint và dễ dàng cấu hình logging trong tương lai
 */
import fs from 'fs';
import path from 'path';

// Cấu hình biến môi trường để kiểm soát logging
const isDevelopment = process.env.NODE_ENV !== 'production';
const isTest = process.env.NODE_ENV === 'test';
const isFullLoggingEnabled = process.env.ENABLE_FULL_LOGGING === 'true';
const logFilePath = process.env.LOG_FILE_PATH || './logs/app.log';

// Đảm bảo thư mục logs tồn tại
const logsDir = path.dirname(logFilePath);
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (err) {
  console.error('Không thể tạo thư mục logs:', err);
}

// Lấy stack trace để biết file và line number
function getCallerInfo(): string {
  const err = new Error();
  const stack = err.stack || '';
  const stackLines = stack.split('\n');
  
  // Bỏ qua 3 dòng đầu tiên (Error, getCallerInfo, Logger method)
  const callerLine = stackLines[3] || '';
  
  // Trích xuất đường dẫn file và số dòng
  const match = callerLine.match(/at\s+(.+)\s+\((.+):(\d+):(\d+)\)/);
  if (match) {
    const [, , filePath, lineNumber] = match;
    const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || '';
    return `${fileName}:${lineNumber}`;
  }
  
  return '';
}

// Logger class với các phương thức tiện ích
export class Logger {
  private static instance: Logger;
  private context: string;

  private constructor(context = 'App') {
    this.context = context;
  }

  /**
   * Lấy instance của logger với context cụ thể
   */
  public static getLogger(context?: string): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(context);
    }
    return new Logger(context);
  }

  /**
   * Ghi log vào file
   */
  private logToFile(level: string, message: string, data?: unknown): void {
    try {
      const timestamp = new Date().toISOString();
      const callerInfo = getCallerInfo();
      const logEntry = `${timestamp} [${level}] [${this.context}] [${callerInfo}] ${message} ${data ? JSON.stringify(data) : ''}\n`;
      
      fs.appendFileSync(logFilePath, logEntry);
    } catch (err) {
      console.error('Không thể ghi log vào file:', err);
    }
  }

  /**
   * Log thông tin
   */
  public info(message: string, ...data: unknown[]): void {
    if (isTest) return; // Không log trong môi trường test
    
    if (isDevelopment || isFullLoggingEnabled) {
      const callerInfo = getCallerInfo();
      console.info(`[INFO] [${this.context}] [${callerInfo}] ${message}`, ...data);
      this.logToFile('INFO', message, data.length > 0 ? data : undefined);
    }
  }

  /**
   * Log lỗi
   */
  public error(message: string, error?: Error | unknown): void {
    if (isTest) return; // Không log trong môi trường test
    
    const callerInfo = getCallerInfo();
    console.error(`[ERROR] [${this.context}] [${callerInfo}] ${message}`, error);
    this.logToFile('ERROR', message, error);
  }

  /**
   * Log cảnh báo
   */
  public warn(message: string, ...data: unknown[]): void {
    if (isTest) return; // Không log trong môi trường test
    
    const callerInfo = getCallerInfo();
    console.warn(`[WARN] [${this.context}] [${callerInfo}] ${message}`, ...data);
    this.logToFile('WARN', message, data.length > 0 ? data : undefined);
  }

  /**
   * Log debug (chỉ trong môi trường development hoặc khi bật full logging)
   */
  public debug(message: string, ...data: unknown[]): void {
    if (isTest) return; // Không log trong môi trường test
    
    if (isDevelopment || isFullLoggingEnabled) {
      const callerInfo = getCallerInfo();
      console.debug(`[DEBUG] [${this.context}] [${callerInfo}] ${message}`, ...data);
      this.logToFile('DEBUG', message, data.length > 0 ? data : undefined);
    }
  }
} 