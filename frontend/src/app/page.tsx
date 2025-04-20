import Hero from '@/components/ui/Hero';
import MovieSlider from '@/components/features/movie/MovieSlider';
import TopMoviesSection from '@/components/features/movie/TopMoviesSection';
import GenreList from '@/components/features/genre/GenreList';
import CommentsAndRankings from "@/components/features/movie/CommentsAndRankings"
import FeaturedContentSwitcher from '@/components/features/movie/FeaturedContentSwitcher';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Hero />
      
      {/* Top 10 Movies Section with trapezoid cards */}
      {/* <TopMoviesSection movies={mostViewedMovies} /> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section for featured movie sliders */}
        <section className="py-4 space-y-12">
          <MovieSlider 
            title="Phim mới nhất" 
            endpoint="newest"
            size="md"
            variant="new" 
          />
          
          <MovieSlider 
            title="Phim xem nhiều" 
            endpoint="popular"
            size="md"
            variant="popular" 
          />
          
          <MovieSlider 
            title="Phim đánh giá cao" 
            endpoint="featured"
            size="md"
            variant="top" 
          />
          
          <MovieSlider 
            title="Phim đang hot" 
            endpoint="trending" 
            size="md"
            variant="trending"
          />
          
          {/* Thêm slider phim theo thể loại */}
          <MovieSlider 
            title="Phim hành động" 
            genreId={1}
            size="md"
            variant="default"
          />
        </section>
        
        {/* Genre list section */}
        <section className="py-8 mt-8">
          <GenreList />
        </section>
      </div>
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CommentsAndRankings />
      </div>

      <FeaturedContentSwitcher
        items={mockMovies}
        title="Phim nổi bật"
        variant="dark"
        aspectRatio="video"
      /> */}
    </div>
  );
}
