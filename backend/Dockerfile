FROM node:18-slim AS builder

WORKDIR /app

# Cài đặt các dependencies cần thiết
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production image
FROM node:18-slim

WORKDIR /app

# Cài đặt ffmpeg cho xử lý video
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Cài đặt dependencies production-only
COPY package*.json ./
RUN npm ci --only=production

# Copy build artifacts từ builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts

# Copy tệp cấu hình
COPY .env.production ./.env
COPY tsconfig.json ./

# Tạo thư mục uploads và đảm bảo quyền truy cập đúng
RUN mkdir -p uploads/temp && chmod -R 777 uploads
RUN mkdir -p logs && chmod -R 777 logs
RUN chmod -R 777 /app/logs

# Cấp quyền sở hữu toàn bộ thư mục /app cho user node (quan trọng)
RUN chown -R node:node /app

# Mở cổng ứng dụng
EXPOSE 5000

# Thêm các biến môi trường cần thiết
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096 --enable-source-maps"

# Người dùng không đặc quyền
USER node

# Lệnh khởi động ứng dụng
CMD ["node", "dist/index.js"]

# Đảm bảo docker logs hiển thị đầy đủ
ENV NODE_OPTIONS="--enable-source-maps --unhandled-rejections=strict --trace-warnings"
