import { Episode, EpisodeListResponse, PaginatedEpisodeResponse } from '@/types';
import { mockMovies } from './movies';

// Tập phim cho "Người Nhện: Không Còn Nhà"
export const movieOneEpisodes: Episode[] = [
  {
    id: 101,
    title: 'Tập 1: Danh tính bại lộ',
    description: 'Mô tả chi tiết về tập phim 1 của Người Nhện',
    episodeNumber: 1,
    movieId: 1,
    playlistUrl: 'https://example.com/videos/spiderman-1/playlist.m3u8',
    thumbnailUrl: 'https://via.placeholder.com/640x360?text=Spider-Man+Ep1',
    duration: 3000, // 50 phút
    isProcessed: true,
    processingError: null,
    views: 135000,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    movie: {
      id: 1,
      title: mockMovies[0].title,
      releaseYear: mockMovies[0].releaseYear,
      posterUrl: mockMovies[0].posterUrl
    }
  },
  {
    id: 102,
    title: 'Tập 2: Gặp gỡ Doctor Strange',
    description: 'Mô tả chi tiết về tập phim 2 của Người Nhện',
    episodeNumber: 2,
    movieId: 1,
    playlistUrl: 'https://example.com/videos/spiderman-2/playlist.m3u8',
    thumbnailUrl: 'https://via.placeholder.com/640x360?text=Spider-Man+Ep2',
    duration: 3120, // 52 phút
    isProcessed: true,
    processingError: null,
    views: 120000,
    createdAt: '2023-01-08T00:00:00Z',
    updatedAt: '2023-01-08T00:00:00Z',
    movie: {
      id: 1,
      title: mockMovies[0].title,
      releaseYear: mockMovies[0].releaseYear,
      posterUrl: mockMovies[0].posterUrl
    }
  },
  {
    id: 103,
    title: 'Tập 3: Đa vũ trụ',
    description: 'Mô tả chi tiết về tập phim 3 của Người Nhện',
    episodeNumber: 3,
    movieId: 1,
    playlistUrl: 'https://example.com/videos/spiderman-3/playlist.m3u8',
    thumbnailUrl: 'https://via.placeholder.com/640x360?text=Spider-Man+Ep3',
    duration: 3300, // 55 phút
    isProcessed: true,
    processingError: null,
    views: 110000,
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z',
    movie: {
      id: 1,
      title: mockMovies[0].title,
      releaseYear: mockMovies[0].releaseYear,
      posterUrl: mockMovies[0].posterUrl
    }
  }
];

// Tập phim cho "Tình Yêu và Tham Vọng"
export const movieTwoEpisodes: Episode[] = [
  {
    id: 201,
    title: 'Tập 1: Sự trỗi dậy của Wakanda',
    description: 'Mô tả chi tiết về tập phim 1 của Black Panther',
    episodeNumber: 1,
    movieId: 2,
    playlistUrl: 'https://example.com/videos/love-1/playlist.m3u8',
    thumbnailUrl: 'https://via.placeholder.com/640x360?text=Love+and+Ambition+Ep1',
    duration: 2700, // 45 phút
    isProcessed: true,
    processingError: null,
    views: 90000,
    createdAt: '2023-01-05T00:00:00Z',
    updatedAt: '2023-01-05T00:00:00Z',
    movie: {
      id: 2,
      title: mockMovies[1].title,
      releaseYear: mockMovies[1].releaseYear,
      posterUrl: mockMovies[1].posterUrl
    }
  },
  {
    id: 202,
    title: 'Tập 2: Namor và quốc gia dưới nước',
    description: 'Mô tả chi tiết về tập phim 2 của Black Panther',
    episodeNumber: 2,
    movieId: 2,
    playlistUrl: 'https://example.com/videos/love-2/playlist.m3u8',
    thumbnailUrl: 'https://via.placeholder.com/640x360?text=Love+and+Ambition+Ep2',
    duration: 2820, // 47 phút
    isProcessed: true,
    processingError: null,
    views: 85000,
    createdAt: '2023-01-12T00:00:00Z',
    updatedAt: '2023-01-12T00:00:00Z',
    movie: {
      id: 2,
      title: mockMovies[1].title,
      releaseYear: mockMovies[1].releaseYear,
      posterUrl: mockMovies[1].posterUrl
    }
  }
];

// Tập phim cho "Vượt Ngục"
export const movieThreeEpisodes: Episode[] = [
  {
    id: 301,
    title: 'Tập 1: Những kẻ du hành',
    description: 'Mô tả chi tiết về tập phim 1 của Vượt Ngục',
    episodeNumber: 1,
    movieId: 3,
    playlistUrl: 'https://example.com/videos/prison-1/playlist.m3u8',
    thumbnailUrl: 'https://via.placeholder.com/640x360?text=Prison+Break+Ep1',
    duration: 3600, // 60 phút
    isProcessed: true,
    processingError: null,
    views: 200000,
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2023-02-01T00:00:00Z',
    movie: {
      id: 3,
      title: mockMovies[2].title,
      releaseYear: mockMovies[2].releaseYear,
      posterUrl: mockMovies[2].posterUrl
    }
  },
  {
    id: 302,
    title: 'Tập 2: Thế giới mới',
    description: 'Mô tả chi tiết về tập phim 2 của Vượt Ngục',
    episodeNumber: 2,
    movieId: 3,
    playlistUrl: 'https://example.com/videos/prison-2/playlist.m3u8',
    thumbnailUrl: 'https://via.placeholder.com/640x360?text=Prison+Break+Ep2',
    duration: 3540, // 59 phút
    isProcessed: true,
    processingError: null,
    views: 195000,
    createdAt: '2023-02-08T00:00:00Z',
    updatedAt: '2023-02-08T00:00:00Z',
    movie: {
      id: 3,
      title: mockMovies[2].title,
      releaseYear: mockMovies[2].releaseYear,
      posterUrl: mockMovies[2].posterUrl
    }
  },
  {
    id: 303,
    title: 'Tập 3: Manh mối mới',
    description: 'Mô tả chi tiết về tập phim 3 của Vượt Ngục',
    episodeNumber: 3,
    movieId: 3,
    playlistUrl: 'https://example.com/videos/prison-3/playlist.m3u8',
    thumbnailUrl: 'https://via.placeholder.com/640x360?text=Prison+Break+Ep3',
    duration: 3720, // 62 phút
    isProcessed: true,
    processingError: null,
    views: 190000,
    createdAt: '2023-02-15T00:00:00Z',
    updatedAt: '2023-02-15T00:00:00Z',
    movie: {
      id: 3,
      title: mockMovies[2].title,
      releaseYear: mockMovies[2].releaseYear,
      posterUrl: mockMovies[2].posterUrl
    }
  },
  {
    id: 304,
    title: 'Tập 4: Đồng minh bất ngờ',
    description: 'Mô tả chi tiết về tập phim 4 của Vượt Ngục',
    episodeNumber: 4,
    movieId: 3,
    playlistUrl: 'https://example.com/videos/prison-4/playlist.m3u8',
    thumbnailUrl: 'https://via.placeholder.com/640x360?text=Prison+Break+Ep4',
    duration: 3600, // 60 phút
    isProcessed: true,
    processingError: null,
    views: 185000,
    createdAt: '2023-02-22T00:00:00Z',
    updatedAt: '2023-02-22T00:00:00Z',
    movie: {
      id: 3,
      title: mockMovies[2].title,
      releaseYear: mockMovies[2].releaseYear,
      posterUrl: mockMovies[2].posterUrl
    }
  }
];

// Kết hợp tất cả các tập phim
export const mockEpisodes: Episode[] = [
  ...movieOneEpisodes,
  ...movieTwoEpisodes,
  ...movieThreeEpisodes,
];

// Mock response cho danh sách tập phim theo movie
// API returns array directly as specified in backend documentation
export const getEpisodeListResponse = (movieId: string | number): EpisodeListResponse => {
  // Handle both numeric IDs and string IDs like 'movie-1'
  let numMovieId: number;
  
  if (typeof movieId === 'string') {
    // Check if it's in the format 'movie-X'
    if (movieId.startsWith('movie-')) {
      numMovieId = parseInt(movieId.replace('movie-', ''), 10);
    } else {
      numMovieId = parseInt(movieId, 10);
    }
  } else {
    numMovieId = movieId;
  }
  
  console.log('Converting movieId', movieId, 'to numMovieId', numMovieId);
  
  switch (numMovieId) {
    case 1:
      return movieOneEpisodes;
    case 2:
      return movieTwoEpisodes;
    case 3:
      return movieThreeEpisodes;
    case 4:
      return []; // No episodes for movie 4 yet
    default:
      return [];
  }
};

// For components that still expect the old paginated structure
export const getPaginatedEpisodeResponse = (movieId: string | number): PaginatedEpisodeResponse => {
  const episodes = getEpisodeListResponse(movieId);
  
  return {
    episodes,
    pagination: {
      total: episodes.length,
      totalPages: 1,
      currentPage: 1,
      limit: 10
    }
  };
};