/**
 * Logger tiện ích để thay thế console.log/error
 * Giúp tránh cảnh báo ESLint và dễ dàng cấu hình logging trong tương lai
 */

// Cấu hình biến môi trường để kiểm soát logging
const isDevelopment = process.env.NODE_ENV !== 'production';
const isTest = process.env.NODE_ENV === 'test';

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
   * Log thông tin
   */
  public info(message: string, ...data: unknown[]): void {
    if (isTest) return; // Không log trong môi trường test
    if (isDevelopment) {
      console.info(`[INFO] [${this.context}] ${message}`, ...data);
    }
  }

  /**
   * Log lỗi
   */
  public error(message: string, error?: Error | unknown): void {
    if (isTest) return; // Không log trong môi trường test
    console.error(`[ERROR] [${this.context}] ${message}`, error);
  }

  /**
   * Log cảnh báo
   */
  public warn(message: string, ...data: unknown[]): void {
    if (isTest) return; // Không log trong môi trường test
    console.warn(`[WARN] [${this.context}] ${message}`, ...data);
  }

  /**
   * Log debug (chỉ trong môi trường development)
   */
  public debug(message: string, ...data: unknown[]): void {
    if (isTest || !isDevelopment) return; // Chỉ log trong môi trường development
    console.debug(`[DEBUG] [${this.context}] ${message}`, ...data);
  }
} 