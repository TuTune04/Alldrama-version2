# Tài Liệu API AllDrama

Tài liệu này mô tả các API endpoints được sử dụng trong dự án AllDrama, bao gồm cấu trúc request/response và ví dụ sử dụng.

## Base URL

```
Development: http://localhost:3001/api
Staging: https://staging-api.alldrama.com/api
Production: https://api.alldrama.com/api
```

## Authentication

### Đăng Nhập

**Endpoint**: `POST /auth/login`

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "12345",
      "name": "Nguyen Van A",
      "email": "user@example.com",
      "avatar": "https://api.alldrama.com/avatars/12345.jpg"
    }
  }
}
```

**Status Codes**:

- `200 OK`: Đăng nhập thành công
- `400 Bad Request`: Thiếu thông tin đăng nhập
- `401 Unauthorized`: Email hoặc mật khẩu không đúng

### Đăng Ký

**Endpoint**: `POST /auth/register`

**Request Body**:

```json
{
  "name": "Nguyen Van A",
  "email": "user@example.com",
  "password": "your_password",
  "confirmPassword": "your_password"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "12345",
      "name": "Nguyen Van A",
      "email": "user@example.com",
      "avatar": null
    }
  }
}
```

**Status Codes**:

- `201 Created`: Đăng ký thành công
- `400 Bad Request`: Dữ liệu không hợp lệ hoặc thiếu thông tin
- `409 Conflict`: Email đã tồn tại

### Refresh Token

**Endpoint**: `POST /auth/refresh`

**Request Headers**:

```
Authorization: Bearer <refresh_token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Status Codes**:

- `200 OK`: Token refresh thành công
- `401 Unauthorized`: Refresh token không hợp lệ hoặc hết hạn

## Movies API

### Lấy Danh Sách Phim

**Endpoint**: `GET /movies`

**Query Parameters**:

- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số lượng phim mỗi trang (default: 20)
- `category` (optional): Lọc theo thể loại
- `year` (optional): Lọc theo năm phát hành
- `country` (optional): Lọc theo quốc gia
- `sort` (optional): Sắp xếp (popular, newest, rating)

**Response**:

```json
{
  "success": true,
  "data": {
    "movies": [
      {
        "id": "movie-1",
        "title": "Tiệm Ăn Dì Ghẻ",
        "originalTitle": "Tiệm Ăn Dì Ghẻ",
        "slug": "tiem-an-di-ghe",
        "poster": "https://api.alldrama.com/posters/tiem-an-di-ghe.jpg",
        "backdrop": "https://api.alldrama.com/backdrops/tiem-an-di-ghe.jpg",
        "year": 2022,
        "categories": ["Tình Cảm", "Gia Đình"],
        "country": "Việt Nam",
        "rating": 4.5,
        "description": "Một bộ phim về...",
        "episodes": 32,
        "status": "completed"
      }
      // ...
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 15,
      "totalItems": 300
    }
  }
}
```

**Status Codes**:

- `200 OK`: Lấy danh sách thành công
- `400 Bad Request`: Query parameters không hợp lệ

### Lấy Chi Tiết Phim

**Endpoint**: `GET /movies/:slug`

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "movie-1",
    "title": "Tiệm Ăn Dì Ghẻ",
    "originalTitle": "Tiệm Ăn Dì Ghẻ",
    "slug": "tiem-an-di-ghe",
    "poster": "https://api.alldrama.com/posters/tiem-an-di-ghe.jpg",
    "backdrop": "https://api.alldrama.com/backdrops/tiem-an-di-ghe.jpg",
    "year": 2022,
    "categories": ["Tình Cảm", "Gia Đình"],
    "country": "Việt Nam",
    "rating": 4.5,
    "description": "Một bộ phim về...",
    "director": "Nguyễn Văn A",
    "cast": ["Nghệ sĩ 1", "Nghệ sĩ 2"],
    "episodes": [
      {
        "id": "episode-1",
        "number": 1,
        "title": "Tập 1",
        "duration": 45,
        "thumbnail": "https://api.alldrama.com/thumbnails/tiem-an-di-ghe-1.jpg"
      }
      // ...
    ],
    "relatedMovies": [
      // Danh sách phim liên quan
    ]
  }
}
```

**Status Codes**:

- `200 OK`: Lấy chi tiết thành công
- `404 Not Found`: Không tìm thấy phim

### Lấy Chi Tiết Tập Phim

**Endpoint**: `GET /episodes/:id`

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "episode-1",
    "number": 1,
    "title": "Tập 1",
    "movieId": "movie-1",
    "movieTitle": "Tiệm Ăn Dì Ghẻ",
    "movieSlug": "tiem-an-di-ghe",
    "duration": 45,
    "sources": [
      {
        "quality": "720p",
        "url": "https://cdn.alldrama.com/videos/tiem-an-di-ghe-1-720p.mp4"
      },
      {
        "quality": "1080p",
        "url": "https://cdn.alldrama.com/videos/tiem-an-di-ghe-1-1080p.mp4"
      }
    ],
    "subtitles": [
      {
        "language": "Vietnamese",
        "url": "https://cdn.alldrama.com/subtitles/tiem-an-di-ghe-1-vi.vtt"
      }
    ],
    "nextEpisode": {
      "id": "episode-2",
      "number": 2
    },
    "prevEpisode": null
  }
}
```

**Status Codes**:

- `200 OK`: Lấy chi tiết thành công
- `404 Not Found`: Không tìm thấy tập phim

## User API

### Lấy Thông Tin Người Dùng

**Endpoint**: `GET /users/me`

**Headers**:

```
Authorization: Bearer <token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "12345",
    "name": "Nguyen Van A",
    "email": "user@example.com",
    "avatar": "https://api.alldrama.com/avatars/12345.jpg",
    "createdAt": "2023-01-15T10:30:00Z"
  }
}
```

**Status Codes**:

- `200 OK`: Lấy thông tin thành công
- `401 Unauthorized`: Token không hợp lệ hoặc hết hạn

### Cập Nhật Thông Tin Người Dùng

**Endpoint**: `PUT /users/me`

**Headers**:

```
Authorization: Bearer <token>
```

**Request Body**:

```json
{
  "name": "Nguyen Van A Updated",
  "avatar": "base64_encoded_image_data"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "12345",
    "name": "Nguyen Van A Updated",
    "email": "user@example.com",
    "avatar": "https://api.alldrama.com/avatars/12345-updated.jpg",
    "updatedAt": "2023-02-20T15:45:00Z"
  }
}
```

**Status Codes**:

- `200 OK`: Cập nhật thành công
- `400 Bad Request`: Dữ liệu không hợp lệ
- `401 Unauthorized`: Token không hợp lệ hoặc hết hạn

## Watchlist API

### Lấy Danh Sách Xem Sau

**Endpoint**: `GET /users/me/watchlist`

**Headers**:

```
Authorization: Bearer <token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "watchlist": [
      {
        "id": "movie-1",
        "title": "Tiệm Ăn Dì Ghẻ",
        "slug": "tiem-an-di-ghe",
        "poster": "https://api.alldrama.com/posters/tiem-an-di-ghe.jpg",
        "addedAt": "2023-03-10T09:15:00Z"
      }
      // ...
    ]
  }
}
```

**Status Codes**:

- `200 OK`: Lấy danh sách thành công
- `401 Unauthorized`: Token không hợp lệ hoặc hết hạn

### Thêm Phim Vào Danh Sách Xem Sau

**Endpoint**: `POST /users/me/watchlist`

**Headers**:

```
Authorization: Bearer <token>
```

**Request Body**:

```json
{
  "movieId": "movie-1"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Movie added to watchlist"
}
```

**Status Codes**:

- `200 OK`: Thêm thành công
- `400 Bad Request`: Movie ID không hợp lệ
- `401 Unauthorized`: Token không hợp lệ hoặc hết hạn
- `409 Conflict`: Phim đã có trong danh sách

### Xóa Phim Khỏi Danh Sách Xem Sau

**Endpoint**: `DELETE /users/me/watchlist/:movieId`

**Headers**:

```
Authorization: Bearer <token>
```

**Response**:

```json
{
  "success": true,
  "message": "Movie removed from watchlist"
}
```

**Status Codes**:

- `200 OK`: Xóa thành công
- `401 Unauthorized`: Token không hợp lệ hoặc hết hạn
- `404 Not Found`: Phim không có trong danh sách

## Error Responses

Tất cả các lỗi API đều tuân theo format sau:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message description",
    "details": {} // Optional additional details
  }
}
```

## Xử Lý Lỗi Trong Frontend

```typescript
try {
  const response = await axios.get(`${API_URL}/movies`);
  if (response.data.success) {
    // Xử lý dữ liệu thành công
    return response.data.data;
  }
} catch (error) {
  if (axios.isAxiosError(error) && error.response) {
    const { status, data } = error.response;

    // Xử lý các loại lỗi
    if (status === 401) {
      // Unauthorized - chuyển hướng đến trang login
    } else if (status === 404) {
      // Not found - hiển thị trang 404
    } else {
      // Lỗi khác - hiển thị thông báo lỗi
      console.error(`Error: ${data.error.message}`);
    }
  } else {
    // Network error hoặc lỗi không xác định
    console.error("Network error or unidentified error");
  }

  throw error;
}
```

## Thư Viện API Client

Project sử dụng Axios làm API client với cấu hình như sau:

```typescript
// src/lib/api.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for handling token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        if (response.data.success) {
          localStorage.setItem("token", response.data.data.token);
          apiClient.defaults.headers.common.Authorization = `Bearer ${response.data.data.token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```
