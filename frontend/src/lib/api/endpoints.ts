// Định nghĩa các endpoints API

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
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
    LIST: '/api/episodes',
    DETAIL: (id: string) => `/api/episodes/${id}`,
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
    UPLOAD: '/api/media/upload',
  },
  
  // Views
  VIEWS: {
    INCREMENT_EPISODE: (episodeId: string) => `/api/views/episode/${episodeId}`,
  },
  
  // Stats (Admin)
  STATS: {
    OVERVIEW: '/api/stats/overview',
    TIME_SERIES: '/api/stats/time-series',
  },
}; 