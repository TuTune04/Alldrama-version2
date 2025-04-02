import { Suspense } from 'react';
import MovieDetail from '@/components/features/movie/MovieDetail';
import { mockMovies } from '@/mocks';
import { getEpisodeListResponse } from '@/mocks/episodes';
import MovieSlider from '@/components/features/movie/MovieSlider';
import { getIdFromSlug} from '@/utils/url';
interface MovieDetailPageProps {
  params: {
    slug: string
  };
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  console.log("Slug received:", params.slug);
  const movieId = getIdFromSlug(params.slug);
  console.log("Extracted movieId:", movieId);
  console.log("Available movie IDs:", mockMovies.map(m => m.id));
  
  const movie = mockMovies.find(m => m.id === movieId);
  console.log("Found movie:", movie ? `${movie.id} - ${movie.title}` : "Not found");
  
  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl text-white font-bold">Không tìm thấy phim</h1>
        <p className="text-gray-400 mt-4">Phim bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
      </div>
    );
  }
  
  const episodeList = getEpisodeListResponse(movieId);
  
  // Lọc phim cùng thể loại
  const relatedMovies = mockMovies
    .filter(m => 
      m.id !== movieId && 
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
      
      {relatedMovies.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <MovieSlider title="Phim tương tự" movies={relatedMovies} viewMoreLink={`/movie?genre=${encodeURIComponent(typeof movie.genres[0] === 'string' ? movie.genres[0] : movie.genres[0].name)}`} />
        </div>
      )}
    </div>
  );
} 