import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import initDatabase from "./utils/initDatabase";
import createDatabase from "./utils/createDatabase";
import movieRoutes from "./routes/movieRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import favoriteRoutes from "./routes/favoriteRoutes";
import watchHistoryRoutes from "./routes/watchHistoryRoutes";
import episodeRoutes from "./routes/episodeRoutes";
import genreRoutes from "./routes/genreRoutes";
import statsRoutes from "./routes/statsRoutes";
import viewRoutes from "./routes/viewRoutes";
import { startViewsSyncJob } from "./jobs/syncViewsJob";

// Tải biến môi trường
dotenv.config();

// Khởi tạo Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/watch-history', watchHistoryRoutes);
app.use('/api/episodes', episodeRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/views', viewRoutes);

// Route mặc định
app.get("/", (req: Request, res: Response) => {
  res.send("Alldrama API - Phiên bản 1.0");
});

// Xử lý lỗi 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Không tìm thấy tài nguyên' });
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
    app.listen(PORT, () => {
      console.log(`Server đang chạy trên port ${PORT}`);
    });
  } catch (error) {
    console.error("Không thể khởi động server:", error);
    process.exit(1);
  }
};

startServer();