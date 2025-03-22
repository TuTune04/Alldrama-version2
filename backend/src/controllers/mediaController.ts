import { Logger } from '../utils/logger';
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import fetch from 'node-fetch';
import { 
  uploadFileToR2, 
  downloadFromR2, 
  generatePresignedUrl, 
  deleteFileFromR2,
  deleteHlsFiles,
  uploadDirectoryToR2
} from '../services/media/r2Service';
import { 
  convertToHls, 
  createThumbnail, 
  getVideoMetadata 
} from '../services/media/hlsService';
import { Episode } from '../models/Episode';
import { Movie } from '../models/Movie';
import { UserWatchHistory } from '../models/UserWatchHistory';
import sequelize from '../config/database';

const logger = Logger.getLogger('mediaController');

// Upload poster phim
export const uploadMoviePoster = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId } = req.params;
    const file = req.file;
    
    if (!file) {
      res.status(400).json({ message: 'Không tìm thấy file' });
      return;
    }
    
    // Tạo key cho file trên R2
    const key = `movies/${movieId}/poster${path.extname(file.originalname)}`;
    
    // Upload lên R2
    const fileUrl = await uploadFileToR2(file.path, key, file.mimetype);
    
    // Cập nhật URL trong database
    await Movie.update({ posterUrl: fileUrl }, { where: { id: movieId } });
    
    // Xóa file tạm
    fs.unlinkSync(file.path);
    
    // Trả về URL của file
    res.status(200).json({
      message: 'Upload poster thành công',
      url: fileUrl
    });
  } catch (error) {
    logger.error('Lỗi khi upload poster:', error);
    
    // Xóa file tạm nếu có lỗi
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: 'Lỗi khi upload poster' });
  }
};

// Upload backdrop phim
export const uploadMovieBackdrop = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId } = req.params;
    const file = req.file;
    
    if (!file) {
      res.status(400).json({ message: 'Không tìm thấy file' });
      return;
    }
    
    // Tạo key cho file trên R2
    const key = `movies/${movieId}/backdrop${path.extname(file.originalname)}`;
    
    // Upload lên R2
    const fileUrl = await uploadFileToR2(file.path, key, file.mimetype);
    
    // Cập nhật URL trong database - thêm trường backdropUrl vào Movie model nếu chưa có
    await Movie.update({ backdropUrl: fileUrl }, { where: { id: movieId } });
    
    // Xóa file tạm
    fs.unlinkSync(file.path);
    
    // Trả về URL của file
    res.status(200).json({
      message: 'Upload backdrop thành công',
      url: fileUrl
    });
  } catch (error) {
    logger.error('Lỗi khi upload backdrop:', error);
    
    // Xóa file tạm nếu có lỗi
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: 'Lỗi khi upload backdrop' });
  }
};

// Upload trailer phim
export const uploadMovieTrailer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId } = req.params;
    const file = req.file;
    
    if (!file) {
      res.status(400).json({ message: 'Không tìm thấy file' });
      return;
    }
    
    // Tạo key cho file trên R2
    const key = `movies/${movieId}/trailer${path.extname(file.originalname)}`;
    
    // Upload lên R2
    const fileUrl = await uploadFileToR2(file.path, key, file.mimetype);
    
    // Tạo thumbnail từ trailer
    const thumbnailPath = path.join(__dirname, '../../uploads/temp', `trailer-thumb-${movieId}.jpg`);
    await createThumbnail(file.path, thumbnailPath);
    
    // Upload thumbnail
    const thumbnailKey = `movies/${movieId}/trailer-thumb.jpg`;
    const thumbnailUrl = await uploadFileToR2(thumbnailPath, thumbnailKey, 'image/jpeg');
    
    // Cập nhật URL trong database
    await Movie.update({ 
      trailerUrl: fileUrl,
      trailerThumbnailUrl: thumbnailUrl
    }, { where: { id: movieId } });
    
    // Xóa file tạm
    fs.unlinkSync(file.path);
    fs.unlinkSync(thumbnailPath);
    
    // Trả về URL của file
    res.status(200).json({
      message: 'Upload trailer thành công',
      trailerUrl: fileUrl,
      thumbnailUrl: thumbnailUrl
    });
  } catch (error) {
    logger.error('Lỗi khi upload trailer:', error);
    
    // Xóa file tạm nếu có lỗi
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: 'Lỗi khi upload trailer' });
  }
};

// Upload và xử lý video tập phim
export const uploadEpisodeVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId, episodeId } = req.params;
    const file = req.file;
    
    if (!file) {
      res.status(400).json({ message: 'Không tìm thấy file' });
      return;
    }
    
    // Tạo thư mục HLS output
    const hlsOutputDir = path.join(__dirname, '../../uploads/hls', episodeId.toString());
    if (!fs.existsSync(hlsOutputDir)) {
      fs.mkdirSync(hlsOutputDir, { recursive: true });
    }
    
    // Upload video gốc lên R2
    const originalKey = `episodes/${movieId}/${episodeId}/original${path.extname(file.originalname)}`;
    const originalUrl = await uploadFileToR2(file.path, originalKey, file.mimetype);
    
    // Tạo thumbnail
    const thumbnailPath = path.join(__dirname, '../../uploads/temp', `thumbnail-${episodeId}.jpg`);
    await createThumbnail(file.path, thumbnailPath);
    
    // Upload thumbnail lên R2
    const thumbnailKey = `episodes/${movieId}/${episodeId}/thumbnail.jpg`;
    const thumbnailUrl = await uploadFileToR2(thumbnailPath, thumbnailKey, 'image/jpeg');
    
    // Lấy metadata video để biết thời lượng
    const metadata = await getVideoMetadata(file.path);
    const duration = Math.floor(parseFloat(metadata.format?.duration || '0'));
    
    // Bắt đầu xử lý HLS
    res.status(202).json({
      message: 'Đã nhận video, đang xử lý HLS',
      originalUrl,
      thumbnailUrl,
      processingStatus: 'processing',
      estimatedDuration: duration
    });
    
    // Xử lý HLS bất đồng bộ sau khi đã trả về response
    convertToHls(file.path, hlsOutputDir, movieId, episodeId)
      .then(async (hlsUrls) => {
        logger.debug('HLS URLs:', hlsUrls);
        
        // Cập nhật URL trong database
        await Episode.update(
          { 
            playlistUrl: `https://${process.env.CLOUDFLARE_DOMAIN}/hls/episodes/${movieId}/${episodeId}/hls/master.m3u8`,
            thumbnailUrl,
            duration,
            isProcessed: true
          }, 
          { where: { id: episodeId } }
        );
        
        logger.debug(`Xử lý HLS thành công cho episode ${episodeId}`);
        
        // Xóa file tạm
        fs.unlinkSync(file.path);
        fs.unlinkSync(thumbnailPath);
        fs.rmSync(hlsOutputDir, { recursive: true, force: true });
      })
      .catch(error => {
        logger.error(`Lỗi khi xử lý HLS cho episode ${episodeId}:`, error);
        
        // Cập nhật trạng thái lỗi
        Episode.update(
          { 
            isProcessed: false,
            processingError: error.message
          }, 
          { where: { id: episodeId } }
        ).catch(console.error);
        
        // Xóa file tạm
        try {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
          if (fs.existsSync(hlsOutputDir)) fs.rmSync(hlsOutputDir, { recursive: true, force: true });
        } catch (e) {
          logger.error('Lỗi khi xóa file tạm:', e);
        }
      });
  } catch (error) {
    logger.error('Lỗi khi upload video:', error);
    
    // Xóa file tạm nếu có lỗi
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: 'Lỗi khi upload video' });
  }
};

// Tạo presigned URL cho upload trực tiếp
export const getPresignedUploadUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId, episodeId, fileType } = req.body;
    
    if (!movieId || !fileType) {
      res.status(400).json({ message: 'Thiếu thông tin cần thiết' });
      return;
    }
    
    let key: string;
    let contentType: string;
    
    // Xác định key và content type dựa vào loại file
    if (fileType === 'poster') {
      key = `movies/${movieId}/poster.jpg`;
      contentType = 'image/jpeg';
    } else if (fileType === 'backdrop') {
      key = `movies/${movieId}/backdrop.jpg`;
      contentType = 'image/jpeg';
    } else if (fileType === 'trailer') {
      key = `movies/${movieId}/trailer.mp4`;
      contentType = 'video/mp4';
    } else if (fileType === 'video' && episodeId) {
      key = `episodes/${movieId}/${episodeId}/original.mp4`;
      contentType = 'video/mp4';
    } else if (fileType === 'thumbnail' && episodeId) {
      key = `episodes/${movieId}/${episodeId}/thumbnail.jpg`;
      contentType = 'image/jpeg';
    } else {
      res.status(400).json({ message: 'Loại file không hợp lệ' });
      return;
    }
    
    // Tạo presigned URL
    const presignedUrl = await generatePresignedUrl(key, contentType);
    
    res.status(200).json({
      presignedUrl,
      key,
      contentType,
      cdnUrl: `https://${process.env.CLOUDFLARE_DOMAIN}/${key}`
    });
  } catch (error) {
    logger.error('Lỗi khi tạo presigned URL:', error);
    res.status(500).json({ message: 'Lỗi khi tạo presigned URL' });
  }
};

/**
 * Xóa media (poster, backdrop, trailer) của phim
 */
export const deleteMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId, mediaType } = req.params;
    
    // Xác định key trong R2
    let key: string;
    let updateField: string;
    
    switch (mediaType) {
      case 'poster':
        key = `movies/${movieId}/poster.jpg`;
        updateField = 'posterUrl';
        break;
      case 'backdrop':
        key = `movies/${movieId}/backdrop.jpg`;
        updateField = 'backdropUrl';
        break;
      case 'trailer':
        key = `movies/${movieId}/trailer.mp4`;
        updateField = 'trailerUrl';
        break;
      default:
        res.status(400).json({ success: false, error: 'Loại media không hợp lệ' });
        return;
    }
    
    // Xóa file từ R2
    await deleteFileFromR2(key);
    
    // Cập nhật database
    await Movie.update({ [updateField]: null }, { where: { id: movieId } });
    
    res.json({
      success: true,
      message: `Đã xóa ${mediaType} thành công`
    });
  } catch (error) {
    logger.error('Error deleting media:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định'
    });
  }
};

/**
 * Xóa tập phim và tất cả file liên quan
 */
export const deleteEpisode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId, episodeId } = req.params;
    
    // Tìm thông tin episode trước khi xóa
    const episode = await Episode.findByPk(episodeId);
    
    if (!episode) {
      res.status(404).json({ success: false, error: 'Không tìm thấy tập phim' });
      return;
    }
    
    // 1. Xóa file video gốc
    try {
      await deleteFileFromR2(`episodes/${movieId}/${episodeId}/original.mp4`);
    } catch (err) {
      logger.warn(`Cảnh báo: Không thể xóa video gốc của tập ${episodeId}:`, err);
    }
    
    // 2. Xóa thumbnail
    try {
      await deleteFileFromR2(`episodes/${movieId}/${episodeId}/thumbnail.jpg`);
    } catch (err) {
      logger.warn(`Cảnh báo: Không thể xóa thumbnail của tập ${episodeId}:`, err);
    }
    
    // 3. Xóa tất cả file HLS
    try {
      await deleteHlsFiles(movieId, episodeId);
    } catch (err) {
      logger.warn(`Cảnh báo: Không thể xóa một số file HLS của tập ${episodeId}:`, err);
    }
    
    // 4. Xóa thông tin episode từ database
    await Episode.destroy({ where: { id: episodeId } });
    
    // 5. Xóa lịch sử xem liên quan
    await UserWatchHistory.destroy({ 
      where: { 
        movieId: Number(movieId),
        episodeId: Number(episodeId)
      } 
    });
    
    res.json({
      success: true,
      message: 'Đã xóa tập phim thành công'
    });
  } catch (error) {
    logger.error('Error deleting episode:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định'
    });
  }
};

/**
 * Xóa toàn bộ phim và tất cả tập phim, media liên quan
 */
export const deleteMovie = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId } = req.params;
    
    // Tìm thông tin phim trước khi xóa
    const movie = await Movie.findByPk(movieId, {
      include: [Episode]
    });
    
    if (!movie) {
      res.status(404).json({ success: false, error: 'Không tìm thấy phim' });
      return;
    }
    
    // Bắt đầu transaction để đảm bảo tính nhất quán
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Xóa tất cả media của phim (poster, backdrop, trailer)
      try {
        await deleteFileFromR2(`movies/${movieId}/poster.jpg`);
        await deleteFileFromR2(`movies/${movieId}/backdrop.jpg`);
        await deleteFileFromR2(`movies/${movieId}/trailer.mp4`);
      } catch (mediaError) {
        logger.warn('Cảnh báo: Không thể xóa một số file media:', mediaError);
        // Tiếp tục xử lý, không throw error
      }
      
      // 2. Xóa tất cả tập phim và file liên quan
      if (movie.episodes && movie.episodes.length > 0) {
        for (const episode of movie.episodes) {
          // Xóa file video gốc
          try {
            await deleteFileFromR2(`episodes/${movieId}/${episode.id}/original.mp4`);
            await deleteFileFromR2(`episodes/${movieId}/${episode.id}/thumbnail.jpg`);
            await deleteHlsFiles(movieId, episode.id);
          } catch (episodeError) {
            logger.warn(`Cảnh báo: Không thể xóa file của tập ${episode.id}:`, episodeError);
            // Tiếp tục xử lý
          }
        }
      }
      
      // 3. Xóa tất cả lịch sử xem liên quan
      await UserWatchHistory.destroy({ 
        where: { movieId: Number(movieId) },
        transaction
      });
      
      // 4. Xóa tất cả tập phim từ database
      await Episode.destroy({ 
        where: { movieId: Number(movieId) },
        transaction
      });
      
      // 5. Xóa phim từ database
      await Movie.destroy({ 
        where: { id: Number(movieId) },
        transaction
      });
      
      // Commit transaction nếu tất cả thành công
      await transaction.commit();
      
      res.json({
        success: true,
        message: 'Đã xóa phim và tất cả tập phim thành công'
      });
    } catch (txError) {
      // Rollback nếu có lỗi
      await transaction.rollback();
      throw txError;
    }
  } catch (error) {
    logger.error('Error deleting movie:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định'
    });
  }
};

// Lấy trạng thái xử lý video
export const getVideoProcessingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { episodeId } = req.params;
    
    // Lấy thông tin episode từ database
    const episode = await Episode.findByPk(episodeId);
    
    if (!episode) {
      res.status(404).json({ message: 'Không tìm thấy tập phim' });
      return;
    }
    
    res.status(200).json({
      episodeId,
      isProcessed: episode.isProcessed,
      processingError: episode.processingError,
      playlistUrl: episode.playlistUrl,
      thumbnailUrl: episode.thumbnailUrl
    });
  } catch (error) {
    logger.error('Lỗi khi lấy trạng thái xử lý video:', error);
    res.status(500).json({ message: 'Lỗi khi lấy trạng thái xử lý video' });
  }
};

// Hàm xử lý yêu cầu từ Worker
export const processVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.debug("Received process-video request");
    logger.debug("Headers:", req.headers);
    logger.debug("Body:", req.body);
    
    // Xác thực Worker Secret
    const workerSecret = req.header('X-Worker-Secret');
    if (workerSecret !== process.env.WORKER_SECRET && workerSecret !== 'alldrama-worker-secret') {
      logger.debug("Unauthorized request - invalid worker secret");
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const { videoKey, movieId, episodeId, jobId, callbackUrl } = req.body;
    
    if (!videoKey || !movieId || !episodeId) {
      logger.debug("Missing required fields");
      res.status(400).json({ 
        success: false,
        error: "Missing required fields: videoKey, movieId, or episodeId" 
      });
      return;
    }
    
    // Ghi log yêu cầu xử lý
    logger.info(`Processing video: ${videoKey} for movie ${movieId}, episode ${episodeId}`);
    
    // Tạo job ID nếu chưa có
    const processJobId = jobId || `job-${Date.now()}`;
    
    // Cập nhật trạng thái episode là đang xử lý
    try {
      await Episode.update(
        { isProcessed: false, processingError: null },
        { where: { id: episodeId, movieId } }
      );
    } catch (dbError) {
      logger.error("Lỗi khi cập nhật trạng thái episode:", dbError);
    }
    
    // Trả về response ngay để Worker không phải đợi
    res.json({ 
      success: true,
      jobId: processJobId
    });
    
    // Xử lý bất đồng bộ
    (async () => {
      try {
        // Tạo thư mục tạm để xử lý
        const tempDir = path.join(os.tmpdir(), `hls-${processJobId}`);
        fs.mkdirSync(tempDir, { recursive: true });
        
        const outputDir = path.join(tempDir, 'hls');
        fs.mkdirSync(outputDir, { recursive: true });
        
        // Tải video từ R2
        const localVideoPath = path.join(tempDir, 'original.mp4');
        logger.info(`Downloading video from R2: ${videoKey} to ${localVideoPath}`);
        
        await downloadFromR2(videoKey, localVideoPath);
        logger.info('Download complete, starting HLS conversion');
        
        // Tạo thumbnail
        const thumbnailPath = path.join(tempDir, 'thumbnail.jpg');
        await createThumbnail(localVideoPath, thumbnailPath);
        logger.info('Thumbnail created');
        
        // Upload thumbnail lên R2
        const thumbnailKey = `episodes/${movieId}/${episodeId}/thumbnail.jpg`;
        await uploadFileToR2(thumbnailPath, thumbnailKey, 'image/jpeg');
        logger.info('Thumbnail uploaded to R2');
        
        // Chuyển đổi video sang HLS
        await convertToHls(localVideoPath, outputDir, movieId, episodeId);
        logger.info('HLS conversion complete');
        
        // Cập nhật trạng thái episode
        const playlistUrl = `https://${process.env.CLOUDFLARE_DOMAIN}/hls/episodes/${movieId}/${episodeId}/hls/master.m3u8`;
        const thumbnailUrl = `https://${process.env.CLOUDFLARE_DOMAIN}/${thumbnailKey}`;
        
        await Episode.update(
          {
            isProcessed: true,
            processingError: null,
            playlistUrl,
            thumbnailUrl
          },
          { where: { id: episodeId, movieId } }
        );
        logger.info(`Episode ${episodeId} updated as processed`);
        
        // Gọi callback URL để thông báo cho Worker
        if (callbackUrl) {
          try {
            await fetch(callbackUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Backend-Secret': process.env.BACKEND_SECRET || 'alldrama-backend-secret'
              },
              body: JSON.stringify({
                status: 'completed',
                movieId,
                episodeId,
                jobId: processJobId
              })
            });
            logger.info(`Callback sent to ${callbackUrl}`);
          } catch (callbackError) {
            logger.error('Error calling worker callback:', callbackError);
          }
        }
        
        // Dọn dẹp thư mục tạm
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
          logger.debug(`Cleaned up temp directory: ${tempDir}`);
        } catch (cleanupError) {
          logger.warn('Error cleaning temp directory:', cleanupError);
        }
      } catch (processingError) {
        logger.error('Error processing video:', processingError);
        
        // Cập nhật trạng thái lỗi
        try {
          await Episode.update(
            {
              isProcessed: false,
              processingError: processingError instanceof Error 
                ? processingError.message 
                : 'Unknown error during processing'
            },
            { where: { id: episodeId, movieId } }
          );
        } catch (dbError) {
          logger.error('Error updating episode status:', dbError);
        }
        
        // Gọi callback với lỗi
        if (callbackUrl) {
          try {
            await fetch(callbackUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Backend-Secret': process.env.BACKEND_SECRET || 'alldrama-backend-secret'
              },
              body: JSON.stringify({
                status: 'error',
                error: processingError instanceof Error 
                  ? processingError.message 
                  : 'Unknown error during processing',
                movieId,
                episodeId,
                jobId: processJobId
              })
            });
          } catch (callbackError) {
            logger.error('Error calling worker callback:', callbackError);
          }
        }
      }
    })();
  } catch (error: unknown) {
    logger.error('Error processing video:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 