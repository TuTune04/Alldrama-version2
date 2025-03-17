import { Episode, EpisodeListResponse } from '@/types';
import { mockMovies } from './movies';

// Tập phim cho "Người Nhện: Không Còn Nhà"
export const movieOneEpisodes: Episode[] = [
  {
    id: 'episode-1-1',
    title: 'Tập 1: Danh tính bại lộ',
    episodeNumber: 1,
    movieId: mockMovies[0].id,
    videoUrl: 'https://example.com/videos/spiderman-1.mp4',
    duration: 3000, // 50 phút
    views: 135000,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'episode-1-2',
    title: 'Tập 2: Gặp gỡ Doctor Strange',
    episodeNumber: 2,
    movieId: mockMovies[0].id,
    videoUrl: 'https://example.com/videos/spiderman-2.mp4',
    duration: 3120, // 52 phút
    views: 120000,
    createdAt: '2023-01-08T00:00:00Z',
    updatedAt: '2023-01-08T00:00:00Z'
  },
  {
    id: 'episode-1-3',
    title: 'Tập 3: Đa vũ trụ',
    episodeNumber: 3,
    movieId: mockMovies[0].id,
    videoUrl: 'https://example.com/videos/spiderman-3.mp4',
    duration: 3300, // 55 phút
    views: 110000,
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z'
  }
];

// Tập phim cho "Tình Yêu và Tham Vọng"
export const movieTwoEpisodes: Episode[] = [
  {
    id: 'episode-2-1',
    title: 'Tập 1: Gặp gỡ định mệnh',
    episodeNumber: 1,
    movieId: mockMovies[1].id,
    videoUrl: 'https://example.com/videos/love-1.mp4',
    duration: 2700, // 45 phút
    views: 90000,
    createdAt: '2023-01-05T00:00:00Z',
    updatedAt: '2023-01-05T00:00:00Z'
  },
  {
    id: 'episode-2-2',
    title: 'Tập 2: Lựa chọn khó khăn',
    episodeNumber: 2,
    movieId: mockMovies[1].id,
    videoUrl: 'https://example.com/videos/love-2.mp4',
    duration: 2820, // 47 phút
    views: 85000,
    createdAt: '2023-01-12T00:00:00Z',
    updatedAt: '2023-01-12T00:00:00Z'
  }
];

// Tập phim cho "Vượt Ngục"
export const movieThreeEpisodes: Episode[] = [
  {
    id: 'episode-3-1',
    title: 'Tập 1: Oan án',
    episodeNumber: 1,
    movieId: mockMovies[2].id,
    videoUrl: 'https://example.com/videos/prison-1.mp4',
    duration: 3600, // 60 phút
    views: 200000,
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2023-02-01T00:00:00Z'
  },
  {
    id: 'episode-3-2',
    title: 'Tập 2: Kế hoạch',
    episodeNumber: 2,
    movieId: mockMovies[2].id,
    videoUrl: 'https://example.com/videos/prison-2.mp4',
    duration: 3540, // 59 phút
    views: 195000,
    createdAt: '2023-02-08T00:00:00Z',
    updatedAt: '2023-02-08T00:00:00Z'
  },
  {
    id: 'episode-3-3',
    title: 'Tập 3: Đào tẩu',
    episodeNumber: 3,
    movieId: mockMovies[2].id,
    videoUrl: 'https://example.com/videos/prison-3.mp4',
    duration: 3720, // 62 phút
    views: 190000,
    createdAt: '2023-02-15T00:00:00Z',
    updatedAt: '2023-02-15T00:00:00Z'
  },
  {
    id: 'episode-3-4',
    title: 'Tập 4: Tự do',
    episodeNumber: 4,
    movieId: mockMovies[2].id,
    videoUrl: 'https://example.com/videos/prison-4.mp4',
    duration: 3600, // 60 phút
    views: 185000,
    createdAt: '2023-02-22T00:00:00Z',
    updatedAt: '2023-02-22T00:00:00Z'
  }
];

// Kết hợp tất cả các tập phim
export const mockEpisodes: Episode[] = [
  ...movieOneEpisodes,
  ...movieTwoEpisodes,
  ...movieThreeEpisodes,
];

// Mock response cho danh sách tập phim theo movie
export const getEpisodeListResponse = (movieId: string): EpisodeListResponse => {
  let episodes: Episode[];
  
  switch (movieId) {
    case mockMovies[0].id:
      episodes = movieOneEpisodes;
      break;
    case mockMovies[1].id:
      episodes = movieTwoEpisodes;
      break;
    case mockMovies[2].id:
      episodes = movieThreeEpisodes;
      break;
    default:
      episodes = [];
  }
  
  return {
    episodes,
    totalPages: 1,
    currentPage: 1,
    totalEpisodes: episodes.length
  };
}; 