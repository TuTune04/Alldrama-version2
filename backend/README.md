# Alldrama Backend API

Backend API cho nền tảng xem phim Alldrama, được xây dựng bằng Node.js, Express và TypeScript.

## 🚀 Tính năng

- 🔐 Xác thực và Phân quyền người dùng
- 🎬 Quản lý phim và tập phim
- ❤️ Quản lý danh sách yêu thích
- 📊 Thống kê lượt xem
- 📝 Lịch sử xem phim
- 🎯 Genre và Phân loại phim
- 📤 Upload và quản lý media
- 🔄 Caching với Redis
- 📦 Lưu trữ file với AWS S3

## 🛠️ Công nghệ sử dụng

- Node.js
- Express.js
- TypeScript
- PostgreSQL (với Sequelize ORM)
- Redis
- AWS S3
- Jest (Testing)
- Docker

## 📋 Yêu cầu hệ thống

- Node.js (v14 trở lên)
- PostgreSQL
- Redis
- AWS Account (cho S3)

## 🔧 Cài đặt

1. Clone repository:

```bash
git clone https://github.com/your-repo/alldrama-backend.git
cd alldrama-backend
```

2. Cài đặt dependencies:

```bash
npm install
```

3. Tạo file .env từ mẫu:

```bash
cp .env.example .env
```

4. Cấu hình các biến môi trường trong file .env:

```env
# Server
PORT=8000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alldrama
DB_USER=your_user
DB_PASSWORD=your_password

# Redis
REDIS_URL=redis://localhost:6379

# AWS
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

5. Khởi tạo database:

```bash
npm run create-db
```

## 🚀 Chạy ứng dụng

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

## 🧪 Testing

Chạy unit tests:

```bash
npm test
```

Chạy tests với coverage:

```bash
npm run test:coverage
```

## 📚 API Documentation

API documentation được tạo tự động với Swagger và có thể truy cập tại:

```
http://localhost:8000/api-docs
```

### 🔑 API Endpoints chính

#### Authentication

- POST /api/auth/register - Đăng ký tài khoản mới
- POST /api/auth/login - Đăng nhập
- POST /api/auth/logout - Đăng xuất
- GET /api/auth/me - Lấy thông tin user hiện tại

#### Movies

- GET /api/movies - Lấy danh sách phim
- GET /api/movies/:id - Lấy chi tiết phim
- POST /api/movies - Thêm phim mới (Admin)
- PUT /api/movies/:id - Cập nhật phim (Admin)
- DELETE /api/movies/:id - Xóa phim (Admin)

#### Episodes

- GET /api/episodes/:id - Lấy chi tiết tập phim
- POST /api/episodes - Thêm tập phim mới (Admin)
- PUT /api/episodes/:id - Cập nhật tập phim (Admin)
- DELETE /api/episodes/:id - Xóa tập phim (Admin)

#### Users

- GET /api/users/profile - Lấy profile người dùng
- PUT /api/users/profile - Cập nhật profile
- GET /api/users/favorites - Lấy danh sách phim yêu thích
- POST /api/users/favorites - Thêm phim vào yêu thích

## 🔒 Security

- CORS được cấu hình cho frontend domains
- JWT authentication
- Password hashing với bcrypt
- Rate limiting cho API endpoints
- Input validation và sanitization

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

MIT License - xem [LICENSE](LICENSE) để biết thêm chi tiết.
