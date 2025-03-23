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
  "full_name": "Tên Người Dùng",
  "email": "example@example.com",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "message": "Đăng ký thành công",
  "user": {
    "id": "user_id",
    "full_name": "Tên Người Dùng",
    "email": "example@example.com",
    "role": "user"
  },
  "accessToken": "JWT_TOKEN",
  "refreshToken": "REFRESH_TOKEN"
}
```

**Cookies:**

- API này sẽ tự động thiết lập cookie `refreshToken` HttpOnly với thời hạn 30 ngày
- Cookie này sẽ được sử dụng tự động cho API refresh token
- Mặc dù refreshToken được trả về trong response, nên sử dụng cơ chế cookie để bảo mật hơn

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
  "message": "Đăng nhập thành công",
  "user": {
    "id": "user_id",
    "full_name": "Tên Người Dùng",
    "email": "example@example.com",
    "role": "user"
  },
  "accessToken": "JWT_TOKEN"
}
```

**Cookies:**

- API này sẽ tự động thiết lập cookie `refreshToken` HttpOnly với thời hạn 30 ngày
- Cookie này sẽ được sử dụng tự động cho API refresh token
- Không lưu trữ refreshToken ở phía client, hệ thống sử dụng cookie HttpOnly để bảo mật

### 1.3. Đăng xuất

**Endpoint:** `POST /api/auth/logout`

**Headers:** Yêu cầu Authentication

**Response (200):**

```json
{
  "message": "Đăng xuất thành công"
}
```

**Cookies:**

- API này sẽ xóa cookie `refreshToken`
- Cần đảm bảo xóa accessToken đã lưu trữ ở phía client

### 1.4. Đăng xuất khỏi tất cả thiết bị

**Endpoint:** `POST /api/auth/logout-all`

**Headers:** Yêu cầu Authentication

**Response (200):**

```json
{
  "message": "Đã đăng xuất khỏi tất cả thiết bị"
}
```

### 1.5. Lấy thông tin người dùng hiện tại

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

### 1.6. Làm mới token

**Endpoint:** `POST /api/auth/refresh`

**Cookies Required:**

- `refreshToken`: Token làm mới (được thiết lập tự động khi đăng nhập)

**Response (200):**

```json
{
  "message": "Refresh token thành công",
  "accessToken": "NEW_JWT_TOKEN"
}
```

**Lưu ý:**

- API này sử dụng cookie HttpOnly để bảo mật Refresh Token
- Khi gọi API này, cookie Refresh Token mới sẽ được tự động cập nhật
- Không cần cung cấp Refresh Token trong request body
- Path cookie được thiết lập là `/api/auth/refresh` để đảm bảo an toàn

### 1.7. Xác thực email (NextAuth)

**Endpoint:** `POST /api/auth/email-auth`

**Request Body:**

```json
{
  "email": "example@example.com"
}
```

**Response (200):**

```json
{
  "message": "Đã gửi email xác thực"
}
```

### 1.8. Lấy CSRF Token

**Endpoint:** `GET /api/auth/csrf-token`

**Response (200):**

```json
{
  "message": "CSRF token đã được đặt trong cookie"
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

**Endpoint:** `GET /api/episodes/movie/:movieId`

**Query Parameters:**

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

### 4.3. Tạo tập phim mới (Admin)

**Endpoint:** `POST /api/episodes`

**Headers:** Yêu cầu Authentication (Admin)

**Request Body:**

```json
{
  "title": "Tập 1",
  "episodeNumber": 1,
  "movieId": "movie_id",
  "videoUrl": "url_to_video",
  "duration": 3600
}
```

**Response (201):**

```json
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
```

### 4.4. Cập nhật tập phim (Admin)

**Endpoint:** `PUT /api/episodes/:id`

**Headers:** Yêu cầu Authentication (Admin)

**Request Body:**

```json
{
  "title": "Tập 1 (Đã sửa)",
  "videoUrl": "new_url_to_video"
}
```

**Response (200):**

```json
{
  "id": "episode_id",
  "title": "Tập 1 (Đã sửa)",
  "episodeNumber": 1,
  "movieId": "movie_id",
  "videoUrl": "new_url_to_video",
  "duration": 3600,
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

### 4.5. Xóa tập phim (Admin)

**Endpoint:** `DELETE /api/episodes/:id`

**Headers:** Yêu cầu Authentication (Admin)

**Response (200):**

```json
{
  "message": "Tập phim đã được xóa thành công"
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

### 9.1. Tải lên ảnh poster cho phim

**Endpoint:** `POST /api/media/movies/:movieId/poster`

**Headers:**

- Yêu cầu Authentication (Admin)
- Content-Type: multipart/form-data

**Form Data:**

- `poster`: File ảnh (jpeg, jpg, png, webp)

**Response (200):**

```json
{
  "message": "Upload poster thành công",
  "url": "https://cdn.alldrama.tech/movies/movie_id/poster.jpg"
}
```

### 9.2. Tải lên ảnh backdrop cho phim

**Endpoint:** `POST /api/media/movies/:movieId/backdrop`

**Headers:**

- Yêu cầu Authentication (Admin)
- Content-Type: multipart/form-data

**Form Data:**

- `backdrop`: File ảnh (jpeg, jpg, png, webp)

**Response (200):**

```json
{
  "message": "Upload backdrop thành công",
  "url": "https://cdn.alldrama.tech/movies/movie_id/backdrop.jpg"
}
```

### 9.3. Tải lên trailer cho phim

**Endpoint:** `POST /api/media/movies/:movieId/trailer`

**Headers:**

- Yêu cầu Authentication (Admin)
- Content-Type: multipart/form-data

**Form Data:**

- `trailer`: File video (mp4, webm)

**Response (200):**

```json
{
  "message": "Upload trailer thành công",
  "trailerUrl": "https://cdn.alldrama.tech/movies/movie_id/trailer.mp4"
}
```

### 9.4. Tải lên video cho tập phim

**Endpoint:** `POST /api/media/episodes/:movieId/:episodeId/video`

**Headers:**

- Yêu cầu Authentication (Admin)
- Content-Type: multipart/form-data

**Form Data:**

- `video`: File video (mp4, webm) - kích thước tối đa 2GB

**Response (202):**

```json
{
  "message": "Đã nhận video, đang xử lý HLS",
  "originalUrl": "https://cdn.alldrama.tech/episodes/movie_id/episode_id/original.mp4",
  "thumbnailUrl": "https://cdn.alldrama.tech/episodes/movie_id/episode_id/thumbnail.jpg",
  "processingStatus": "processing",
  "estimatedDuration": 3600
}
```

### 9.5. Lấy trạng thái xử lý video

**Endpoint:** `GET /api/media/episodes/:episodeId/processing-status`

**Headers:** Yêu cầu Authentication

**Response (200):**

```json
{
  "episodeId": 123,
  "isProcessed": true,
  "processingError": null,
  "playlistUrl": "https://cdn.alldrama.tech/hls/episodes/movie_id/episode_id/hls/master.m3u8",
  "thumbnailUrl": "https://cdn.alldrama.tech/episodes/movie_id/episode_id/thumbnail.jpg"
}
```

### 9.6. Tạo Presigned URL để upload trực tiếp

**Endpoint:** `POST /api/media/presigned-url`

**Headers:** Yêu cầu Authentication (Admin)

**Request Body:**

```json
{
  "movieId": 123,
  "fileType": "poster|backdrop|trailer|video",
  "episodeId": 456 // chỉ cần thiết khi fileType là "video"
}
```

**Response (200):**

```json
{
  "presignedUrl": "https://presigned-upload-url...",
  "contentType": "video/mp4", // hoặc "image/jpeg"
  "cdnUrl": "https://cdn.alldrama.tech/",
  "expiresIn": 10800 // 3 giờ cho video, 1 giờ cho hình ảnh
}
```

### 9.7. Xử lý video đã tải lên

**Endpoint:** `POST /api/media/process-video`

**Headers:**

- `X-Worker-Secret`: Chuỗi xác thực cho worker

**Request Body:**

```json
{
  "videoKey": "episodes/123/456/original.mp4",
  "movieId": 123,
  "episodeId": 456,
  "jobId": "optional-job-id",
  "callbackUrl": "https://optional-callback-url..."
}
```

**Response (200):**

```json
{
  "success": true,
  "jobId": "job-12345678",
  "error": null
}
```

### 9.8. Xóa media

**Endpoint:** `DELETE /api/media/movies/:movieId/:mediaType`

**Headers:** Yêu cầu Authentication (Admin)

**Request Parameters:**

- `movieId`: ID của phim
- `mediaType`: Loại media ("poster", "backdrop", "trailer")

**Response (200):**

```json
{
  "success": true,
  "message": "Đã xóa media thành công"
}
```

### 9.9. Xóa tập phim (bao gồm media)

**Endpoint:** `DELETE /api/media/episodes/:movieId/:episodeId`

**Headers:** Yêu cầu Authentication (Admin)

**Response (200):**

```json
{
  "success": true,
  "message": "Đã xóa tập phim thành công"
}
```

### 9.10. Xóa phim (bao gồm media)

**Endpoint:** `DELETE /api/media/movies/:movieId`

**Headers:** Yêu cầu Authentication (Admin)

**Response (200):**

```json
{
  "success": true,
  "message": "Đã xóa phim và tất cả tập phim thành công"
}
```

## 10. HLS Streaming (Thông tin kỹ thuật)

### 10.1 Cấu trúc URL HLS

**Format URL HLS:**

```
https://cdn.alldrama.tech/hls/episodes/{movieId}/{episodeId}/hls/master.m3u8
```

**Các độ phân giải có sẵn:**

- Video thông thường (dưới 20 phút): 240p, 360p, 480p, 720p, 1080p
- Video dài (trên 20 phút): 360p, 720p

**Thông số kỹ thuật:**

- Format: fMP4 (fragmented MP4)
- Codec video: H.264 (main profile)
- Codec audio: AAC (48kHz, 128kbps)
- Segment duration: 6 giây
- Bitrates theo độ phân giải:
  - 240p: 400kbps
  - 360p: 700kbps
  - 480p: 1500kbps
  - 720p: 2500kbps
  - 1080p: 4500kbps

### 10.2 Quy trình xử lý video

1. Upload video gốc sử dụng một trong hai phương pháp:

   - Upload trực tiếp qua API với kích thước tối đa 2GB
   - Upload sử dụng presigned URL (khuyến nghị cho video lớn)

2. Hệ thống tự động chuyển đổi video thành HLS với nhiều độ phân giải

3. Theo dõi trạng thái xử lý qua API `/api/media/episodes/:episodeId/processing-status`

4. Khi xử lý hoàn tất, sử dụng HLS URL cho phát video

## 11. View API

### 11.1. Tăng lượt xem cho tập phim

**Endpoint:** `POST /api/views/episode/:episodeId`

**Response (200):**

```json
{
  "message": "Đã tăng lượt xem thành công",
  "views": 501
}
```

## 12. Stats API (Admin)

### 12.1. Lấy thống kê tổng quan

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

### 12.2. Lấy thống kê theo thời gian

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
