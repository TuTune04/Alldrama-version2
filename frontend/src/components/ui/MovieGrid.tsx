import { Movie, MovieListResponse } from '@/types';
import MovieCard from './MovieCard';

interface MovieGridProps {
  movieList: MovieListResponse;
  isLoading?: boolean;
}

const MovieGrid = ({ movieList, isLoading = false }: MovieGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-[2/3] bg-gray-700 rounded-lg w-full"></div>
            <div className="mt-2 h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="mt-2 h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!movieList.movies || movieList.movies.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-400 text-lg">Không tìm thấy phim nào phù hợp với tiêu chí tìm kiếm.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {movieList.movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

export default MovieGrid; 