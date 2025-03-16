import { Logger } from '../utils/logger';
import cron from 'node-cron';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';
import { Movie } from '../models/Movie';
import { Episode } from '../models/Episode';
import {
  getMovieViewsFromRedis,
  getEpisodeViewsFromRedis,
  resetMovieViews,
  resetEpisodeViews
} from '../services/redisService';

const logger = Logger.getLogger('syncViewsJob');

/**
 * Cập nhật lượt xem cho phim từ Redis vào database
 */
const syncMovieViews = async (): Promise<void> => {
  try {
    logger.debug('Bắt đầu đồng bộ lượt xem phim từ Redis sang database...');
    
    // Lấy danh sách tất cả phim
    const movies = await Movie.findAll();
    
    for (const movie of movies) {
      // Lấy lượt xem từ Redis
      const redisViews = await getMovieViewsFromRedis(movie.id);
      
      if (redisViews > 0) {
        // Cập nhật lượt xem vào database
        await sequelize.query(
          `UPDATE movies SET views = views + :redisViews WHERE id = :movieId`,
          {
            replacements: { redisViews, movieId: movie.id },
            type: QueryTypes.UPDATE
          }
        );
        
        // Đặt lại bộ đếm trong Redis
        await resetMovieViews(movie.id);
        logger.debug(`Đã cập nhật ${redisViews} lượt xem cho phim ID ${movie.id}`);
      }
    }
    
    logger.debug('Hoàn thành đồng bộ lượt xem phim.');
  } catch (error) {
    logger.error('Lỗi khi đồng bộ lượt xem phim:', error);
  }
};

/**
 * Cập nhật lượt xem cho tập phim từ Redis vào database
 */
const syncEpisodeViews = async (): Promise<void> => {
  try {
    logger.debug('Bắt đầu đồng bộ lượt xem tập phim từ Redis sang database...');
    
    // Lấy danh sách tất cả tập phim
    const episodes = await Episode.findAll();
    
    for (const episode of episodes) {
      // Lấy lượt xem từ Redis
      const redisViews = await getEpisodeViewsFromRedis(episode.id);
      
      if (redisViews > 0) {
        // Cập nhật lượt xem vào database
        await sequelize.query(
          `UPDATE episodes SET views = views + :redisViews WHERE id = :episodeId`,
          {
            replacements: { redisViews, episodeId: episode.id },
            type: QueryTypes.UPDATE
          }
        );
        
        // Đặt lại bộ đếm trong Redis
        await resetEpisodeViews(episode.id);
        logger.debug(`Đã cập nhật ${redisViews} lượt xem cho tập phim ID ${episode.id}`);
      }
    }
    
    logger.debug('Hoàn thành đồng bộ lượt xem tập phim.');
  } catch (error) {
    logger.error('Lỗi khi đồng bộ lượt xem tập phim:', error);
  }
};

/**
 * Khởi động cron job để đồng bộ lượt xem
 * Mặc định: Chạy mỗi 5 phút
 */
export const startViewsSyncJob = (cronExpression = '*/5 * * * *'): void => {
  logger.debug(`Khởi động cron job đồng bộ lượt xem với lịch: ${cronExpression}`);
  
  cron.schedule(cronExpression, async () => {
    logger.debug(`Chạy job đồng bộ lượt xem lúc ${new Date().toISOString()}`);
    
    try {
      await syncMovieViews();
      await syncEpisodeViews();
    } catch (error) {
      logger.error('Lỗi khi chạy job đồng bộ lượt xem:', error);
    }
  });
};

export default {
  startViewsSyncJob
}; 