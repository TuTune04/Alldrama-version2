'use client';

import { Suspense, use } from 'react';
import MovieDetail from '@/components/features/movie/MovieDetail';
import { useMovies } from '@/hooks/api/useMovies';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MovieDetailPageProps {
  params: Promise<{
    slug: string // Slug của phim như "ten-phim-123" - final number is the ID
  }>;
}

export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  // Unwrap params Promise with React.use()
  const { slug } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movieId, setMovieId] = useState<string | number | null>(null);
  
  // Extract the movie ID from the slug (assuming slug format is "ten-phim-123")
  useEffect(() => {
    console.log("Slug received:", slug);
    
    // Extract ID - it should be the last part after the last hyphen
    const parts = slug.split('-');
    const id = parts[parts.length - 1];
    
    if (!id || isNaN(Number(id))) {
      console.error("Could not extract numeric ID from slug:", slug);
      setError("Không tìm thấy phim");
    } else {
      console.log("Using movie ID:", id);
      setMovieId(id);
    }
    
    setIsLoading(false);
  }, [slug]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="h-[70vh] bg-gray-800 animate-pulse flex items-center justify-center">
        <Skeleton className="w-3/4 h-[80%] max-w-7xl mx-auto rounded-xl" />
      </div>
    );
  }
  
  // Show error state
  if (error || !movieId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Alert variant="destructive" className="bg-red-950/50 border-red-800 text-white">
          <AlertDescription className="text-center">
            <h1 className="text-2xl text-white font-bold">Không tìm thấy phim</h1>
            <p className="text-gray-400 mt-4">Phim bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
          </AlertDescription>
        </Alert>
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