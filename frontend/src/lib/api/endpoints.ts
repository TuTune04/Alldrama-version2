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
  },
  
  // Movies
  MOVIES: {
    LIST: '/api/movies',
    SEARCH: '/api/movies/search',
    DETAIL: (id: string) => `/api/movies/${id}`,
    CREATE: '/api/movies',
    UPDATE: (id: string) => `/api/movies/${id}`,
    DELETE: (id: string) => `/api/movies/${id}`,
  },
  
  // Episodes
  EPISODES: {
    LIST_BY_MOVIE: (movieId: string) => `/api/episodes/movie/${movieId}`,
    DETAIL: (id: string) => `/api/episodes/${id}`,
    CREATE: '/api/episodes',
    UPDATE: (id: string) => `/api/episodes/${id}`,
    DELETE: (id: string) => `/api/episodes/${id}`,
  },
  
  // Genres
  GENRES: {
    LIST: '/api/genres',
  },
  
  // Favorites
  FAVORITES: {
    LIST: '/api/favorites',
    ADD: '/api/favorites',
    REMOVE: (movieId: string) => `/api/favorites/${movieId}`,
  },
  
  // Watch History
  WATCH_HISTORY: {
    LIST: '/api/watch-history',
    ADD: '/api/watch-history',
  },
  
  // Comments
  COMMENTS: {
    LIST_BY_MOVIE: (movieId: string) => `/api/comments/movie/${movieId}`,
    CREATE: '/api/comments',
    UPDATE: (id: string) => `/api/comments/${id}`,
    DELETE: (id: string) => `/api/comments/${id}`,
  },
  
  // Media
  MEDIA: {
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
  
  // Stats (Admin)
  STATS: {
    DASHBOARD: '/api/stats/dashboard',
    POPULAR_MOVIES: '/api/stats/popular-movies',
    NEW_USERS: '/api/stats/new-users',
    GENRES: '/api/stats/genres',
    OVERVIEW: '/api/stats/overview',
    TIME_SERIES: '/api/stats/time-series',
  },
}; 