import { Suspense } from 'react';
import MovieGrid from '@/components/ui/MovieGrid';
import { mockMovieListResponse } from '@/mocks';
import GenreList from '@/components/ui/GenreList';

export default function MovieListPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Danh sách phim</h1>
      
      <div className="mb-8">
        <GenreList />
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <Suspense fallback={<MovieGridSkeleton />}>
          <MovieGrid movieList={mockMovieListResponse} />
        </Suspense>
      </div>
    </div>
  );
}

const MovieGridSkeleton = () => {
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
}; 