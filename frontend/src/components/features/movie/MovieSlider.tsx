'use client'

import Link from "next/link"
import type { Movie } from "@/types"
import MovieCard from "./MovieCard"
import { Button } from "@/components/ui/button"
import { mockMovies } from "@/mocks"
import { generateMovieUrl } from "@/utils/url"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, TrendingUp, Star, Clock } from "lucide-react"
import MoviePopover from "./MoviePopover"
import { useState } from "react"
import { useMobile } from "@/hooks/use-mobile"

interface MovieSliderProps {
  title: string
  movies?: Movie[]
  variant?: "default" | "popular" | "trending" | "new" | "top"
  className?: string
  maxItems?: number
  size?: 'sm' | 'md' | 'lg'
  showPopover?: boolean
}

const MovieSlider = ({ 
  title, 
  movies = mockMovies, 
  variant = "default",
  className = "",
  maxItems = 5,
  size = 'md',
  showPopover = true
}: MovieSliderProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const isMobileSmall = useMobile(768);
  const isMobileLarge = useMobile(1024);
  
  // Determine device type from breakpoints
  const isMobile = isMobileSmall;
  const isTablet = isMobileLarge && !isMobileSmall;
  
  if (!movies || movies.length === 0) return null;
  
  // Adjust maxItems based on screen size
  const responsiveMaxItems = isTablet ? 4 : maxItems;
  
  // Limit the number of movies to maxItems and handle pagination
  const totalPages = Math.ceil(movies.length / responsiveMaxItems);
  const startIndex = currentPage * responsiveMaxItems;
  const displayMovies = movies.slice(startIndex, startIndex + responsiveMaxItems);
  
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };
  
  // Handle touch events for mobile scrolling
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    // No action needed - we're using native scroll behavior instead of pagination
    // Reset values
    setTouchStart(0);
    setTouchEnd(0);
  };
  
  return (
    <div className={cn("w-full mb-8 md:mb-12", className)}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-6 bg-indigo-500 rounded-full`}></div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-400">
            {title}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {totalPages > 1 && !isMobile && (
            <div className="flex items-center space-x-2">
              <Button 
                size="icon"
                variant="outline"
                onClick={handlePrevPage} 
                disabled={currentPage === 0}
                className={`rounded-full ${
                  currentPage > 0 
                    ? 'bg-black/80 hover:bg-black/60 border-gray-700' 
                    : 'bg-black/50 cursor-not-allowed border-transparent opacity-50'
                } flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9`}
              >
                <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
              </Button>

              <Button 
                size="icon"
                variant="outline"
                onClick={handleNextPage} 
                disabled={currentPage >= totalPages - 1}
                className={`rounded-full ${
                  currentPage < totalPages - 1 
                    ? 'bg-black/80 hover:bg-black/60 border-gray-700' 
                    : 'bg-black/50 cursor-not-allowed border-transparent opacity-50'
                } flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9`}
              >
                <ChevronRight size={16} className="sm:w-5 sm:h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {isMobile ? (
        // Mobile/tablet view with horizontal scrolling
        <div 
          className="overflow-x-auto flex gap-3 snap-x snap-mandatory scrollbar-hide pb-4"
          style={{ 
            scrollbarWidth: 'none', 
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory'
          }}
        >
          {displayMovies.map((movie, index) => (
            <div 
              key={String(movie.id)}
              className="flex-shrink-0 snap-start" 
              style={{ 
                width: isMobile ? 'calc(50% - 0.75rem)' : 'calc(33.333% - 1rem)',
                scrollSnapAlign: 'start'
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
              >
                <MoviePopover
                  movie={movie}
                  trigger={
                    <Link 
                      href={generateMovieUrl(movie.id, movie.title)} 
                      className="transition-transform hover:scale-[1.03] duration-300 block w-full h-full"
                    >
                      <MovieCard
                        movie={movie}
                        index={index}
                        variant={variant === "trending" ? "trending" : "slider"}
                        trapezoid={false}
                        fullWidth={true}
                        className="h-full"
                      />
                    </Link>
                  }
                  size={size}
                  showPopover={showPopover}
                />
              </motion.div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop view with grid layout
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {displayMovies.map((movie, index) => (
            <motion.div
              key={String(movie.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeOut"
              }}
            >
              <MoviePopover
                movie={movie}
                trigger={
                  <Link 
                    href={generateMovieUrl(movie.id, movie.title)} 
                    className="transition-transform hover:scale-[1.03] duration-300 block w-full h-full"
                  >
                    <MovieCard
                      movie={movie}
                      index={index}
                      variant={variant === "trending" ? "trending" : "slider"}
                      trapezoid={false}
                      fullWidth={true}
                      className="h-full"
                    />
                  </Link>
                }
                size={size}
                showPopover={showPopover}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MovieSlider