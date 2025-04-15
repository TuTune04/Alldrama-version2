import { Suspense } from 'react';
import MovieDetail from '@/components/features/movie/MovieDetail';
import { mockMovies } from '@/mocks';
import { getEpisodeListResponse } from '@/mocks/episodes';
import MovieSlider from '@/components/features/movie/MovieSlider';
import { createSlug } from '@/utils/url';

interface MovieDetailPageProps {
  params: {
    slug: string // Slug của phim như "ten-phim"
  };
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  console.log("Slug received:", params.slug);
  
  // Tìm phim dựa trên slug
  const movie = mockMovies.find(m => createSlug(m.title) === params.slug);
  console.log("Found movie:", movie ? `${movie.id} - ${movie.title}` : "Not found");
  
  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl text-white font-bold">Không tìm thấy phim</h1>
        <p className="text-gray-400 mt-4">Phim bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
      </div>
    );
  }
  
  const episodeList = getEpisodeListResponse(movie.id);
  
  // Lọc phim cùng thể loại
  const relatedMovies = mockMovies
    .filter(m => 
      m.id !== movie.id && 
      m.genres.some(g1 => 
        movie.genres.some(g2 => {
          const name1 = typeof g1 === 'string' ? g1 : g1.name;
          const name2 = typeof g2 === 'string' ? g2 : g2.name;
          return name1 === name2;
        })
      )
    )
    .slice(0, 10);
  
  return (
    <div>
      <Suspense fallback={<div className="h-[70vh] bg-gray-800 animate-pulse"></div>}>
        <MovieDetail movie={movie} episodes={episodeList.episodes} />
      </Suspense>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {relatedMovies.length > 0 ? (
          <MovieSlider 
            title="Phim tương tự" 
            movies={relatedMovies} 
            variant="trending"
            viewAllHref={`/movie?genre=${encodeURIComponent(typeof movie.genres[0] === 'string' ? movie.genres[0] : movie.genres[0].name)}`} 
          />
        ) : (
          <MovieSlider 
            title="Phim phổ biến" 
            variant="popular"
            viewAllHref="/movie?sort=most-viewed" 
          />
        )}
      </div>
    </div>
  );
}