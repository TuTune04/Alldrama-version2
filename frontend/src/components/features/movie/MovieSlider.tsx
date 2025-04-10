"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { Movie } from "@/types"
import MovieCard from "./MovieCard"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface MovieSliderProps {
  title: string
  movies: Movie[]
  viewMoreLink?: string
  variant?: "default" | "popular" | "trending" | "new" | "top"
  viewAllHref?: string
}

const MovieSlider = ({ title, movies, variant = "default", viewAllHref = "/movie" }: MovieSliderProps) => {
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

  // Handle responsiveness for different screen sizes
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      if (width >= 1280) { // xl and 2xl
        setVisibleItems(5)
      } else if (width >= 1024) { // lg
        setVisibleItems(4)
      } else if (width >= 768) { // md
        setVisibleItems(3.5)
      } else if (width >= 640) { // sm
        setVisibleItems(3)
      } else { // xs
        setVisibleItems(2) // 2 items on mobile for better UX
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

  return (
    <div className="relative py-6 md:py-8 overflow-hidden">
      {/* Title and navigation buttons */}
      <div className="flex items-stretch mb-6">
        {/* Left column: Title and View All link */}
        <div className="md:w-1/4 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-1 h-6 ${getAccentColor()} rounded-full`}></div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{title}</h2>
          </div>
          
          <Link 
            href={viewAllHref} 
            className="hidden sm:flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors mt-2"
          >
            Xem tất cả
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        {/* Right column: carousel navigation */}
        <div className="md:w-3/4 ml-auto flex items-end justify-end gap-2">
          <Button 
            size="icon"
            variant="outline"
            onClick={() => scroll("left")} 
            disabled={!canScrollLeft}
            className={`rounded-full ${canScrollLeft ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-gray-800/50 cursor-not-allowed border-transparent opacity-50'}`}
          >
            <ChevronLeft size={20} />
          </Button>
          
          <Button 
            size="icon"
            variant="outline"
            onClick={() => scroll("right")} 
            disabled={!canScrollRight}
            className={`rounded-full ${canScrollRight ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-gray-800/50 cursor-not-allowed border-transparent opacity-50'}`}
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>
      
      {/* "View all" link for small screens */}
      <div className="sm:hidden mb-4">
        <Link 
          href={viewAllHref}
          className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Xem tất cả
          <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>
      
      {/* Slider container */}
      <div 
        ref={containerRef}
        className="relative w-full overflow-hidden" 
      >
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
              className="flex-shrink-0 group relative py-4 px-1"
              style={{ width: `${100 / movies.length}%` }}
            >
              <div className="relative transition-all duration-300 hover:z-50">
                <MovieCard movie={movie} index={index} variant="slider" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MovieSlider

