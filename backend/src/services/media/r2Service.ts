import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

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
    console.error('Lỗi khi upload file lên R2:', error);
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
    
    const { Body } = await r2Client.send(new GetObjectCommand(params));
    
    if (!Body) {
      throw new Error('Không tìm thấy dữ liệu');
    }
    
    // Chuyển đổi ReadableStream thành Buffer
    const chunks: Uint8Array[] = [];
    const stream = Body as unknown as ReadableStream;
    const reader = stream.getReader();
    
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
  } catch (error) {
    console.error('Lỗi khi download file từ R2:', error);
    throw error;
  }
};

// Tạo presigned URL cho upload trực tiếp
export const generatePresignedUrl = async (
  key: string,
  contentType: string,
  expiresIn = 3600 // 1 giờ
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  
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
    console.error('Lỗi khi xóa file từ R2:', error);
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
    console.error('Lỗi khi liệt kê files từ R2:', error);
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
      console.log(`Không tìm thấy file HLS nào trong ${hlsPrefix}`);
      return;
    }
    
    // Xóa từng file một
    for (const file of files) {
      await deleteFileFromR2(file);
    }
    
    console.log(`Đã xóa ${files.length} file HLS cho tập phim ${episodeId} của phim ${movieId}`);
  } catch (error) {
    console.error(`Lỗi khi xóa file HLS: ${error}`);
    throw error;
  }
}; 