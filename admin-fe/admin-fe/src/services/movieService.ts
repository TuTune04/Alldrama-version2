import { Movie } from '@/types/movie';
import { mockMovies } from '@/data/mockData';

// Mock service implementation
export const movieService = {
  getMovies: async (search?: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!search) return mockMovies;
    
    return mockMovies.filter(movie => 
      movie.title.toLowerCase().includes(search.toLowerCase())
    );
  },

  getMovie: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMovies.find(movie => movie.id === id);
  },

  createMovie: async (movie: Omit<Movie, 'id'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newMovie = {
      ...movie,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockMovies.push(newMovie);
    return newMovie;
  },

  updateMovie: async (id: string, movieData: Partial<Movie>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockMovies.findIndex(movie => movie.id === id);
    if (index !== -1) {
      mockMovies[index] = { ...mockMovies[index], ...movieData };
      return mockMovies[index];
    }
    throw new Error('Movie not found');
  },

  deleteMovie: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockMovies.findIndex(movie => movie.id === id);
    if (index !== -1) {
      mockMovies.splice(index, 1);
    }
  }
};