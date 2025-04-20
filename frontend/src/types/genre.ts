export interface Genre {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GenreWithMovies {
  genre: Genre;
  movies: {
    id: number;
    title: string;
    rating: number;
    views: number;
    summary: string;
    posterUrl: string;
    releaseYear: number;
  }[];
}