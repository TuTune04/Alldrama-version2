import { Request, Response } from 'express';
import { Episode } from '../models/Episode';
import { Movie } from '../models/Movie';

// Lấy danh sách tập phim của một phim
export const getEpisodesByMovieId = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;
    
    // Kiểm tra phim có tồn tại không
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }
    
    const episodes = await Episode.findAll({
      where: { movieId },
      order: [['episodeNumber', 'ASC']]
    });
    
    return res.status(200).json(episodes);
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách tập phim' });
  }
};

// Lấy chi tiết tập phim
export const getEpisodeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const episode = await Episode.findByPk(id, {
      include: [Movie]
    });
    
    if (!episode) {
      return res.status(404).json({ message: 'Không tìm thấy tập phim' });
    }
    
    return res.status(200).json(episode);
  } catch (error) {
    console.error('Error fetching episode:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy thông tin tập phim' });
  }
};

// Tạo tập phim mới
export const createEpisode = async (req: Request, res: Response) => {
  try {
    const { movieId, episodeNumber, playlistUrl } = req.body;
    
    // Kiểm tra phim có tồn tại không
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }
    
    // Kiểm tra số tập đã tồn tại chưa
    const existingEpisode = await Episode.findOne({
      where: {
        movieId,
        episodeNumber
      }
    });
    
    if (existingEpisode) {
      return res.status(400).json({ message: 'Số tập này đã tồn tại' });
    }
    
    // Tạo tập phim mới
    const newEpisode = await Episode.create({
      movieId,
      episodeNumber,
      playlistUrl,
      views: 0
    });
    
    // Cập nhật tổng số tập cho phim
    const episodeCount = await Episode.count({ where: { movieId } });
    await movie.update({ totalEpisodes: episodeCount });
    
    return res.status(201).json({
      message: 'Tạo tập phim thành công',
      episode: newEpisode
    });
  } catch (error) {
    console.error('Error creating episode:', error);
    return res.status(500).json({ message: 'Lỗi khi tạo tập phim mới' });
  }
};

// Cập nhật tập phim
export const updateEpisode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { episodeNumber, playlistUrl } = req.body;
    
    const episode = await Episode.findByPk(id);
    
    if (!episode) {
      return res.status(404).json({ message: 'Không tìm thấy tập phim' });
    }
    
    // Kiểm tra số tập đã tồn tại chưa nếu thay đổi số tập
    if (episodeNumber && episodeNumber !== episode.episodeNumber) {
      const existingEpisode = await Episode.findOne({
        where: {
          movieId: episode.movieId,
          episodeNumber
        }
      });
      
      if (existingEpisode) {
        return res.status(400).json({ message: 'Số tập này đã tồn tại' });
      }
    }
    
    // Cập nhật thông tin
    const updateData: any = {};
    
    if (episodeNumber) updateData.episodeNumber = episodeNumber;
    if (playlistUrl) updateData.playlistUrl = playlistUrl;
    
    await episode.update(updateData);
    
    return res.status(200).json({
      message: 'Cập nhật tập phim thành công',
      episode
    });
  } catch (error) {
    console.error('Error updating episode:', error);
    return res.status(500).json({ message: 'Lỗi khi cập nhật tập phim' });
  }
};

// Xóa tập phim
export const deleteEpisode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const episode = await Episode.findByPk(id);
    
    if (!episode) {
      return res.status(404).json({ message: 'Không tìm thấy tập phim' });
    }
    
    const movieId = episode.movieId;
    
    // Xóa tập phim
    await episode.destroy();
    
    // Cập nhật tổng số tập cho phim
    const movie = await Movie.findByPk(movieId);
    if (movie) {
      const episodeCount = await Episode.count({ where: { movieId } });
      await movie.update({ totalEpisodes: episodeCount });
    }
    
    return res.status(200).json({ message: 'Xóa tập phim thành công' });
  } catch (error) {
    console.error('Error deleting episode:', error);
    return res.status(500).json({ message: 'Lỗi khi xóa tập phim' });
  }
}; 