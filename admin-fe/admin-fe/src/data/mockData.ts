import { Movie } from '@/types/movie';

export const mockMovies: Movie[] = [
  {
    id: '1',
    title: 'Inception',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8IB2e4r4oVhHnANbnm7O3Tj6tF8.jpg',
    releaseYear: 2010,
    duration: 148,
    status: 'published',
    genres: ['Action', 'Sci-Fi'],
    rating: 8.8
  },
  {
    id: '2',
    title: 'The Dark Knight',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    releaseYear: 2008,
    duration: 152,
    status: 'published',
    genres: ['Action', 'Crime', 'Drama'],
    rating: 9.0
  },
  {
    id: '3',
    title: 'Interstellar',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    releaseYear: 2014,
    duration: 169,
    status: 'published',
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    rating: 8.6
  },
  {
    id: '4',
    title: 'The Matrix',
    posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    releaseYear: 1999,
    duration: 136,
    status: 'published',
    genres: ['Action', 'Sci-Fi'],
    rating: 8.7
  },
  {
    id: '5',
    title: 'Pulp Fiction',
    posterUrl: 'https://image.tmdb.org/t/p/w500/fIE3lAGcZDV1G6XM5KmuWnNsPp1.jpg',
    releaseYear: 1994,
    duration: 154,
    status: 'draft',
    genres: ['Crime', 'Drama'],
    rating: 8.9
  }
];