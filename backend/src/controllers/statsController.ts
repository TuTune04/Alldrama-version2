import { Logger } from '../utils/logger';
import { Request, Response } from 'express';
import { Movie } from '../models/Movie';
import { Episode } from '../models/Episode';
import { UserWatchHistory } from '../models/UserWatchHistory';
import { Op, fn, col, literal } from 'sequelize';

const logger = Logger.getLogger('statsController');

// Lấy thống kê lượt xem theo phim
export const getMovieViewStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra phim có tồn tại không
    const movie = await Movie.findByPk(id);
    if (!movie) {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }
    
    // Lấy danh sách tập phim và lượt xem
    const episodes = await Episode.findAll({
      where: { movieId: id },
      attributes: ['id', 'episodeNumber', 'views'],
      order: [['episodeNumber', 'ASC']]
    });
    
    // Tính tổng lượt xem từ tất cả các tập
    const totalEpisodeViews = episodes.reduce((sum, episode) => sum + episode.views, 0);
    
    // Lấy thông tin lượt xem theo thời gian (7 ngày gần nhất)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyViews = await UserWatchHistory.findAll({
      attributes: [
        [fn('date_trunc', 'day', col('watchedAt')), 'date'],
        [fn('count', col('id')), 'count']
      ],
      where: {
        movieId: id,
        watchedAt: {
          [Op.gte]: sevenDaysAgo
        }
      },
      group: [fn('date_trunc', 'day', col('watchedAt'))],
      order: [[fn('date_trunc', 'day', col('watchedAt')), 'ASC']],
      raw: true
    });
    
    return res.status(200).json({
      movie: {
        id: movie.id,
        title: movie.title,
        totalViews: movie.views
      },
      episodeStats: episodes,
      totalEpisodeViews,
      dailyViews
    });
  } catch (error) {
    logger.error('Error fetching movie view stats:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy thống kê lượt xem phim' });
  }
};

// Lấy thống kê lượt xem theo tập phim
export const getEpisodeViewStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra tập phim có tồn tại không
    const episode = await Episode.findByPk(id, {
      include: [Movie]
    });
    
    if (!episode) {
      return res.status(404).json({ message: 'Không tìm thấy tập phim' });
    }
    
    // Lấy thông tin lượt xem theo thời gian (7 ngày gần nhất)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyViews = await UserWatchHistory.findAll({
      attributes: [
        [fn('date_trunc', 'day', col('watchedAt')), 'date'],
        [fn('count', col('id')), 'count']
      ],
      where: {
        episodeId: id,
        watchedAt: {
          [Op.gte]: sevenDaysAgo
        }
      },
      group: [fn('date_trunc', 'day', col('watchedAt'))],
      order: [[fn('date_trunc', 'day', col('watchedAt')), 'ASC']],
      raw: true
    });
    
    // Lấy thông tin về thời điểm xem nhiều nhất trong ngày
    const hourlyViews = await UserWatchHistory.findAll({
      attributes: [
        [fn('EXTRACT', literal('HOUR FROM "watchedAt"')), 'hour'],
        [fn('count', col('id')), 'count']
      ],
      where: {
        episodeId: id
      },
      group: [fn('EXTRACT', literal('HOUR FROM "watchedAt"'))],
      order: [[fn('count', col('id')), 'DESC']],
      limit: 24,
      raw: true
    });
    
    return res.status(200).json({
      episode: {
        id: episode.id,
        movieId: episode.movieId,
        episodeNumber: episode.episodeNumber,
        title: episode.movie.title,
        totalViews: episode.views
      },
      dailyViews,
      hourlyViews,
      percentOfMovieViews: episode.movie.views > 0 
        ? Math.round((episode.views / episode.movie.views) * 100) 
        : 0
    });
  } catch (error) {
    logger.error('Error fetching episode view stats:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy thống kê lượt xem tập phim' });
  }
};

// Lấy danh sách phim có nhiều lượt xem nhất
export const getTopViewedMovies = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    
    const topMovies = await Movie.findAll({
      attributes: ['id', 'title', 'views', 'posterUrl'],
      order: [['views', 'DESC']],
      limit: Number(limit)
    });
    
    return res.status(200).json(topMovies);
  } catch (error) {
    logger.error('Error fetching top viewed movies:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách phim xem nhiều nhất' });
  }
};

// Lấy danh sách tập phim có nhiều lượt xem nhất
export const getTopViewedEpisodes = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    
    const topEpisodes = await Episode.findAll({
      attributes: ['id', 'episodeNumber', 'views', 'movieId'],
      include: [
        {
          model: Movie,
          attributes: ['title', 'posterUrl']
        }
      ],
      order: [['views', 'DESC']],
      limit: Number(limit)
    });
    
    return res.status(200).json(topEpisodes);
  } catch (error) {
    logger.error('Error fetching top viewed episodes:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách tập phim xem nhiều nhất' });
  }
}; 