'use client'

import Link from "next/link"
import Image from "next/image"
import type { Movie } from "@/types"
import { generateMovieUrl } from "@/utils/url"
import { Star, Eye, Play, Heart, Info, Calendar, Clock, Film, User } from "lucide-react"
import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import MovieCardHover from "./MovieCardHover"
// Tạm thời loại bỏ framer-motion để khắc phục lỗi
// import { motion } from "framer-motion"

interface MovieCardProps {
  movie: Movie
  index?: number
  variant?: "default" | "grid" | "slider" | "poster" | "hero"
  trapezoid?: boolean
}

const MovieCard = ({ movie, index = 0, variant = "slider", trapezoid = false }: MovieCardProps) => {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const imageUrl = movie.posterUrl || "/images/placeholder-poster.jpg"
  const [popupPosition, setPopupPosition] = useState<{ top: number, left: number } | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    isDesktop: false,
    isTablet: false,
    isMobile: false
  })
  const movieDetailUrl = generateMovieUrl(movie.id, movie.title)
  
  // Debounced resize handler
  const handleResize = useCallback(() => {
    if (typeof window === 'undefined') return
    
    const width = window.innerWidth
    setScreenSize({
      width,
      isDesktop: width >= 1024,
      isTablet: width >= 768 && width < 1024,
      isMobile: width < 768
    })
  }, [])
  
  // Initialize and track screen size
  useEffect(() => {
    // Initialize on mount
    handleResize()
    
    // Add debounced event listener
    let timeoutId: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleResize, 100)
    }
    
    window.addEventListener('resize', debouncedResize)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [handleResize])
  
  // Smart position calculation for the popup
  const calculatePopupPosition = useCallback((element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect()
    const scrollY = window.scrollY
    const scrollX = window.scrollX
    
    // Adjust based on screen size
    if (screenSize.isDesktop) {
      // On desktop, position above the card
      const top = rect.top + scrollY
      const left = rect.left + scrollX + (rect.width / 2)
      return { top, left }
    } else if (screenSize.isTablet) {
      // For tablets, we could use a different position if needed
      const top = rect.top + scrollY
      const left = rect.left + scrollX + (rect.width / 2)
      return { top, left }
    } else {
      // For mobile - though we don't show popup on mobile, including for completeness
      const top = rect.bottom + scrollY
      const left = rect.left + scrollX + (rect.width / 2)
      return { top, left }
    }
  }, [screenSize])
  
  // Handle mouse enter with position calculation
  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!screenSize.isDesktop || !cardRef.current) return
    
    const position = calculatePopupPosition(cardRef.current)
    setPopupPosition(position)
    setIsHovering(true)
  }, [screenSize.isDesktop, calculatePopupPosition])
  
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
  }, [])
  
  // Dynamic aspect ratio based on variant and screen size
  const getAspectRatio = useCallback(() => {
    // Base aspect ratios
    const aspectRatios = {
      poster: {
        mobile: "aspect-[2/3]",
        tablet: "aspect-[2/3]",
        desktop: "aspect-[2/3]"
      },
      hero: {
        mobile: "aspect-[16/9]",
        tablet: "aspect-[16/9]",
        desktop: "aspect-[16/9]"
      },
      grid: {
        mobile: "aspect-[2/3]",
        tablet: "aspect-[2/3]",
        desktop: "aspect-[2/3]"
      },
      slider: {
        mobile: "aspect-video",
        tablet: "aspect-[16/9]",
        desktop: "aspect-[16/9]"
      },
      default: {
        mobile: "aspect-[2/3]",
        tablet: "aspect-[2/3]",
        desktop: "aspect-[2/3]"
      }
    }
    
    // Get the variant's aspect ratios
    const variantRatios = aspectRatios[variant] || aspectRatios.default
    
    // Return responsive class string based on screen size
    return `${variantRatios.mobile} sm:${variantRatios.tablet} lg:${variantRatios.desktop}`
  }, [variant])
  
  // Card classes with appropriate sizing
  const getCardClasses = useCallback(() => {
    const baseClasses = "group/card relative overflow-visible"
    return `${baseClasses} w-full h-full`
  }, [])
  
  // Card click handler
  const handleCardClick = useCallback(() => {
    router.push(movieDetailUrl)
  }, [router, movieDetailUrl])
  
  return (
    <div 
      ref={cardRef}
      className={getCardClasses()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Card Container */}
      <div 
        className={`relative h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-800 transition-all duration-300 z-10 group-hover/card:border-amber-500/50 group-hover/card:shadow-lg cursor-pointer ${trapezoid ? 'transform perspective-1000' : ''}`}
        onClick={handleCardClick}
      >
        {/* Border gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/0 via-amber-600/0 to-amber-600/0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 rounded-lg group-hover/card:from-amber-600/10 group-hover/card:via-amber-600/5 group-hover/card:to-purple-700/10"></div>
        
        {/* Trapezoid shape effect */}
        {trapezoid && (
          <div className="absolute inset-0 trapezoid-shape bg-gradient-to-r from-amber-500/10 to-red-600/10 transform skew-x-6 -mx-6 z-0"></div>
        )}
        
        {/* Thumbnail Container with responsive aspect ratio */}
        <div className={`relative ${getAspectRatio()} w-full`}>
          <Image 
            src={imageUrl} 
            alt={movie.title} 
            fill 
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            priority={index < 3} // Prioritize loading of first 3 images
          />
          
          {/* Overlay for hover state */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent opacity-60 transition-opacity duration-300 group-hover/card:opacity-75"></div>
          
          {/* Movie info overlay */}
          <div className="absolute bottom-0 left-0 w-full p-2 sm:p-3 z-10">
            <div className="flex flex-col gap-1">
              <h3 className="text-white font-bold text-xs sm:text-sm md:text-base line-clamp-1 relative movie-card-title">
                {movie.title}
              </h3>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-xs">
                  {movie.releaseYear}
                </span>
                
                <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                  <div className="flex items-center">
                    <Star className="w-3 h-3 mr-0.5 sm:mr-1 text-amber-500" />
                    <span className="text-amber-400 text-xs">{movie.rating || "N/A"}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-3 h-3 mr-0.5 sm:mr-1 text-blue-400" />
                    <span className="text-blue-300 text-xs">{movie.views ? new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(movie.views) : 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hover overlay with play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300">
            <div className="p-1.5 sm:p-2 md:p-3 rounded-full bg-amber-600/80 text-white transform scale-0 group-hover/card:scale-100 transition-transform duration-300 movie-card-button">
              <Play 
                fill="white" 
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" 
              />
            </div>
          </div>
          
          {/* Gleam effect */}
          <div className="movie-card-shine"></div>
        </div>
        
        {variant === "grid" && (
          <div className="p-1.5 sm:p-2 md:p-3">
            <h3 className="text-white font-medium text-xs sm:text-sm md:text-base line-clamp-1">
              {movie.title}
            </h3>
            <div className="flex justify-between items-center mt-0.5 sm:mt-1 md:mt-1.5">
              <span className="text-xs text-gray-400">{movie.releaseYear}</span>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Star size={10} className="text-amber-500" />
                <span>{movie.rating || "N/A"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Popup using Portal - Only render on desktop */}
      {isHovering && popupPosition && screenSize.isDesktop && (
        <div 
          className="fixed z-[9999]"
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
            transform: 'translate(-50%, -120%)',
          }}
        >
          <MovieCardHover movie={movie} />
        </div>
      )}
    </div>
  )
}

export default MovieCard

