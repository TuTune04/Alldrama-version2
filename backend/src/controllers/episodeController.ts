import { Request, Response } from 'express';
import { getEpisodeService } from '../services';

// Lấy danh sách tập phim của một phim
export const getEpisodesByMovieId = async (req: Request, res: Response) => {
  try {
    const episodeService = getEpisodeService();
    const { movieId } = req.params;
    
    const episodes = await episodeService.getEpisodesByMovieId(Number(movieId));
    
    return res.status(200).json(episodes);
  } catch (error) {
    console.error('Error fetching episodes:', error);
    if (error instanceof Error && error.message === 'Không tìm thấy phim') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách tập phim' });
  }
};

// Lấy chi tiết tập phim
export const getEpisodeById = async (req: Request, res: Response) => {
  try {
    const episodeService = getEpisodeService();
    const { id } = req.params;
    
    const episode = await episodeService.getEpisodeById(Number(id));
    
    return res.status(200).json(episode);
  } catch (error) {
    console.error('Error fetching episode:', error);
    if (error instanceof Error && error.message === 'Không tìm thấy tập phim') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Lỗi khi lấy thông tin tập phim' });
  }
};

// Tạo tập phim mới
export const createEpisode = async (req: Request, res: Response) => {
  try {
    const episodeService = getEpisodeService();
    const { movieId, episodeNumber, playlistUrl, title, description, thumbnailUrl, duration } = req.body;
    
    const newEpisode = await episodeService.createEpisode({
      movieId,
      episodeNumber,
      playlistUrl,
      title,
      description,
      thumbnailUrl,
      duration
    });
    
    return res.status(201).json({
      message: 'Tạo tập phim thành công',
      episode: newEpisode
    });
  } catch (error) {
    console.error('Error creating episode:', error);
    if (error instanceof Error) {
      if (error.message === 'Không tìm thấy phim') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Số tập này đã tồn tại') {
        return res.status(400).json({ message: error.message });
      }
    }
    return res.status(500).json({ message: 'Lỗi khi tạo tập phim mới' });
  }
};

// Cập nhật tập phim
export const updateEpisode = async (req: Request, res: Response) => {
  try {
    const episodeService = getEpisodeService();
    const { id } = req.params;
    const { episodeNumber, playlistUrl, title, description, thumbnailUrl, duration } = req.body;
    
    const updatedEpisode = await episodeService.updateEpisode(Number(id), {
      episodeNumber, 
      playlistUrl, 
      title, 
      description, 
      thumbnailUrl, 
      duration
    });
    
    return res.status(200).json({
      message: 'Cập nhật tập phim thành công',
      episode: updatedEpisode
    });
  } catch (error) {
    console.error('Error updating episode:', error);
    if (error instanceof Error) {
      if (error.message === 'Không tìm thấy tập phim') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Số tập này đã tồn tại') {
        return res.status(400).json({ message: error.message });
      }
    }
    return res.status(500).json({ message: 'Lỗi khi cập nhật tập phim' });
  }
};

// Xóa tập phim
export const deleteEpisode = async (req: Request, res: Response) => {
  try {
    const episodeService = getEpisodeService();
    const { id } = req.params;
    
    await episodeService.deleteEpisode(Number(id));
    
    return res.status(200).json({ message: 'Xóa tập phim thành công' });
  } catch (error) {
    console.error('Error deleting episode:', error);
    if (error instanceof Error && error.message === 'Không tìm thấy tập phim') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Lỗi khi xóa tập phim' });
  }
}; 