# Tài Liệu API Alldrama

## Giới thiệu

Tài liệu này mô tả các API endpoint có sẵn trong hệ thống backend Alldrama. Frontend developers có thể sử dụng tài liệu này để hiểu cách tương tác với backend.

## URL Cơ Sở

- **Development:** `http://localhost:8000`
- **Production:** `https://api.alldrama.tech`

## Authentication

Hầu hết các API yêu cầu authentication. API sử dụng JWT (JSON Web Token) để xác thực người dùng.

- Token được gửi qua header `Authorization` với prefix `Bearer`
- Ví dụ: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## HTTP Status Codes

- `200 OK`: Yêu cầu thành công
- `201 Created`: Tạo mới thành công
- `400 Bad Request`: Yêu cầu không hợp lệ
- `401 Unauthorized`: Không xác thực được
- `403 Forbidden`: Không có quyền
- `404 Not Found`: Không tìm thấy tài nguyên
- `409 Conflict`: Xung đột (ví dụ: email đã tồn tại)
- `500 Internal Server Error`: Lỗi server

## 1. Authentication API

### 1.1. Đăng ký tài khoản

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "email": "example@example.com",
  "password": "password123",
  "name": "Tên Người Dùng"
}
```

**Response (201):**

```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "user_id",
    "email": "example@example.com",
    "name": "Tên Người Dùng",
    "role": "user",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
}
```

### 1.2. Đăng nhập

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "email": "example@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "user_id",
    "email": "example@example.com",
    "name": "Tên Người Dùng",
    "role": "user",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
}
```

### 1.3. Đăng xuất

**Endpoint:** `POST /api/auth/logout`

**Headers:** Yêu cầu Authentication

**Response (200):**

```json
{
  "message": "Đăng xuất thành công"
}
```

### 1.4. Lấy thông tin người dùng hiện tại

**Endpoint:** `GET /api/auth/me`

**Headers:** Yêu cầu Authentication

**Response (200):**

```json
{
  "id": "user_id",
  "email": "example@example.com",
  "name": "Tên Người Dùng",
  "role": "user",
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

## 2. User API

### 2.1. Lấy danh sách người dùng (Admin)

**Endpoint:** `GET /api/users`

**Headers:** Yêu cầu Authentication (Admin)

**Query Parameters:**

- `page`: Số trang (mặc định: 1)
- `limit`: Số lượng mỗi trang (mặc định: 10)

**Response (200):**

```json
{
  "users": [
    {
      "id": "user_id",
      "email": "example@example.com",
      "name": "Tên Người Dùng",
      "role": "user",
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "totalUsers": 50
}
```

### 2.2. Lấy thông tin người dùng theo ID

**Endpoint:** `GET /api/users/:id`

**Headers:** Yêu cầu Authentication

**Response (200):**

```json
{
  "id": "user_id",
  "email": "example@example.com",
  "name": "Tên Người Dùng",
  "role": "user",
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

### 2.3. Cập nhật thông tin người dùng

**Endpoint:** `PUT /api/users/:id`

**Headers:** Yêu cầu Authentication

**Request Body:**

```json
{
  "name": "Tên Mới",
  "email": "newemail@example.com"
}
```

**Response (200):**

```json
{
  "id": "user_id",
  "email": "newemail@example.com",
  "name": "Tên Mới",
  "role": "user",
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

### 2.4. Xóa người dùng (Admin)

**Endpoint:** `DELETE /api/users/:id`

**Headers:** Yêu cầu Authentication (Admin)

**Response (200):**

```json
{
  "message": "Người dùng đã được xóa thành công"
}
```

## 3. Movie API

### 3.1. Tìm kiếm phim

**Endpoint:** `GET /api/movies/search`

**Query Parameters:**

- `query`: Từ khóa tìm kiếm
- `page`: Số trang (mặc định: 1)
- `limit`: Số lượng mỗi trang (mặc định: 10)
- `genre`: ID thể loại (tùy chọn)
- `year`: Năm phát hành (tùy chọn)

**Response (200):**

```json
{
  "movies": [
    {
      "id": "movie_id",
      "title": "Tên Phim",
      "description": "Mô tả phim",
      "releaseYear": 2023,
      "posterUrl": "url_to_poster",
      "trailerUrl": "url_to_trailer",
      "genres": ["Action", "Drama"],
      "episodes": 16,
      "rating": 8.5,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "totalMovies": 50
}
```

### 3.2. Lấy danh sách phim

**Endpoint:** `GET /api/movies`

**Query Parameters:**

- `page`: Số trang (mặc định: 1)
- `limit`: Số lượng mỗi trang (mặc định: 10)
- `sortBy`: Sắp xếp theo (mặc định: "createdAt")
- `sortOrder`: Thứ tự sắp xếp (mặc định: "desc")
- `genre`: ID thể loại (tùy chọn)
- `year`: Năm phát hành (tùy chọn)

**Response (200):**

```json
{
  "movies": [
    {
      "id": "movie_id",
      "title": "Tên Phim",
      "description": "Mô tả phim",
      "releaseYear": 2023,
      "posterUrl": "url_to_poster",
      "trailerUrl": "url_to_trailer",
      "genres": ["Action", "Drama"],
      "episodes": 16,
      "rating": 8.5,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "totalMovies": 50
}
```

### 3.3. Lấy chi tiết phim theo ID

**Endpoint:** `GET /api/movies/:id`

**Response (200):**

```json
{
  "id": "movie_id",
  "title": "Tên Phim",
  "description": "Mô tả phim",
  "releaseYear": 2023,
  "posterUrl": "url_to_poster",
  "trailerUrl": "url_to_trailer",
  "genres": [
    {
      "id": "genre_id",
      "name": "Action"
    },
    {
      "id": "genre_id",
      "name": "Drama"
    }
  ],
  "episodes": [
    {
      "id": "episode_id",
      "title": "Tập 1",
      "episodeNumber": 1,
      "videoUrl": "url_to_video",
      "duration": 3600
    }
  ],
  "rating": 8.5,
  "views": 1000,
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

### 3.4. Tạo phim mới (Admin)

**Endpoint:** `POST /api/movies`

**Headers:** Yêu cầu Authentication (Admin)

**Request Body:**

```json
{
  "title": "Tên Phim",
  "description": "Mô tả phim",
  "releaseYear": 2023,
  "posterUrl": "url_to_poster",
  "trailerUrl": "url_to_trailer",
  "genres": ["genre_id1", "genre_id2"]
}
```

**Response (201):**

```json
{
  "id": "movie_id",
  "title": "Tên Phim",
  "description": "Mô tả phim",
  "releaseYear": 2023,
  "posterUrl": "url_to_poster",
  "trailerUrl": "url_to_trailer",
  "genres": [
    {
      "id": "genre_id1",
      "name": "Action"
    },
    {
      "id": "genre_id2",
      "name": "Drama"
    }
  ],
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

### 3.5. Cập nhật phim (Admin)

**Endpoint:** `PUT /api/movies/:id`

**Headers:** Yêu cầu Authentication (Admin)

**Request Body:**

```json
{
  "title": "Tên Phim Mới",
  "description": "Mô tả phim mới",
  "releaseYear": 2023,
  "posterUrl": "url_to_poster",
  "trailerUrl": "url_to_trailer",
  "genres": ["genre_id1", "genre_id2"]
}
```

**Response (200):**

```json
{
  "id": "movie_id",
  "title": "Tên Phim Mới",
  "description": "Mô tả phim mới",
  "releaseYear": 2023,
  "posterUrl": "url_to_poster",
  "trailerUrl": "url_to_trailer",
  "genres": [
    {
      "id": "genre_id1",
      "name": "Action"
    },
    {
      "id": "genre_id2",
      "name": "Drama"
    }
  ],
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

### 3.6. Xóa phim (Admin)

**Endpoint:** `DELETE /api/movies/:id`

**Headers:** Yêu cầu Authentication (Admin)

**Response (200):**

```json
{
  "message": "Phim đã được xóa thành công"
}
```

## 4. Episode API

### 4.1. Lấy danh sách tập phim theo Movie ID

**Endpoint:** `GET /api/episodes?movieId=:movieId`

**Query Parameters:**

- `movieId`: ID của phim (bắt buộc)
- `page`: Số trang (mặc định: 1)
- `limit`: Số lượng mỗi trang (mặc định: 20)

**Response (200):**

```json
{
  "episodes": [
    {
      "id": "episode_id",
      "title": "Tập 1",
      "episodeNumber": 1,
      "movieId": "movie_id",
      "videoUrl": "url_to_video",
      "duration": 3600,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ],
  "totalPages": 2,
  "currentPage": 1,
  "totalEpisodes": 16
}
```

### 4.2. Lấy chi tiết tập phim theo ID

**Endpoint:** `GET /api/episodes/:id`

**Response (200):**

```json
{
  "id": "episode_id",
  "title": "Tập 1",
  "episodeNumber": 1,
  "movieId": "movie_id",
  "videoUrl": "url_to_video",
  "duration": 3600,
  "views": 500,
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

## 5. Genre API

### 5.1. Lấy danh sách thể loại

**Endpoint:** `GET /api/genres`

**Response (200):**

```json
[
  {
    "id": "genre_id",
    "name": "Action",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  },
  {
    "id": "genre_id",
    "name": "Drama",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
]
```

## 6. Favorite API

### 6.1. Lấy danh sách phim yêu thích của người dùng

**Endpoint:** `GET /api/favorites`

**Headers:** Yêu cầu Authentication

**Query Parameters:**

- `page`: Số trang (mặc định: 1)
- `limit`: Số lượng mỗi trang (mặc định: 10)

**Response (200):**

```json
{
  "favorites": [
    {
      "id": "favorite_id",
      "userId": "user_id",
      "movie": {
        "id": "movie_id",
        "title": "Tên Phim",
        "description": "Mô tả phim",
        "releaseYear": 2023,
        "posterUrl": "url_to_poster",
        "trailerUrl": "url_to_trailer",
        "genres": ["Action", "Drama"],
        "rating": 8.5
      },
      "createdAt": "2023-01-01T00:00:00Z"
    }
  ],
  "totalPages": 2,
  "currentPage": 1,
  "totalFavorites": 15
}
```

### 6.2. Thêm phim vào danh sách yêu thích

**Endpoint:** `POST /api/favorites`

**Headers:** Yêu cầu Authentication

**Request Body:**

```json
{
  "movieId": "movie_id"
}
```

**Response (201):**

```json
{
  "id": "favorite_id",
  "userId": "user_id",
  "movieId": "movie_id",
  "createdAt": "2023-01-01T00:00:00Z"
}
```

### 6.3. Xóa phim khỏi danh sách yêu thích

**Endpoint:** `DELETE /api/favorites/:movieId`

**Headers:** Yêu cầu Authentication

**Response (200):**

```json
{
  "message": "Đã xóa khỏi danh sách yêu thích"
}
```

## 7. Watch History API

### 7.1. Lấy lịch sử xem phim

**Endpoint:** `GET /api/watch-history`

**Headers:** Yêu cầu Authentication

**Query Parameters:**

- `page`: Số trang (mặc định: 1)
- `limit`: Số lượng mỗi trang (mặc định: 10)

**Response (200):**

```json
{
  "history": [
    {
      "id": "history_id",
      "userId": "user_id",
      "episode": {
        "id": "episode_id",
        "title": "Tập 1",
        "episodeNumber": 1,
        "movieId": "movie_id"
      },
      "movie": {
        "id": "movie_id",
        "title": "Tên Phim",
        "posterUrl": "url_to_poster"
      },
      "watchedAt": "2023-01-01T00:00:00Z",
      "progress": 1800,
      "completed": false
    }
  ],
  "totalPages": 3,
  "currentPage": 1,
  "totalItems": 25
}
```

### 7.2. Thêm vào lịch sử xem phim

**Endpoint:** `POST /api/watch-history`

**Headers:** Yêu cầu Authentication

**Request Body:**

```json
{
  "episodeId": "episode_id",
  "progress": 1800,
  "completed": false
}
```

**Response (201):**

```json
{
  "id": "history_id",
  "userId": "user_id",
  "episodeId": "episode_id",
  "progress": 1800,
  "completed": false,
  "watchedAt": "2023-01-01T00:00:00Z"
}
```

## 8. Comment API

### 8.1. Lấy bình luận cho phim

**Endpoint:** `GET /api/comments/movie/:movieId`

**Query Parameters:**

- `page`: Số trang (mặc định: 1)
- `limit`: Số lượng mỗi trang (mặc định: 10)

**Response (200):**

```json
{
  "comments": [
    {
      "id": "comment_id",
      "content": "Nội dung bình luận",
      "user": {
        "id": "user_id",
        "name": "Tên Người Dùng"
      },
      "movieId": "movie_id",
      "parentId": null,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z",
      "replies": [
        {
          "id": "reply_id",
          "content": "Nội dung trả lời",
          "user": {
            "id": "user_id",
            "name": "Tên Người Dùng"
          },
          "parentId": "comment_id",
          "createdAt": "2023-01-01T00:00:00Z",
          "updatedAt": "2023-01-01T00:00:00Z"
        }
      ]
    }
  ],
  "totalPages": 2,
  "currentPage": 1,
  "totalComments": 15
}
```

### 8.2. Thêm bình luận mới

**Endpoint:** `POST /api/comments`

**Headers:** Yêu cầu Authentication

**Request Body:**

```json
{
  "content": "Nội dung bình luận",
  "movieId": "movie_id",
  "parentId": null
}
```

**Response (201):**

```json
{
  "id": "comment_id",
  "content": "Nội dung bình luận",
  "userId": "user_id",
  "movieId": "movie_id",
  "parentId": null,
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

### 8.3. Cập nhật bình luận

**Endpoint:** `PUT /api/comments/:id`

**Headers:** Yêu cầu Authentication

**Request Body:**

```json
{
  "content": "Nội dung bình luận đã sửa"
}
```

**Response (200):**

```json
{
  "id": "comment_id",
  "content": "Nội dung bình luận đã sửa",
  "userId": "user_id",
  "movieId": "movie_id",
  "parentId": null,
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

### 8.4. Xóa bình luận

**Endpoint:** `DELETE /api/comments/:id`

**Headers:** Yêu cầu Authentication

**Response (200):**

```json
{
  "message": "Đã xóa bình luận thành công"
}
```

## 9. Media API

### 9.1. Tải lên ảnh

**Endpoint:** `POST /api/media/upload`

**Headers:**

- Yêu cầu Authentication
- Content-Type: multipart/form-data

**Form Data:**

- `file`: File ảnh (jpeg, jpg, png, webp)

**Response (200):**

```json
{
  "url": "https://cdn.alldrama.tech/images/filename.jpg"
}
```

## 10. View API

### 10.1. Tăng lượt xem cho tập phim

**Endpoint:** `POST /api/views/episode/:episodeId`

**Response (200):**

```json
{
  "message": "Đã tăng lượt xem thành công",
  "views": 501
}
```

## 11. Stats API (Admin)

### 11.1. Lấy thống kê tổng quan

**Endpoint:** `GET /api/stats/overview`

**Headers:** Yêu cầu Authentication (Admin)

**Response (200):**

```json
{
  "totalUsers": 1000,
  "totalMovies": 500,
  "totalViews": 50000,
  "newUsersToday": 10,
  "viewsToday": 500
}
```

### 11.2. Lấy thống kê theo thời gian

**Endpoint:** `GET /api/stats/time-series`

**Headers:** Yêu cầu Authentication (Admin)

**Query Parameters:**

- `metric`: Loại dữ liệu (users, views, movies)
- `timeRange`: Khoảng thời gian (day, week, month, year)

**Response (200):**

```json
{
  "labels": ["2023-01-01", "2023-01-02", "2023-01-03"],
  "data": [10, 15, 20],
  "metric": "users",
  "timeRange": "week"
}
```

## Sử dụng Swagger UI

Bạn có thể truy cập tài liệu API interactively thông qua Swagger UI:

- **Development:** `http://localhost:8000/api-docs`
- **Production:** `https://api.alldrama.tech/api-docs`

Swagger UI cho phép bạn:

- Xem tất cả các API endpoint có sẵn
- Kiểm tra params và response schemas
- Thử các API trực tiếp từ giao diện
