import { Episode } from './episode';
import { Movie } from './movie';

export interface WatchHistory {
  id: string;
  userId: string;
  episodeId: string;
  episode?: {
    id: string;
    title: string;
    episodeNumber: number;
    movieId: string;
  };
  movie?: {
    id: string;
    title: string;
    posterUrl: string;
  };
  progress: number;
  completed: boolean;
  watchedAt: string;
}

export interface WatchHistoryListResponse {
  history: WatchHistory[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export interface AddWatchHistoryDto {
  episodeId: string;
  progress: number;
  completed: boolean;
} 