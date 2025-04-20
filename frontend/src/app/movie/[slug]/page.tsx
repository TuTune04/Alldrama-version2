import { Suspense } from 'react';
import MovieDetail from '@/components/features/movie/MovieDetail';
import { mockMovies } from '@/mocks';
import { createSlug, getIdFromSlug } from '@/utils/url';

interface MovieDetailPageProps {
  params: {
    slug: string // Slug của phim như "ten-phim-123" - final number is the ID
  };
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  console.log("Slug received:", params.slug);
  
  // Extract the movie ID from the slug (assuming slug format is "movie-name-ID")
  const movieId = getIdFromSlug(params.slug);
  
  if (!movieId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl text-white font-bold">Không tìm thấy phim</h1>
        <p className="text-gray-400 mt-4">Phim bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
      </div>
    );
  }
  
  return (
    <div>
      <Suspense fallback={<div className="h-[70vh] bg-gray-800 animate-pulse"></div>}>
        <MovieDetail movieId={movieId} />
      </Suspense>
    </div>
  );
}