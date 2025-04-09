import Hero from '@/components/ui/Hero';
import MovieSlider from '@/components/features/movie/MovieSlider';
import GenreList from '@/components/features/genre/GenreList';
import TopMoviesSection from '@/components/features/movie/TopMoviesSection';
import { mockMovies } from '@/mocks';

export default function Home() {
  // Phim mới nhất (sắp xếp theo thời gian tạo)
  const newestMovies = [...mockMovies].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Phim được xem nhiều nhất
  const mostViewedMovies = [...mockMovies].sort((a, b) => 
    (b.views || 0) - (a.views || 0)
  );

  // Phim có đánh giá cao nhất
  const topRatedMovies = [...mockMovies].sort((a, b) => 
    (b.rating || 0) - (a.rating || 0)
  );

  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Top 10 Movies Section with trapezoid cards */}
      <TopMoviesSection movies={mostViewedMovies} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MovieSlider 
          title="Phim mới nhất" 
          movies={newestMovies} 
          viewMoreLink="/movie?sort=newest" 
        />
        
        <MovieSlider 
          title="Phim xem nhiều" 
          movies={mostViewedMovies} 
          viewMoreLink="/movie?sort=most-viewed" 
        />
        
        <MovieSlider 
          title="Phim đánh giá cao" 
          movies={topRatedMovies} 
          viewMoreLink="/movie?sort=top-rated" 
        />
        
        <GenreList />
      </div>
    </div>
  );
}
