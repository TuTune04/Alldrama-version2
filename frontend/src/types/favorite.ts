import { Movie } from './movie';

export interface Favorite {
  id: string;
  userId: string;
  movieId: string;
  movie?: Movie;
  createdAt: string;
}

export interface FavoriteListResponse {
  favorites: Favorite[];
  totalPages: number;
  currentPage: number;
  totalFavorites: number;
}

export interface AddFavoriteDto {
  movieId: string;
} 