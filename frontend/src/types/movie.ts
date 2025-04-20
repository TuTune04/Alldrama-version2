import { Genre } from './genre';
import { PaginatedData } from './api';

export interface Movie {
  id: string | number;
  title: string;
  summary: string;
  duration: number;
  totalEpisodes: number;
  releaseYear: number;
  posterUrl: string;
  trailerUrl: string;
  playlistUrl: string;
  backdropUrl?: string;
  genres: Genre[];
  rating?: number;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MovieListResponse {
  movies: Movie[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  }
}

export interface MovieSearchParams {
  q?: string;
  genre?: number;
  year?: number;
  page?: number;
  limit?: number;
  sort?: 'title' | 'rating' | 'views' | 'releaseYear' | 'createdAt';
  order?: 'ASC' | 'DESC';
}

export interface CreateMovieDto {
  title: string;
  summary: string;
  duration: number;
  totalEpisodes: number;
  releaseYear: number;
  posterUrl: string;
  trailerUrl: string;
  playlistUrl: string;
  genreIds: number[];
}

export interface UpdateMovieDto extends Partial<CreateMovieDto> {}