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
  const [popupPosition, setPopupPosition] = useState<{ top: number, left: number } | null>(null)
  const [isHovering, setIsHovering] = useState(false)
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
    switch (variant) {
      case "slider": return "3/4" // Portrait format for slider
      case "grid": return "16/9" // Landscape for grid
      case "featured": return "16/9" // Landscape for featured
      case "trending": return "16/9" // Landscape for trending
      default: return "3/4"
    }
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
  
  const isPortrait = variant === "slider"
  const cardContent = (
    <>
      <AspectRatio 
        ratio={getAspectRatio() as any} 
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
        
        {/* Play button overlay - only visible on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
            <Play className="text-black h-5 w-5" />
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
    </>
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
    >
      {variant === "slider" ? (
        <MoviePopover movie={movie} trigger={cardContent} variant="default" size="md" />
      ) : (
        <Link href={`/movie/${movie.id}-${movie.title.toLowerCase().replace(/\s+/g, '-')}`} className="group block">
          {cardContent}
        </Link>
      )}
    </motion.div>
  )
}

export default MovieCard

