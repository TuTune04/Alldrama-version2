import { Logger } from '../../utils/logger';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const logger = Logger.getLogger('r2Service');

dotenv.config();

// Lấy thông tin từ biến môi trường
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET || 'alldrama-storage';

// Thiết lập client R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
});

// Upload file lên R2
export const uploadFileToR2 = async (
  filePath: string, 
  key: string, 
  contentType: string
): Promise<string> => {
  try {
    const fileContent = fs.readFileSync(filePath);
    
    const params = {
      Bucket: R2_BUCKET,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
    };
    
    await r2Client.send(new PutObjectCommand(params));
    
    // Trả về URL công khai
    return `https://${process.env.CLOUDFLARE_DOMAIN}/${key}`;
  } catch (error) {
    logger.error('Lỗi khi upload file lên R2:', error);
    throw error;
  }
};

// Download file từ R2
export const downloadFromR2 = async (
  key: string,
  outputPath: string
): Promise<void> => {
  try {
    const params = {
      Bucket: R2_BUCKET,
      Key: key,
    };
    
    const response = await r2Client.send(new GetObjectCommand(params));
    const { Body } = response;
    
    if (!Body) {
      throw new Error('Không tìm thấy dữ liệu');
    }
    
    // Xử lý nhiều loại Body khác nhau từ R2/S3
    // 1. Node.js Readable stream
    if (typeof (Body as any).pipe === 'function') {
      return new Promise<void>((resolve, reject) => {
        const writeStream = fs.createWriteStream(outputPath);
        (Body as any).pipe(writeStream);
        writeStream.on('finish', () => resolve());
        writeStream.on('error', reject);
      });
    }
    
    // 2. Web API ReadableStream
    if (typeof (Body as any).getReader === 'function') {
      const chunks: Uint8Array[] = [];
      const reader = (Body as any).getReader();
      
      let done = false;
      while (!done) {
        const { done: isDone, value } = await reader.read();
        done = isDone;
        if (value) {
          chunks.push(value);
        }
      }
      
      const buffer = Buffer.concat(chunks);
      fs.writeFileSync(outputPath, buffer);
      return;
    }
    
    // 3. AWS SDK v3 streaming
    try {
      const chunks: Buffer[] = [];
      // Sử dụng for-await với Body như một async iterable
      // @ts-ignore: AWS SDK v3 Body có thể là Async Iterable
      for await (const chunk of Body) {
        chunks.push(Buffer.from(chunk));
      }
      const buffer = Buffer.concat(chunks);
      fs.writeFileSync(outputPath, buffer);
      return;
    } catch (streamError) {
      // Ghi log lỗi nhưng tiếp tục thử các phương thức khác
      logger.debug('Không thể xử lý Body như Async Iterable:', streamError);
    }
    
    // 4. Phương thức transformToByteArray
    if (typeof (Body as any).transformToByteArray === 'function') {
      try {
        const bytes = await (Body as any).transformToByteArray();
        fs.writeFileSync(outputPath, Buffer.from(bytes));
        return;
      } catch (err) {
        logger.debug('Không thể dùng transformToByteArray:', err);
      }
    }
    
    // 5. Xử lý Body là Buffer hoặc Uint8Array
    if (Buffer.isBuffer(Body) || Body instanceof Uint8Array) {
      fs.writeFileSync(outputPath, Body);
      return;
    }
    
    // 6. Xử lý Body là Blob
    if (typeof (Body as any).arrayBuffer === 'function') {
      try {
        const buffer = Buffer.from(await (Body as any).arrayBuffer());
        fs.writeFileSync(outputPath, buffer);
        return;
      } catch (err) {
        logger.debug('Không thể chuyển đổi Blob thành ArrayBuffer:', err);
      }
    }
    
    // 7. Body.body là một ReadableStream (thường gặp với node-fetch)
    if ((Body as any).body && typeof (Body as any).body.getReader === 'function') {
      const chunks: Uint8Array[] = [];
      const reader = (Body as any).body.getReader();
      
      let done = false;
      while (!done) {
        const { done: isDone, value } = await reader.read();
        done = isDone;
        if (value) {
          chunks.push(value);
        }
      }
      
      const buffer = Buffer.concat(chunks);
      fs.writeFileSync(outputPath, buffer);
      return;
    }
    
    // Log thông tin Body để debug
    logger.error('Không thể xử lý Body R2.', {
      bodyType: typeof Body,
      methods: Object.getOwnPropertyNames(Object.getPrototypeOf(Body) || {}).join(', '),
      hasBody: !!(Body as any).body,
      bodyBodyType: (Body as any).body ? typeof (Body as any).body : undefined
    });
    
    throw new Error('Không thể đọc dữ liệu: kiểu Body không được hỗ trợ');
  } catch (error) {
    logger.error('Lỗi khi download file từ R2:', error);
    throw error;
  }
};

// Tạo presigned URL cho upload trực tiếp
export const generatePresignedUrl = async (
  key: string,
  fileExtension: string,
  expiresIn = 3600 // 1 giờ mặc định
): Promise<string> => {
  // Xác định content type dựa vào phần mở rộng
  let contentType = 'application/octet-stream';
  if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
    contentType = 'image/jpeg';
  } else if (fileExtension === '.png') {
    contentType = 'image/png';
  } else if (fileExtension === '.mp4') {
    contentType = 'video/mp4';
  } else if (fileExtension === '.webm') {
    contentType = 'video/webm';
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  
  // Ghi log thông tin đang tạo URL
  logger.debug(`Tạo presigned URL cho key=${key}, contentType=${contentType}, expiresIn=${expiresIn}s`);
  
  return await getSignedUrl(r2Client, command, { expiresIn });
};

// Xóa file từ R2
export const deleteFileFromR2 = async (key: string): Promise<void> => {
  const params = {
    Bucket: R2_BUCKET,
    Key: key,
  };
  
  try {
    await r2Client.send(new DeleteObjectCommand(params));
  } catch (error) {
    logger.error('Lỗi khi xóa file từ R2:', error);
    throw error;
  }
};

// Liệt kê files
export const listFiles = async (prefix: string): Promise<string[]> => {
  const params = {
    Bucket: R2_BUCKET,
    Prefix: prefix,
  };
  
  try {
    const data = await r2Client.send(new ListObjectsCommand(params));
    return (data.Contents || []).map(item => item.Key || '');
  } catch (error) {
    logger.error('Lỗi khi liệt kê files từ R2:', error);
    throw error;
  }
};

// Upload nhiều files trong một thư mục
export const uploadDirectoryToR2 = async (
  localDir: string,
  r2Prefix: string
): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  
  // Đọc tất cả files trong thư mục
  const files = fs.readdirSync(localDir);
  
  for (const file of files) {
    const localPath = path.join(localDir, file);
    const stats = fs.statSync(localPath);
    
    if (stats.isFile()) {
      // Xác định ContentType dựa vào phần mở rộng
      let contentType = 'application/octet-stream';
      if (file.endsWith('.m3u8')) contentType = 'application/x-mpegURL';
      else if (file.endsWith('.ts')) contentType = 'video/MP2T';
      else if (file.endsWith('.m4s')) contentType = 'video/iso.segment';
      else if (file.endsWith('.mp4')) contentType = 'video/mp4';
      else if (file.endsWith('.jpg') || file.endsWith('.jpeg')) contentType = 'image/jpeg';
      else if (file.endsWith('.png')) contentType = 'image/png';
      
      // Upload file
      const r2Key = `${r2Prefix}/${file}`;
      const url = await uploadFileToR2(localPath, r2Key, contentType);
      uploadedUrls.push(url);
    }
  }
  
  return uploadedUrls;
};

/**
 * Xóa tất cả các file HLS của một tập phim
 * @param movieId ID của phim
 * @param episodeId ID của tập phim
 */
export const deleteHlsFiles = async (movieId: string | number, episodeId: string | number): Promise<void> => {
  try {
    // Liệt kê tất cả các file trong thư mục HLS
    const hlsPrefix = `episodes/${movieId}/${episodeId}/hls/`;
    const files = await listFiles(hlsPrefix);
    
    // Nếu không có file nào, return luôn
    if (files.length === 0) {
      logger.debug(`Không tìm thấy file HLS nào trong ${hlsPrefix}`);
      return;
    }
    
    // Xóa từng file một
    for (const file of files) {
      await deleteFileFromR2(file);
    }
    
    logger.debug(`Đã xóa ${files.length} file HLS cho tập phim ${episodeId} của phim ${movieId}`);
  } catch (error) {
    logger.error(`Lỗi khi xóa file HLS: ${error}`);
    throw error;
  }
}; 