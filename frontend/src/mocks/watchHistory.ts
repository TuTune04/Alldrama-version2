import { WatchHistory, WatchHistoryListResponse } from '@/types';
import { mockEpisodes } from './episodes';
import { mockMovies } from './movies';
import { mockUsers } from './users';

export const mockWatchHistory: WatchHistory[] = [
  {
    id: 'history-1',
    userId: mockUsers[1].id,
    episodeId: mockEpisodes[0].id,
    episode: {
      id: mockEpisodes[0].id,
      title: mockEpisodes[0].title,
      episodeNumber: mockEpisodes[0].episodeNumber,
      movieId: mockEpisodes[0].movieId
    },
    movie: {
      id: mockMovies[0].id,
      title: mockMovies[0].title,
      posterUrl: mockMovies[0].posterUrl
    },
    progress: 1200, // 20 phút
    completed: false,
    watchedAt: '2023-03-15T14:30:00Z'
  },
  {
    id: 'history-2',
    userId: mockUsers[1].id,
    episodeId: mockEpisodes[1].id,
    episode: {
      id: mockEpisodes[1].id,
      title: mockEpisodes[1].title,
      episodeNumber: mockEpisodes[1].episodeNumber,
      movieId: mockEpisodes[1].movieId
    },
    movie: {
      id: mockMovies[0].id,
      title: mockMovies[0].title,
      posterUrl: mockMovies[0].posterUrl
    },
    progress: 3120, // Hoàn thành
    completed: true,
    watchedAt: '2023-03-15T18:30:00Z'
  },
  {
    id: 'history-3',
    userId: mockUsers[2].id,
    episodeId: mockEpisodes[3].id,
    episode: {
      id: mockEpisodes[3].id,
      title: mockEpisodes[3].title,
      episodeNumber: mockEpisodes[3].episodeNumber,
      movieId: mockEpisodes[3].movieId
    },
    movie: {
      id: mockMovies[1].id,
      title: mockMovies[1].title,
      posterUrl: mockMovies[1].posterUrl
    },
    progress: 1500, // 25 phút
    completed: false,
    watchedAt: '2023-03-18T20:15:00Z'
  },
  {
    id: 'history-4',
    userId: mockUsers[3].id,
    episodeId: mockEpisodes[5].id,
    episode: {
      id: mockEpisodes[5].id,
      title: mockEpisodes[5].title,
      episodeNumber: mockEpisodes[5].episodeNumber,
      movieId: mockEpisodes[5].movieId
    },
    movie: {
      id: mockMovies[2].id,
      title: mockMovies[2].title,
      posterUrl: mockMovies[2].posterUrl
    },
    progress: 3540, // Hoàn thành
    completed: true,
    watchedAt: '2023-03-20T21:00:00Z'
  }
];

export const getUserWatchHistory = (userId: string): WatchHistoryListResponse => {
  const history = mockWatchHistory.filter(item => item.userId === userId);
  
  return {
    history,
    totalPages: 1,
    currentPage: 1,
    totalItems: history.length
  };
}; 