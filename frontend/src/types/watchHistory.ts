import { Episode } from './episode';
import { Movie } from './movie';

export interface WatchHistory {
  id: number;
  userId: number;
  movieId: number;
  episodeId: number;
  watchedAt: string;
  progress: number;
  duration: number;
  isCompleted: boolean;
  movie?: {
    id: number;
    title: string;
    posterUrl: string;
    genres?: Array<{
      id: number;
      name: string;
    }>;
  };
  episode?: {
    id: number;
    title: string;
    episodeNumber: number;
  };
}

export interface WatchHistoryRequest {
  movieId: string | number;
  episodeId: string | number;
  progress: number;
  duration: number;
}

export interface WatchHistoryResponse {
  message: string;
  watchHistory: WatchHistory;
  viewIncreased: boolean;
}