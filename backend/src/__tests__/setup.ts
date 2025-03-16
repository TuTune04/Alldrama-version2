import { Logger } from '../utils/logger';
/**
 * File này chứa cấu hình chung cho tất cả các tests
 * Jest sẽ tự động chạy file này trước khi chạy bất kỳ test nào
 */

// Import Redis client để có thể cleanup sau khi tests chạy xong
import redisClient from '../services/redisService';

const logger = Logger.getLogger('setup');

// Thêm test giả để Jest không báo lỗi file thiếu tests
test('setup file - not a real test', () => {
  expect(true).toBe(true);
});

// Thiết lập teardown global cho tất cả các tests
afterAll(async () => {
  // Đóng kết nối Redis nếu đang mở
  try {
    await redisClient.quit();
    logger.debug('Redis connection closed successfully after tests');
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
}); 