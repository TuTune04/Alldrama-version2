/**
 * File này chứa cấu hình chung cho tất cả các tests
 * Jest sẽ tự động chạy file này trước khi chạy bất kỳ test nào
 */

// Import Redis client để có thể cleanup sau khi tests chạy xong
import redisClient from '../services/redisService';

// Thêm test giả để Jest không báo lỗi file thiếu tests
test('setup file - not a real test', () => {
  expect(true).toBe(true);
});

// Thiết lập teardown global cho tất cả các tests
afterAll(async () => {
  // Đóng kết nối Redis nếu đang mở
  try {
    await redisClient.quit();
    console.log('Redis connection closed successfully after tests');
  } catch (error) {
    console.error('Error closing Redis connection:', error);
  }
}); 