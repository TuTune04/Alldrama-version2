import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { uploadDirectoryToR2 } from './r2Service';
import dotenv from 'dotenv';

dotenv.config();

// Các độ phân giải và bitrate cho HLS
const RESOLUTIONS = [
  { height: 240, bitrate: '400k' },
  { height: 360, bitrate: '700k' },
  { height: 480, bitrate: '1500k' },
  { height: 720, bitrate: '2500k' },
  { height: 1080, bitrate: '4500k' }
];

// Thời lượng segment (giây)
const HLS_SEGMENT_DURATION = process.env.HLS_SEGMENT_DURATION || '6';

// Chuyển đổi video sang HLS với fMP4
export const convertToHls = async (
  videoPath: string,
  outputDir: string,
  movieId: number | string,
  episodeId: number | string
): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tạo thư mục output nếu chưa tồn tại
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Tạo nội dung cho master playlist
      let masterPlaylist = '#EXTM3U\n#EXT-X-VERSION:7\n'; // Version 7 hỗ trợ fMP4
      
      // Mảng promises để theo dõi tất cả các quá trình ffmpeg
      const conversionPromises = [];
      
      // Tạo các phiên bản khác nhau cho HLS
      for (const resolution of RESOLUTIONS) {
        const { height, bitrate } = resolution;
        const outputFile = path.join(outputDir, `${height}p.m3u8`);
        
        // Tạo promise cho quá trình ffmpeg
        const conversionPromise = new Promise<void>((resolveConversion, rejectConversion) => {
          console.log(`Bắt đầu chuyển đổi độ phân giải ${height}p với bitrate ${bitrate}`);
          
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
          
          // Xử lý sự kiện khi ffmpeg hoàn thành
          ffmpeg.on('close', (code) => {
            if (code === 0) {
              console.log(`Đã hoàn thành chuyển đổi ${height}p`);
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
            console.log(`ffmpeg log: ${data.toString()}`);
          });
        });
        
        conversionPromises.push(conversionPromise);
      }
      
      // Đợi tất cả các quá trình chuyển đổi hoàn thành
      await Promise.all(conversionPromises);
      
      // Ghi master playlist
      fs.writeFileSync(path.join(outputDir, 'master.m3u8'), masterPlaylist);
      console.log('Đã tạo master playlist');
      
      // Upload toàn bộ thư mục HLS lên R2
      const r2HlsPath = `episodes/${movieId}/${episodeId}/hls`;
      const uploadedUrls = await uploadDirectoryToR2(outputDir, r2HlsPath);
      
      console.log(`Đã hoàn thành chuyển đổi HLS và upload cho episode ${episodeId}`);
      resolve(uploadedUrls);
    } catch (error) {
      console.error('Lỗi khi chuyển đổi video sang HLS:', error);
      reject(error);
    }
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
export const getVideoMetadata = async (videoPath: string): Promise<any> => {
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