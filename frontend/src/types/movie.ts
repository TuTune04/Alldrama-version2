import { Genre } from './genre';
import { Episode } from './episode';

export interface Movie {
  id: string;
  title: string;
  description: string;
  releaseYear: number;
  posterUrl: string;
  trailerUrl: string;
  genres: Genre[] | string[];
  episodes?: Episode[];
  rating?: number;
  views?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MovieListResponse {
  movies: Movie[];
  totalPages: number;
  currentPage: number;
  totalMovies: number;
}

export interface MovieSearchParams {
  query?: string;
  page?: number;
  limit?: number;
  genre?: string;
  year?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateMovieDto {
  title: string;
  description: string;
  releaseYear: number;
  posterUrl: string;
  trailerUrl: string;
  genres: string[];
}

export interface UpdateMovieDto extends Partial<CreateMovieDto> {} 