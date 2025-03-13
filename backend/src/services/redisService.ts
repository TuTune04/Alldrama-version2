import Redis from 'ioredis';
import dotenv from 'dotenv';
import { Logger } from '../utils/logger';

const logger = Logger.getLogger('RedisService');

dotenv.config();

// Biến để theo dõi trạng thái Redis
let redisAvailable = false;

// Tạo kết nối Redis với cách xử lý khác nhau cho môi trường test
const createRedisClient = () => {
  // Không tạo kết nối thực trong môi trường test
  if (process.env.NODE_ENV === 'test') {
    logger.info('Using mock Redis client for testing environment');
    redisAvailable = true;
    return new Redis(); // Sẽ được thay thế bởi mock
  }

  logger.info('Creating Redis connection');
  const client = new Redis({
    host: process.env.REDIS_HOST || '172.17.0.2',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryStrategy: (times) => {
      // Giới hạn số lần thử kết nối lại
      const delay = Math.min(times * 100, 3000);
      logger.info(`Redis connection retry in ${delay}ms`);
      return delay;
    },
  });

  client.on('connect', () => {
    logger.info('Redis connected successfully');
    redisAvailable = true;
  });

  client.on('error', (err) => {
    logger.error(`Redis connection error: ${err.message}`);
    redisAvailable = false;
  });

  return client;
};

const redisClient = createRedisClient();

// Wrapper function để xử lý khi Redis không khả dụng
const safeRedisOperation = async <T>(operation: (...args: unknown[]) => Promise<T>, ...args: unknown[]): Promise<T | null> => {
  if (!redisAvailable) {
    logger.debug('Redis không khả dụng, bỏ qua thao tác');
    return null;
  }
  
  try {
    return await operation(...args);
  } catch (error) {
    logger.error('Lỗi khi thực hiện thao tác Redis:', error);
    return null;
  }
};

// Phương thức để tăng lượt xem cho phim
export const incrementMovieViews = async (movieId: number): Promise<void> => {
  await safeRedisOperation(async () => {
    // Khóa Redis cho phim: movie:views:{movieId}
    const key = `movie:views:${movieId}`;
    await redisClient.incr(key);
  });
};

// Phương thức để tăng lượt xem cho tập phim
export const incrementEpisodeViews = async (episodeId: number, movieId: number): Promise<void> => {
  await safeRedisOperation(async () => {
    // Khóa Redis cho tập phim: episode:views:{episodeId}
    const episodeKey = `episode:views:${episodeId}`;
    await redisClient.incr(episodeKey);
    
    // Cũng tăng lượt xem cho phim
    await incrementMovieViews(movieId);
  });
};

// Lấy lượt xem hiện tại từ Redis
export const getMovieViewsFromRedis = async (movieId: number): Promise<number> => {
  return await safeRedisOperation(async () => {
    const views = await redisClient.get(`movie:views:${movieId}`);
    return views ? parseInt(views, 10) : 0;
  }) || 0;
};

export const getEpisodeViewsFromRedis = async (episodeId: number): Promise<number> => {
  return await safeRedisOperation(async () => {
    const views = await redisClient.get(`episode:views:${episodeId}`);
    return views ? parseInt(views, 10) : 0;
  }) || 0;
};

// Phương thức để xóa dữ liệu lượt xem đã xử lý trong Redis
export const resetMovieViews = async (movieId: number): Promise<void> => {
  await safeRedisOperation(async () => {
    await redisClient.del(`movie:views:${movieId}`);
  });
};

export const resetEpisodeViews = async (episodeId: number): Promise<void> => {
  await safeRedisOperation(async () => {
    await redisClient.del(`episode:views:${episodeId}`);
  });
};

// Type definitions for cached data
export interface CachedMovie {
  id: number;
  title: string;
  description?: string;
  posterUrl?: string;
  backdropUrl?: string;
  genres?: unknown[];
  [key: string]: unknown;
}

export interface CachedSearchResult {
  movies: unknown[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  [key: string]: unknown;
}

// Cache cho dữ liệu phim
export const cacheMovieData = async (movieId: number, data: CachedMovie, expirySeconds = 3600): Promise<void> => {
  await safeRedisOperation(async () => {
    await redisClient.setex(`movie:data:${movieId}`, expirySeconds, JSON.stringify(data));
  });
};

// Lấy dữ liệu phim từ cache
export const getCachedMovieData = async (movieId: number): Promise<CachedMovie | null> => {
  return await safeRedisOperation(async () => {
    const data = await redisClient.get(`movie:data:${movieId}`);
    return data ? JSON.parse(data) : null;
  }) || null;
};

// Cache cho kết quả tìm kiếm
export const cacheSearchResults = async (query: string, results: CachedSearchResult, expirySeconds = 600): Promise<void> => {
  await safeRedisOperation(async () => {
    const cacheKey = `search:${Buffer.from(query).toString('base64')}`;
    await redisClient.setex(cacheKey, expirySeconds, JSON.stringify(results));
  });
};

// Lấy kết quả tìm kiếm từ cache
export const getCachedSearchResults = async (query: string): Promise<CachedSearchResult | null> => {
  return await safeRedisOperation(async () => {
    const cacheKey = `search:${Buffer.from(query).toString('base64')}`;
    const data = await redisClient.get(cacheKey);
    return data ? JSON.parse(data) : null;
  }) || null;
};

// Đảm bảo syncViewsJob vẫn hoạt động khi Redis không khả dụng
export const isRedisAvailable = (): boolean => {
  return redisAvailable;
};

export default redisClient; 