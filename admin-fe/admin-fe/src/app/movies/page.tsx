'use client';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import MovieTable from '@/components/modules/movies/MovieTable';
import MovieForm from '@/components/modules/movies/MovieForm';
import { Movie } from '@/types/movie';
import { movieService } from '@/services/movieService';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | undefined>();
  
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    loadMovies();
  }, [debouncedSearch]);

  const loadMovies = async () => {
    try {
      const data = await movieService.getMovies(debouncedSearch);
      setMovies(data);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await movieService.deleteMovie(id);
        await loadMovies();
      } catch (error) {
        console.error('Error deleting movie:', error);
      }
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedMovie) {
        await movieService.updateMovie(selectedMovie.id, data);
      } else {
        await movieService.createMovie(data);
      }
      await loadMovies();
      setIsFormOpen(false);
      setSelectedMovie(undefined);
    } catch (error) {
      console.error('Error saving movie:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Movies</h1>
        <button
          onClick={() => {
            setSelectedMovie(undefined);
            setIsFormOpen(true);
          }}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium  hover:bg-indigo-700"
        >
          Add New Movie
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2"
          />
        </div>
      </div>

      <div className="rounded-lg bg-black shadow">
        <MovieTable
          movies={movies}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <MovieForm
        movie={selectedMovie}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedMovie(undefined);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}