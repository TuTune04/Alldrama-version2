'use client'

import { useState, useRef, useEffect, useCallback } from "react"
import type { Movie } from "@/types"
import MovieCard from "./MovieCard"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { mockMovies } from "@/mocks"

interface MovieSliderProps {
  title: string
  movies?: Movie[]
  viewAllHref?: string
  variant?: "default" | "popular" | "trending" | "new" | "top"
  useSimpleScroll?: boolean // Add option to use simple scroll method
}

const MovieSlider = ({ 
  title, 
  movies = mockMovies, 
  variant = "default", 
  viewAllHref = "/movie",
  useSimpleScroll = false // Default to false to maintain existing behavior
}: MovieSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleItems, setVisibleItems] = useState(4)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [maxScrollPosition, setMaxScrollPosition] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Determine color based on variant
  const getAccentColor = () => {
    switch (variant) {
      case "popular": return "bg-amber-600"
      case "trending": return "bg-rose-600"
      case "new": return "bg-emerald-600"
      case "top": return "bg-sky-600"
      default: return "bg-amber-600"
    }
  }
  
  // Get gradient background based on variant
  const getGradientBg = () => {
    switch (variant) {
      case "popular": return "from-amber-600/10 to-transparent"
      case "trending": return "from-rose-600/10 to-transparent"
      case "new": return "from-emerald-600/10 to-transparent"
      case "top": return "from-sky-600/10 to-transparent"
      default: return "from-amber-600/10 to-transparent"
    }
  }

  // Handle responsiveness
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      // Set mobile state
      setIsMobile(width < 768)
      
      if (width >= 1280) { // xl and 2xl
        setVisibleItems(4)
      } else if (width >= 1024) { // lg
        setVisibleItems(4)
      } else if (width >= 768) { // md
        setVisibleItems(3)
      } else { // sm and xs
        setVisibleItems(2)
      }

      if (containerRef.current) {
        const totalItems = movies.length
        const maxPosition = Math.max(0, totalItems - visibleItems)
        setMaxScrollPosition(maxPosition)
      }
    }
    
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [movies.length, visibleItems])

  // Update maxScrollPosition when movies or visibleItems change
  useEffect(() => {
    const totalItems = movies.length
    const maxPosition = Math.max(0, totalItems - visibleItems)
    setMaxScrollPosition(maxPosition)
    
    // Reset scroll position if it exceeds new max
    if (scrollPosition > maxPosition) {
      setScrollPosition(maxPosition)
    }
  }, [movies.length, visibleItems, scrollPosition])

  // Scroll handler for buttons
  const scroll = useCallback((direction: "left" | "right") => {
    setScrollPosition(prev => {
      if (direction === "left") {
        return Math.max(0, prev - 1)
      } else {
        return Math.min(maxScrollPosition, prev + 1)
      }
    })
  }, [maxScrollPosition])

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
    sliderRef.current.style.cursor = 'grabbing';
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
      // Snap to nearest card
      const cardWidth = sliderRef.current.scrollWidth / movies.length;
      const newPosition = Math.round(sliderRef.current.scrollLeft / cardWidth);
      setScrollPosition(Math.min(newPosition, maxScrollPosition));
    }
  }, [movies.length, maxScrollPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Adjust scroll speed
    sliderRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current) return;
    
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    if (sliderRef.current) {
      // Snap to nearest card
      const cardWidth = sliderRef.current.scrollWidth / movies.length;
      const newPosition = Math.round(sliderRef.current.scrollLeft / cardWidth);
      setScrollPosition(Math.min(newPosition, maxScrollPosition));
    }
  }, [movies.length, maxScrollPosition]);

  const canScrollLeft = scrollPosition > 0
  const canScrollRight = scrollPosition < maxScrollPosition && movies.length > visibleItems

  if (!movies || movies.length === 0) {
    return null
  }

  // Decide which scrolling method to use based on props or screen size
  const useOverflowScroll = useSimpleScroll || isMobile

  return (
    <div className={`relative my-6 px-4 sm:px-6 bg-gradient-to-r ${getGradientBg()}`}>
      <div className="py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-1 h-6 ${getAccentColor()} rounded-full`}></div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{title}</h2>
          </div>
          <Link 
            href={viewAllHref}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Xem tất cả
          </Link>
        </div>

        <div ref={containerRef} className="relative overflow-hidden">
          {!useOverflowScroll && (
            <>
              <Button 
                size="icon"
                variant="outline"
                onClick={() => scroll("left")} 
                disabled={!canScrollLeft}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full ${
                  canScrollLeft 
                    ? 'bg-gray-800/80 hover:bg-gray-700 border-gray-700' 
                    : 'bg-gray-800/50 cursor-not-allowed border-transparent opacity-50'
                } hidden sm:flex`}
              >
                <ChevronLeft size={20} />
              </Button>

              <Button 
                size="icon"
                variant="outline"
                onClick={() => scroll("right")} 
                disabled={!canScrollRight}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full ${
                  canScrollRight 
                    ? 'bg-gray-800/80 hover:bg-gray-700 border-gray-700' 
                    : 'bg-gray-800/50 cursor-not-allowed border-transparent opacity-50'
                } hidden sm:flex`}
              >
                <ChevronRight size={20} />
              </Button>
            </>
          )}

          {useOverflowScroll ? (
            // Simple overflow scroll method for mobile
            <div 
              ref={sliderRef}
              className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide"
            >
              {movies.map((movie) => (
                <div 
                  key={movie.id}
                  className="flex-shrink-0 snap-start"
                  style={{ width: `${100 / Math.min(2, visibleItems)}%`, minWidth: '200px' }}
                >
                  <MovieCard movie={movie} variant="slider" />
                </div>
              ))}
            </div>
          ) : (
            // Original slider with transform-based scrolling for desktop
            <div
              ref={sliderRef}
              className="flex gap-4 transition-transform duration-300 ease-out cursor-grab select-none"
              style={{
                transform: `translateX(-${scrollPosition * (100 / visibleItems)}%)`,
                width: `${(movies.length / visibleItems) * 100}%`
              }}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {movies.map((movie) => (
                <div 
                  key={movie.id}
                  className="flex-shrink-0"
                  style={{ width: `${100 / visibleItems}%` }}
                >
                  <MovieCard movie={movie} variant="slider" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieSlider