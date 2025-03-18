'use client'
import { useState, useRef } from 'react';
import { Movie } from '@/types';
import MovieCard from './MovieCard';

interface MovieSliderProps {
  title: string;
  movies: Movie[];
  viewMoreLink?: string;
}

const MovieSlider = ({ title, movies, viewMoreLink }: MovieSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    
    const { scrollLeft, clientWidth, scrollWidth } = sliderRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
    
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    
    // Kiểm tra nếu có thể scroll tiếp không sau khi scroll xong
    setTimeout(() => {
      if (!sliderRef.current) return;
      
      const newScrollLeft = sliderRef.current.scrollLeft;
      setShowLeftButton(newScrollLeft > 0);
      setShowRightButton(newScrollLeft + clientWidth < scrollWidth);
    }, 300);
  };

  const handleScroll = () => {
    if (!sliderRef.current) return;
    
    const { scrollLeft, clientWidth, scrollWidth } = sliderRef.current;
    setShowLeftButton(scrollLeft > 0);
    setShowRightButton(scrollLeft + clientWidth < scrollWidth);
  };

  return (
    <div className="relative py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
        {viewMoreLink && (
          <a href={viewMoreLink} className="text-red-500 hover:text-red-400 text-sm">
            Xem thêm
          </a>
        )}
      </div>
      
      <div className="relative group">
        {showLeftButton && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-black/70 rounded-full cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        <div
          ref={sliderRef}
          className="flex overflow-x-auto scrollbar-hide gap-4 pb-4"
          onScroll={handleScroll}
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-none w-[180px] sm:w-[220px] md:w-[240px]">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        
        {showRightButton && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-black/70 rounded-full cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieSlider; 