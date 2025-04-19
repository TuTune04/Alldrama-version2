import Hero from '@/components/ui/Hero';
import MovieSlider from '@/components/features/movie/MovieSlider';
import TopMoviesSection from '@/components/features/movie/TopMoviesSection';
import GenreList from '@/components/features/genre/GenreList';
import CommentsAndRankings from "@/components/features/movie/CommentsAndRankings"
import { mockMovies } from '@/mocks';
import FeaturedContentSwitcher from '@/components/features/movie/FeaturedContentSwitcher';

export default function Home() {
  // Phim mới nhất (sắp xếp theo thời gian tạo)
  const newestMovies = [...mockMovies].sort((a, b) => 
    new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime()
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
    <div className="min-h-screen bg-gray-950">
      <Hero />
      
      {/* Top 10 Movies Section with trapezoid cards */}
      <TopMoviesSection movies={mostViewedMovies} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section for featured movie sliders */}
        <section className="py-4 space-y-12">
          <MovieSlider 
            title="Phim mới nhất" 
            movies={newestMovies} 
            size="md"
            variant="new" 
          />
          
          <MovieSlider 
            title="Phim xem nhiều" 
            movies={mostViewedMovies} 
            size="md"
            variant="popular" 
          />
          
          <MovieSlider 
            title="Phim đánh giá cao" 
            movies={topRatedMovies} 
            size="md"
            variant="top" 
          />
        </section>
        
        {/* Genre list section */}
        <section className="py-8 mt-8">
          <GenreList />
        </section>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CommentsAndRankings />
      </div>

      <FeaturedContentSwitcher
        items={mockMovies}
        title="Phim nổi bật"
        variant="dark"
        aspectRatio="video"
      />
    </div>
  );
}
