# Ví dụ Sử dụng API từ Frontend

## Thiết lập

### Cấu hình API Client (với Axios)

```javascript
// apiClient.js
import axios from "axios";

const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://api.alldrama.tech";

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Cho phép gửi cookie
});

// Thêm interceptor để đính kèm token
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

// Xử lý lỗi phản hồi
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý lỗi xác thực (ví dụ: chuyển hướng đến trang đăng nhập)
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

## Ví dụ Sử dụng API

### 1. Đăng ký tài khoản

```javascript
// authService.js
import apiClient from "./apiClient";

export const registerUser = async (email, password, name) => {
  try {
    const response = await apiClient.post("/api/auth/register", {
      email,
      password,
      name,
    });

    // Lưu token sau khi đăng ký thành công
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Lỗi đăng ký" };
  }
};

// Sử dụng trong component
const handleRegister = async () => {
  try {
    setLoading(true);
    const data = await registerUser(email, password, name);
    setUser(data.user);
    navigate("/dashboard");
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### 2. Đăng nhập

```javascript
// authService.js
export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post("/api/auth/login", {
      email,
      password,
    });

    // Lưu token sau khi đăng nhập thành công
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Lỗi đăng nhập" };
  }
};
```

### 3. Lấy danh sách phim

```javascript
// movieService.js
import apiClient from "./apiClient";

export const getMovies = async (
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc"
) => {
  try {
    const response = await apiClient.get("/api/movies", {
      params: {
        page,
        limit,
        sortBy,
        sortOrder,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Không thể lấy danh sách phim" };
  }
};

// Sử dụng với React Query
import { useQuery } from "react-query";
import { getMovies } from "./movieService";

const MovieList = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useQuery(
    ["movies", page],
    () => getMovies(page),
    { keepPreviousData: true }
  );

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div>
      <div className="movie-grid">
        {data.movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
      <Pagination
        currentPage={data.currentPage}
        totalPages={data.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};
```

### 4. Tìm kiếm phim

```javascript
// movieService.js
export const searchMovies = async (
  query,
  page = 1,
  limit = 10,
  genre,
  year
) => {
  try {
    const response = await apiClient.get("/api/movies/search", {
      params: {
        query,
        page,
        limit,
        genre,
        year,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Không thể tìm kiếm phim" };
  }
};

// Sử dụng trong component
const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ genre: "", year: "" });

  const { data, isLoading, refetch } = useQuery(
    ["movieSearch", searchTerm, filters],
    () => searchMovies(searchTerm, 1, 10, filters.genre, filters.year),
    { enabled: !!searchTerm }
  );

  const handleSearch = () => {
    if (searchTerm.trim()) {
      refetch();
    }
  };

  return (
    <div>
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        onSearch={handleSearch}
      />
      <FilterControls filters={filters} onChange={setFilters} />

      {isLoading ? (
        <Loading />
      ) : data?.movies.length > 0 ? (
        <SearchResults movies={data.movies} />
      ) : (
        <NoResults />
      )}
    </div>
  );
};
```

### 5. Thêm phim vào danh sách yêu thích

```javascript
// favoriteService.js
import apiClient from "./apiClient";

export const addToFavorites = async (movieId) => {
  try {
    const response = await apiClient.post("/api/favorites", { movieId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Không thể thêm vào yêu thích" };
  }
};

export const removeFromFavorites = async (movieId) => {
  try {
    const response = await apiClient.delete(`/api/favorites/${movieId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Không thể xóa khỏi yêu thích" };
  }
};

// Sử dụng trong component
const FavoriteButton = ({ movieId, isFavorite }) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async () => {
    try {
      setLoading(true);
      if (favorite) {
        await removeFromFavorites(movieId);
      } else {
        await addToFavorites(movieId);
      }
      setFavorite(!favorite);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`favorite-btn ${favorite ? "active" : ""}`}
    >
      {loading ? (
        <Spinner />
      ) : favorite ? (
        <HeartFilledIcon />
      ) : (
        <HeartOutlineIcon />
      )}
    </button>
  );
};
```

### 6. Cập nhật lịch sử xem phim

```javascript
// watchService.js
import apiClient from "./apiClient";

export const updateWatchHistory = async (
  episodeId,
  progress,
  completed = false
) => {
  try {
    const response = await apiClient.post("/api/watch-history", {
      episodeId,
      progress,
      completed,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Không thể cập nhật lịch sử xem" };
  }
};

// Sử dụng trong Video Player
const VideoPlayer = ({ episode }) => {
  const videoRef = useRef(null);

  // Cập nhật tiến độ xem mỗi 30 giây
  useEffect(() => {
    const video = videoRef.current;
    const updateInterval = setInterval(() => {
      if (video && video.currentTime > 0) {
        updateWatchHistory(episode.id, Math.floor(video.currentTime)).catch(
          console.error
        );
      }
    }, 30000);

    return () => clearInterval(updateInterval);
  }, [episode.id]);

  // Đánh dấu đã hoàn thành khi xem hết
  const handleEnded = async () => {
    try {
      await updateWatchHistory(episode.id, episode.duration, true);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái hoàn thành:", error);
    }
  };

  return (
    <video
      ref={videoRef}
      src={episode.videoUrl}
      controls
      onEnded={handleEnded}
      className="video-player"
    />
  );
};
```

### 7. Thêm bình luận mới

```javascript
// commentService.js
import apiClient from "./apiClient";

export const getComments = async (movieId, page = 1, limit = 10) => {
  try {
    const response = await apiClient.get(`/api/comments/movie/${movieId}`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Không thể lấy bình luận" };
  }
};

export const addComment = async (content, movieId, parentId = null) => {
  try {
    const response = await apiClient.post("/api/comments", {
      content,
      movieId,
      parentId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Không thể thêm bình luận" };
  }
};

// Sử dụng trong component
const CommentForm = ({ movieId, parentId = null, onCommentAdded }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      const newComment = await addComment(content, movieId, parentId);
      onCommentAdded(newComment);
      setContent("");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Viết bình luận của bạn..."
        rows={3}
        disabled={loading}
      />
      <button type="submit" disabled={loading || !content.trim()}>
        {loading ? "Đang gửi..." : "Gửi bình luận"}
      </button>
    </form>
  );
};
```

## Xử lý lỗi và Loading State

### Tạo Custom Hook

```javascript
// useApi.js
import { useState, useCallback } from "react";

export const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (error) {
        setError(error.message || "Có lỗi xảy ra");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return {
    data,
    loading,
    error,
    execute,
  };
};

// Sử dụng
const MovieDetailPage = ({ movieId }) => {
  const {
    data: movie,
    loading,
    error,
    execute: fetchMovie,
  } = useApi(getMovieById);

  useEffect(() => {
    fetchMovie(movieId);
  }, [movieId, fetchMovie]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!movie) return null;

  return (
    <div className="movie-detail">
      <h1>{movie.title}</h1>
      <div className="movie-info">{/* Chi tiết phim */}</div>
    </div>
  );
};
```

## Tài nguyên bổ sung

- [Tài liệu API đầy đủ](./api-documentation.md)
- [Swagger UI](http://localhost:8000/api-docs) (trong môi trường development)
- Xem thêm ví dụ trong mã nguồn frontend
