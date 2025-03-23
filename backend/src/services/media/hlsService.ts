import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { uploadDirectoryToR2 } from './r2Service';
import dotenv from 'dotenv';
import { Logger } from '../../utils/logger';

const logger = Logger.getLogger('HLSService');

dotenv.config();

// Các độ phân giải và bitrate cho HLS
const RESOLUTIONS = [
  { height: 240, bitrate: '400k' },
  { height: 360, bitrate: '700k' },
  { height: 480, bitrate: '1500k' },
  { height: 720, bitrate: '2500k' },
  { height: 1080, bitrate: '4500k' }
];

// Độ phân giải giảm thiểu cho video dài (trên 20 phút)
const REDUCED_RESOLUTIONS = [
  { height: 360, bitrate: '700k' },
  { height: 720, bitrate: '2500k' }
];

// Thời lượng segment (giây)
const HLS_SEGMENT_DURATION = process.env.HLS_SEGMENT_DURATION || '6';

// Thời gian tối đa xử lý (30 phút)
const MAX_PROCESSING_TIME = 30 * 60 * 1000;

// Chuyển đổi video sang HLS với fMP4
export const convertToHls = async (
  videoPath: string,
  outputDir: string,
  movieId: number | string,
  episodeId: number | string
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        // Tạo thư mục output nếu chưa tồn tại
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        // Kiểm tra thời lượng video để quyết định sử dụng bộ độ phân giải nào
        const metadata = await getVideoMetadata(videoPath);
        const duration = metadata.format?.duration ? parseFloat(metadata.format.duration) : 0;
        
        // Nếu video dài hơn 20 phút, sử dụng ít độ phân giải hơn
        const resolutionsToUse = duration > 1200 ? REDUCED_RESOLUTIONS : RESOLUTIONS;
        
        logger.info(`Video có thời lượng ${duration}s, sử dụng ${resolutionsToUse.length} độ phân giải`);
      
        // Tạo nội dung cho master playlist
        let masterPlaylist = '#EXTM3U\n#EXT-X-VERSION:7\n'; // Version 7 hỗ trợ fMP4
      
        // Mảng promises để theo dõi tất cả các quá trình ffmpeg
        const conversionPromises = [];
        
        // Theo dõi tiến độ xử lý
        let completedResolutions = 0;
        const totalResolutions = resolutionsToUse.length;
        
        // Thiết lập timeout cho toàn bộ quá trình
        const timeoutPromise = new Promise((_, timeoutReject) => {
          setTimeout(() => {
            timeoutReject(new Error(`Quá trình xử lý HLS đã vượt quá thời gian tối đa ${MAX_PROCESSING_TIME/60000} phút`));
          }, MAX_PROCESSING_TIME);
        });
      
        // Tạo các phiên bản khác nhau cho HLS
        for (const resolution of resolutionsToUse) {
          const { height, bitrate } = resolution;
          const outputFile = path.join(outputDir, `${height}p.m3u8`);
        
          // Tạo promise cho quá trình ffmpeg
          const conversionPromise = new Promise<void>((resolveConversion, rejectConversion) => {
            logger.info(`Bắt đầu chuyển đổi độ phân giải ${height}p với bitrate ${bitrate}`);
            
            // Thời gian bắt đầu cho một độ phân giải
            const startTime = Date.now();
          
            // Command ffmpeg để chuyển đổi video sang HLS với fMP4
            const ffmpeg = spawn('ffmpeg', [
              '-i', videoPath,
              '-profile:v', 'main',
              '-vf', `scale=-2:${height}`,
              '-c:v', 'h264',
              '-crf', '23',
              '-b:v', bitrate,
              '-c:a', 'aac',
              '-ar', '48000',
              '-b:a', '128k',
              '-hls_time', HLS_SEGMENT_DURATION,
              '-hls_list_size', '0',
              '-hls_segment_type', 'fmp4',  // Sử dụng fMP4 thay vì TS
              '-hls_fmp4_init_filename', `init-${height}p.mp4`,
              '-hls_segment_filename', path.join(outputDir, `segment_${height}p_%03d.m4s`),
              outputFile
            ]);
          
            // Giám sát tiến độ ffmpeg
            let progressPattern = /time=(\d+:\d+:\d+.\d+)/;
            ffmpeg.stderr.on('data', (data) => {
              const dataString = data.toString();
              const match = progressPattern.exec(dataString);
              if (match) {
                const timeStr = match[1];
                // Chuyển định dạng HH:MM:SS.MS sang giây
                const timeParts = timeStr.split(':');
                const progressSeconds = 
                  parseFloat(timeParts[0]) * 3600 + 
                  parseFloat(timeParts[1]) * 60 + 
                  parseFloat(timeParts[2]);
                const progressPercent = Math.round((progressSeconds / duration) * 100);
                
                // Ghi log tiến độ mỗi 10%
                if (progressPercent % 10 === 0) {
                  const elapsedTime = (Date.now() - startTime) / 1000; // giây
                  const timePerPercent = elapsedTime / progressPercent; // giây/phần trăm
                  const remainingTime = timePerPercent * (100 - progressPercent); // giây còn lại
                  
                  logger.info(`Độ phân giải ${height}p: ${progressPercent}% hoàn thành. Còn khoảng ${Math.round(remainingTime/60)} phút nữa.`);
                }
              }
            });
          
            // Xử lý sự kiện khi ffmpeg hoàn thành
            ffmpeg.on('close', (code) => {
              if (code === 0) {
                completedResolutions++;
                const elapsedTime = (Date.now() - startTime) / 1000; // giây
                logger.info(`Đã hoàn thành chuyển đổi ${height}p (${completedResolutions}/${totalResolutions}) trong ${Math.round(elapsedTime)}s`);
                
                // Thêm vào master playlist
                masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(bitrate) * 1000},RESOLUTION=${height}p\n`;
                masterPlaylist += `${height}p.m3u8\n`;
                resolveConversion();
              } else {
                rejectConversion(new Error(`ffmpeg exited with code ${code}`));
              }
            });
          
            // Xử lý lỗi
            ffmpeg.stderr.on('data', (data) => {
              logger.debug(`ffmpeg log: ${data.toString()}`);
            });
          });
        
          conversionPromises.push(conversionPromise);
        }
      
        // Đợi tất cả các quá trình chuyển đổi hoàn thành hoặc timeout
        await Promise.race([
          Promise.all(conversionPromises),
          timeoutPromise
        ]);
      
        // Ghi master playlist
        fs.writeFileSync(path.join(outputDir, 'master.m3u8'), masterPlaylist);
        logger.info('Đã tạo master playlist');
      
        // Upload toàn bộ thư mục HLS lên R2
        logger.info('Bắt đầu upload thư mục HLS lên R2');
        const uploadStartTime = Date.now();
        
        const r2HlsPath = `episodes/${movieId}/${episodeId}/hls`;
        const uploadedUrls = await uploadDirectoryToR2(outputDir, r2HlsPath);
        
        const uploadElapsedTime = (Date.now() - uploadStartTime) / 1000; // giây
        logger.info(`Đã upload xong HLS lên R2 trong ${Math.round(uploadElapsedTime)}s`);
      
        logger.info(`Đã hoàn thành chuyển đổi HLS và upload cho episode ${episodeId}`);
        resolve(uploadedUrls);
      } catch (error) {
        logger.error('Lỗi khi chuyển đổi video sang HLS:', error);
        reject(error);
      }
    })();
  });
};

// Tạo thumbnail từ video
export const createThumbnail = async (
  videoPath: string,
  outputPath: string,
  timeInSeconds = 10
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', videoPath,
      '-ss', timeInSeconds.toString(),
      '-vframes', '1',
      '-vf', 'scale=480:-1',
      '-q:v', '2',
      outputPath
    ]);
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });
};

// Lấy metadata của video
export interface VideoMetadata {
  format?: {
    duration?: string;
    bit_rate?: string;
    size?: string;
  };
  streams?: Array<{
    codec_type?: string;
    width?: number;
    height?: number;
    codec_name?: string;
    bit_rate?: string;
  }>;
}

export const getVideoMetadata = async (videoPath: string): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      videoPath
    ]);
    
    let output = '';
    
    ffprobe.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    ffprobe.on('close', (code) => {
      if (code === 0) {
        try {
          const metadata = JSON.parse(output);
          resolve(metadata);
        } catch (error) {
          reject(new Error('Cannot parse metadata'));
        }
      } else {
        reject(new Error(`ffprobe exited with code ${code}`));
      }
    });
  });
}; 