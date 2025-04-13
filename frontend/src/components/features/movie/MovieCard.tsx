'use client'

import Link from "next/link"
import Image from "next/image"
import type { Movie } from "@/types"
import { generateMovieUrl } from "@/utils/url"
import { Star, Eye, Play, Heart, Info, Calendar, Clock, Film, User } from "lucide-react"
import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import MoviePopover from "./MoviePopover"
import { motion } from "framer-motion"
import { AspectRatio } from "@/components/ui/aspect-ratio"

interface MovieCardProps {
  movie: Movie
  index?: number
  variant?: "slider" | "grid" | "featured" | "trending"
  trapezoid?: boolean
}

const MovieCard = ({ movie, index = 0, variant = "slider", trapezoid = false }: MovieCardProps) => {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const imageUrl = movie.posterUrl || "/images/placeholder-poster.jpg"
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    isDesktop: false,
    isTablet: false,
    isMobile: false
  })
  const movieDetailUrl = generateMovieUrl(movie.id, movie.title)
  const [imageLoaded, setImageLoaded] = useState(false)
  
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
  
  // Card click handler
  const handleCardClick = useCallback(() => {
    router.push(movieDetailUrl)
  }, [router, movieDetailUrl])
  
  // Xác định tỷ lệ khung hình dựa vào variant - tất cả đều là landscape
  const aspectRatio = 16/9
  
  const cardContent = (
    <div className="w-full h-full" ref={cardRef}>
      <AspectRatio 
        ratio={aspectRatio}
        className="relative overflow-hidden rounded-lg"
      >
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={index < 5}
          className={`object-cover transition-all duration-500 ${
            imageLoaded 
              ? "opacity-100 scale-100" 
              : "opacity-0 scale-110"
          } group-hover:scale-105`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        
        {/* Index number for trending */}
        {variant === "trending" && (
          <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-accent text-center flex items-center justify-center text-black font-bold">
            {index + 1}
          </div>
        )}
        
        {/* Information overlay on slider cards */}
        {variant === "slider" && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
            <h3 className="text-white text-sm font-medium line-clamp-1">{movie.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-300 text-xs">{movie.releaseYear}</span>
              {movie.rating && (
                <div className="flex items-center text-amber-400 text-xs">
                  <Star size={10} className="mr-0.5" fill="currentColor" />
                  <span>{movie.rating}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Play button overlay - only visible on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
            <Play className="text-black h-5 w-5" fill="currentColor" />
          </div>
        </div>
      </AspectRatio>
      
      {/* Title shown for non-slider variants */}
      {variant !== "slider" && (
        <div className="mt-2">
          <h3 className="text-sm font-medium line-clamp-1">{movie.title}</h3>
          <p className="text-xs text-gray-400">{movie.releaseYear}</p>
        </div>
      )}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`
        relative 
        ${variant === "grid" ? "h-full" : ""}
        ${variant === "slider" ? "w-full" : ""}
      `}
      style={{ zIndex: variant === "slider" ? 10 : 1 }}
    >
      {variant === "slider" ? (
        <div className="relative group">
          <MoviePopover 
            movie={movie} 
            trigger={cardContent} 
            variant="default" 
            size="md" 
          />
        </div>
      ) : (
        <Link href={`/movie/${movie.id}-${movie.title.toLowerCase().replace(/\s+/g, '-')}`} className="group block">
          {cardContent}
        </Link>
      )}
    </motion.div>
  )
}

export default MovieCard

