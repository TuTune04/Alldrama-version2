import { Movie } from './movie';

export interface Favorite {
  id: number;
  userId: number;
  movieId: number;
  favoritedAt: string;
  movie?: {
    id: number;
    title: string;
    rating: number;
    posterUrl: string;
    genres: Array<{
      id: number;
      name: string;
    }>;
  };
}

export interface FavoriteRequest {
  movieId: string | number;
}

export interface FavoriteResponse {
  message: string;
  favorited: boolean;
}