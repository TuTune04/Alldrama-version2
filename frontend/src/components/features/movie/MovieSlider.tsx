"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { Movie } from "@/types"
import MovieCard from "./MovieCard"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { mockMovies, mockMovieListResponse } from "@/mocks"

interface MovieSliderProps {
  title: string
  movies?: Movie[]
  viewMoreLink?: string
  variant?: "default" | "popular" | "trending" | "new" | "top"
  viewAllHref?: string
}

const MovieSlider = ({ 
  title, 
  movies = mockMovies, 
  variant = "default", 
  viewAllHref = "/movie" 
}: MovieSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleItems, setVisibleItems] = useState(3) // Default maximum is 3 items
  const [scrollPosition, setScrollPosition] = useState(0)
  const [maxScrollPosition, setMaxScrollPosition] = useState(0)

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
  
  // Get border color based on variant
  const getBorderColor = () => {
    switch (variant) {
      case "popular": return "border-amber-600/20"
      case "trending": return "border-rose-600/20"
      case "new": return "border-emerald-600/20"
      case "top": return "border-sky-600/20"
      default: return "border-amber-600/20"
    }
  }

  // Handle responsiveness for different screen sizes
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      // Vì card đã chuyển sang dạng ngang, nên giảm số lượng item hiển thị
      if (width >= 1280) { // xl and 2xl
        setVisibleItems(3)
      } else if (width >= 1024) { // lg
        setVisibleItems(3)
      } else if (width >= 768) { // md
        setVisibleItems(2)
      } else if (width >= 640) { // sm
        setVisibleItems(2)
      } else { // xs
        setVisibleItems(2) // phù hợp với thẻ ngang trên mobile
      }

      // Update container width
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        // Calculate max scroll position based on movie count and visible items
        const totalItems = movies.length
        const maxPosition = Math.max(0, totalItems - visibleItems)
        setMaxScrollPosition(maxPosition)
      }
    }
    
    // Set initial visible items
    handleResize()
    
    // Update visible items on resize
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [movies.length])

  // Scroll carousel handler
  const scroll = useCallback((direction: "left" | "right") => {
    setScrollPosition(prev => {
      if (direction === "left") {
        return Math.max(0, prev - Math.floor(visibleItems))
      } else {
        return Math.min(maxScrollPosition, prev + Math.floor(visibleItems))
      }
    })
  }, [maxScrollPosition, visibleItems])
  
  // Check if navigation buttons should be enabled
  const canScrollLeft = scrollPosition > 0
  const canScrollRight = scrollPosition < maxScrollPosition && movies.length > visibleItems

  // If there are no movies to display, return nothing
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className={`relative my-8 p-6 rounded-xl bg-gradient-to-r ${getGradientBg()} border ${getBorderColor()} shadow-lg overflow-hidden`}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column: Title, description and navigation */}
        <div className="md:w-1/4 flex flex-col">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-1 h-6 ${getAccentColor()} rounded-full`}></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{title}</h2>
            </div>
            <p className="text-gray-300 text-sm md:text-base mb-4 hidden md:block">
              Khám phá những bộ phim {title.toLowerCase()} với chất lượng hình ảnh tuyệt vời và nội dung đặc sắc.
            </p>
            <Link 
              href={viewAllHref} 
              className="inline-flex items-center text-sm font-medium text-white bg-gray-800/60 hover:bg-gray-700/80 transition-colors py-2 px-4 rounded-md mt-2"
            >
              Xem tất cả
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
        
        {/* Right column: Movie slider container */}
        <div className="md:w-3/4">
          {/* Slider container */}
          <div 
            ref={containerRef}
            className="relative w-full overflow-hidden" 
          >
            {/* Left navigation button */}
            <Button 
              size="icon"
              variant="outline"
              onClick={() => scroll("left")} 
              disabled={!canScrollLeft}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full ${canScrollLeft ? 'bg-gray-800/80 hover:bg-gray-700 border-gray-700' : 'bg-gray-800/50 cursor-not-allowed border-transparent opacity-50'}`}
            >
              <ChevronLeft size={20} />
            </Button>
            
            {/* Right navigation button */}
            <Button 
              size="icon"
              variant="outline"
              onClick={() => scroll("right")} 
              disabled={!canScrollRight}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full ${canScrollRight ? 'bg-gray-800/80 hover:bg-gray-700 border-gray-700' : 'bg-gray-800/50 cursor-not-allowed border-transparent opacity-50'}`}
            >
              <ChevronRight size={20} />
            </Button>

            <div
              ref={sliderRef}
              className="flex gap-4 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${scrollPosition * (100 / visibleItems)}%)`,
                width: `${(movies.length / visibleItems) * 100}%`,
              }}
            >
              {movies.map((movie, index) => (
                <div 
                  key={movie.id}
                  className="flex-shrink-0 group relative py-2 px-1"
                  style={{ width: `${100 / movies.length}%` }}
                >
                  <div className="relative transition-all duration-300 hover:z-50 hover:scale-105 shadow-md hover:shadow-xl hover:shadow-black/30">
                    <MovieCard movie={movie} index={index} variant="slider" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieSlider

