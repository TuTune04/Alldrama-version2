import path from 'path';
import fs from 'fs';
import { 
  uploadFileToR2, 
  generatePresignedUrl, 
  deleteFileFromR2,
  deleteHlsFiles
} from './r2Service';
import { 
  convertToHls, 
  createThumbnail, 
  getVideoMetadata 
} from './hlsService';
import { Episode } from '../../models/Episode';
import { Movie } from '../../models/Movie';
import { UserWatchHistory } from '../../models/UserWatchHistory';
import sequelize from '../../config/database';

/**
 * Service xử lý media (ảnh, video)
 */
export class MediaService {
  /**
   * Upload poster cho phim
   */
  public async uploadMoviePoster(movieId: number, file: Express.Multer.File): Promise<string> {
    try {
      // Tạo key cho file trên R2
      const key = `movies/${movieId}/poster${path.extname(file.originalname)}`;
      
      // Upload lên R2
      const fileUrl = await uploadFileToR2(file.path, key, file.mimetype);
      
      // Cập nhật URL trong database
      await Movie.update({ posterUrl: fileUrl }, { where: { id: movieId } });
      
      // Xóa file tạm
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      return fileUrl;
    } catch (error) {
      // Xóa file tạm nếu có lỗi
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      throw error;
    }
  }
  
  /**
   * Upload backdrop cho phim
   */
  public async uploadMovieBackdrop(movieId: number, file: Express.Multer.File): Promise<string> {
    try {
      // Tạo key cho file trên R2
      const key = `movies/${movieId}/backdrop${path.extname(file.originalname)}`;
      
      // Upload lên R2
      const fileUrl = await uploadFileToR2(file.path, key, file.mimetype);
      
      // Cập nhật URL trong database
      await Movie.update({ backdropUrl: fileUrl }, { where: { id: movieId } });
      
      // Xóa file tạm
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      return fileUrl;
    } catch (error) {
      // Xóa file tạm nếu có lỗi
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      throw error;
    }
  }
  
  /**
   * Upload video trailer cho phim
   */
  public async uploadMovieTrailer(movieId: number, file: Express.Multer.File): Promise<string> {
    try {
      // Tạo key cho file trên R2
      const key = `movies/${movieId}/trailer${path.extname(file.originalname)}`;
      
      // Upload lên R2
      const fileUrl = await uploadFileToR2(file.path, key, file.mimetype);
      
      // Cập nhật URL trong database
      await Movie.update({ trailerUrl: fileUrl }, { where: { id: movieId } });
      
      // Xóa file tạm
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      return fileUrl;
    } catch (error) {
      // Xóa file tạm nếu có lỗi
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      throw error;
    }
  }
  
  /**
   * Upload video tập phim
   */
  public async uploadEpisodeVideo(movieId: number, episodeId: number, file: Express.Multer.File): Promise<string> {
    try {
      // Tạo key cho file trên R2
      const key = `movies/${movieId}/episodes/${episodeId}/video${path.extname(file.originalname)}`;
      
      // Upload lên R2
      const fileUrl = await uploadFileToR2(file.path, key, file.mimetype);
      
      // Cập nhật URL trong database
      await Episode.update({ videoUrl: fileUrl }, { where: { id: episodeId } });
      
      // Xóa file tạm
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      return fileUrl;
    } catch (error) {
      // Xóa file tạm nếu có lỗi
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      throw error;
    }
  }
  
  /**
   * Xóa media
   */
  public async deleteMedia(fileUrl: string): Promise<boolean> {
    try {
      // Trích xuất key từ URL
      const url = new URL(fileUrl);
      const key = url.pathname.substring(1); // Bỏ dấu / ở đầu
      
      // Xóa file trên R2
      await deleteFileFromR2(key);
      
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa media:', error);
      return false;
    }
  }
  
  /**
   * Tạo presigned URL cho upload trực tiếp
   */
  public async getPresignedUploadUrl(type: string, id: number, fileName: string): Promise<string> {
    // Tạo key dựa trên loại và ID
    let key = '';
    
    if (type === 'movie-poster') {
      key = `movies/${id}/poster${path.extname(fileName)}`;
    } else if (type === 'movie-backdrop') {
      key = `movies/${id}/backdrop${path.extname(fileName)}`;
    } else if (type === 'movie-trailer') {
      key = `movies/${id}/trailer${path.extname(fileName)}`;
    } else if (type === 'episode-video') {
      key = `movies/${id.toString().split('-')[0]}/episodes/${id.toString().split('-')[1]}/video${path.extname(fileName)}`;
    } else {
      throw new Error('Loại tài nguyên không hợp lệ');
    }
    
    // Tạo presigned URL
    const presignedUrl = await generatePresignedUrl(key, path.extname(fileName));
    
    return presignedUrl;
  }
} 