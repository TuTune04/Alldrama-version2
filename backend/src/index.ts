import dotenv from "dotenv";
import app from "./app";
import createDatabase from "./utils/createDatabase";
import initDatabase from "./utils/initDatabase";
import { startViewsSyncJob } from "./jobs/syncViewsJob";

// Tải biến môi trường
dotenv.config();

const PORT = process.env.PORT || 5000;

// Xử lý sự kiện không bắt được
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Khởi động server
const startServer = async () => {
  try {
    // Tạo database nếu chưa tồn tại
    await createDatabase();
    
    // Khởi tạo kết nối database
    await initDatabase();
    
    // Khởi động cron job đồng bộ lượt xem từ Redis vào database
    startViewsSyncJob();

    // Lắng nghe kết nối
    const server = app.listen(PORT, () => {
      console.log(`Server đang chạy trên port ${PORT}`);
    });

    // Xử lý graceful shutdown
    const gracefulShutdown = () => {
      console.log('Đang đóng server...');
      server.close(() => {
        console.log('Server đã đóng.');
        process.exit(0);
      });
      
      // Nếu server không đóng trong 10 giây, tắt cưỡng bức
      setTimeout(() => {
        console.error('Không thể đóng server một cách bình thường, tắt cưỡng bức.');
        process.exit(1);
      }, 10000);
    };

    // Lắng nghe các tín hiệu tắt server
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    console.error("Không thể khởi động server:", error);
    process.exit(1);
  }
};

startServer(); 