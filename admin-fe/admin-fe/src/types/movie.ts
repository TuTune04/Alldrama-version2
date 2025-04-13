export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  releaseYear: number;
  duration: number;
  status: 'published' | 'draft';
  genres: string[];
  rating: number;
}