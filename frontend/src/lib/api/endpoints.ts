// Định nghĩa các endpoints API

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    LOGOUT_ALL: '/api/auth/logout-all',
    ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh',
    EMAIL_AUTH: '/api/auth/email-auth',
    CSRF_TOKEN: '/api/auth/csrf-token',
  },
  
  // Users
  USERS: {
    LIST: '/api/users',
    DETAIL: (id: string) => `/api/users/${id}`,
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
    CHANGE_PASSWORD: (id: string) => `/api/users/${id}/change-password`,
  },
  
  // Movies
  MOVIES: {
    LIST: '/api/movies',
    DETAIL: (id: string | number) => `/api/movies/${id}`,
    SEARCH: '/api/movies/search',
    FEATURED: '/api/movies/featured',
    POPULAR: '/api/movies/popular',
    TRENDING: '/api/movies/trending',
    NEWEST: '/api/movies/newest',
    BY_GENRE: (genreId: string | number) => `/api/movies/genre/${genreId}`,
    SIMILAR: (id: string | number) => `/api/movies/${id}/similar`,
    CREATE: '/api/movies',
    UPDATE: (id: string) => `/api/movies/${id}`,
    DELETE: (id: string) => `/api/movies/${id}`,
  },
  
  // Episodes
  EPISODES: {
    LIST: (movieId: string | number) => `/api/movies/${movieId}/episodes`,
    LIST_BY_MOVIE: (movieId: string) => `/api/episodes/movie/${movieId}`,
    DETAIL: (id: string | number) => `/api/episodes/${id}`,
    NEXT: (id: string | number) => `/api/episodes/${id}/next`,
    PREVIOUS: (id: string | number) => `/api/episodes/${id}/previous`,
    CREATE: '/api/episodes',
    UPDATE: (id: string) => `/api/episodes/${id}`,
    DELETE: (id: string) => `/api/episodes/${id}`,
  },
  
  // Genres
  GENRES: {
    LIST: '/api/genres',
    DETAIL: (id: string | number) => `/api/genres/${id}`,
    MOVIES: (id: string) => `/api/genres/${id}/movies`,
    CREATE: '/api/genres',
    UPDATE: (id: string) => `/api/genres/${id}`,
    DELETE: (id: string) => `/api/genres/${id}`,
  },
  
  // Comments
  COMMENTS: {
    BY_MOVIE: (movieId: string | number) => `/api/comments/movies/${movieId}`,
    LIST_BY_MOVIE: (movieId: string) => `/api/comments/movie/${movieId}`,
    DETAIL: (id: string | number) => `/api/comments/${id}`,
    CREATE: '/api/comments',
    UPDATE: (id: string | number) => `/api/comments/${id}`,
    DELETE: (id: string | number) => `/api/comments/${id}`,
  },
  
  // Favorites
  FAVORITES: {
    LIST: '/api/favorites',
    ADD: '/api/favorites',
    REMOVE: (movieId: string | number) => `/api/favorites/${movieId}`,
  },
  
  // Watch History
  WATCH_HISTORY: {
    LIST: '/api/watch-history',
    UPDATE: '/api/watch-history',
    DELETE: (id: string | number) => `/api/watch-history/${id}`,
    ADD: '/api/watch-history',
  },
  
  // Media
  MEDIA: {
    UPLOAD: '/api/media/upload',
    POSTER: '/api/media/poster',
    BACKDROP: '/api/media/backdrop',
    VIDEO: '/api/media/video',
    THUMBNAIL: '/api/media/thumbnail',
    UPLOAD_POSTER: (movieId: string) => `/api/media/movies/${movieId}/poster`,
    UPLOAD_BACKDROP: (movieId: string) => `/api/media/movies/${movieId}/backdrop`,
    UPLOAD_TRAILER: (movieId: string) => `/api/media/movies/${movieId}/trailer`,
    UPLOAD_EPISODE_VIDEO: (movieId: string, episodeId: string) => 
      `/api/media/episodes/${movieId}/${episodeId}/video`,
    PROCESSING_STATUS: (episodeId: string) => `/api/media/episodes/${episodeId}/processing-status`,
    PRESIGNED_URL: '/api/media/presigned-url',
    DELETE_MEDIA: (movieId: string, mediaType: string) => `/api/media/movies/${movieId}/${mediaType}`,
    DELETE_EPISODE: (movieId: string, episodeId: string) => `/api/media/episodes/${movieId}/${episodeId}`,
    DELETE_MOVIE: (movieId: string) => `/api/media/movies/${movieId}`,
  },
  
  // Views
  VIEWS: {
    INCREMENT_MOVIE: (movieId: string) => `/api/views/movie/${movieId}/increment`,
    INCREMENT_EPISODE: (episodeId: string) => `/api/views/episode/${episodeId}/increment`,
    GET_MOVIE_VIEWS: (movieId: string) => `/api/views/movie/${movieId}`,
    GET_EPISODE_VIEWS: (episodeId: string) => `/api/views/episode/${episodeId}`,
  },
  
  // Stats
  STATS: {
    OVERVIEW: '/api/stats/overview',
    POPULAR_MOVIES: '/api/stats/popular-movies',
    USER_ACTIVITY: '/api/stats/user-activity',
    DASHBOARD: '/api/stats/dashboard',
    NEW_USERS: '/api/stats/new-users',
    GENRES: '/api/stats/genres',
    TIME_SERIES: '/api/stats/time-series',
  },
};