'use client'

import Link from "next/link"
import Image from "next/image"
import type { Movie } from "@/types"
import { generateMovieUrl } from "@/utils/url"
import { Star, Play } from "lucide-react"
import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import MoviePopover from "./MoviePopover"
import { motion } from "framer-motion"
import { AspectRatio } from "@/components/ui/aspect-ratio"

interface MovieCardProps {
  movie: Movie
  index?: number
  variant?: "slider" | "grid" | "featured" | "trending" | "compact"
  trapezoid?: boolean
}

const MovieCard = ({ movie, index = 0, variant = "slider", trapezoid = false }: MovieCardProps) => {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const [imageUrl, setImageUrl] = useState(movie.posterUrl || "/images/placeholder-poster.jpg")
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    isDesktop: false,
    isTablet: false,
    isMobile: false
  })
  const movieDetailUrl = generateMovieUrl(movie.id, movie.title)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

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

  useEffect(() => {
    handleResize()
    let timeoutId: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleResize, 200)
    }

    window.addEventListener('resize', debouncedResize)
    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [handleResize])

  const handleImageLoad = () => setImageLoaded(true)
  const handleImageError = () => {
    setImageError(true)
    setImageUrl("/images/placeholder-poster.jpg")
  }

  const handleCardClick = () => {
    router.push(movieDetailUrl)
  }

  // Render compact variant (used in watch pages for related movies)
  if (variant === "compact") {
    return (
      <Link href={movieDetailUrl} className="block">
        <div className="group relative overflow-hidden rounded-lg transition-transform hover:scale-105">
          <div className="aspect-[2/3] overflow-hidden">
            <img
              src={imageUrl}
              alt={movie.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-110"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-sm font-medium text-white truncate">{movie.title}</h3>
            <div className="flex items-center mt-1 text-xs text-gray-300">
              <span>{movie.releaseYear}</span>
              {movie.rating && (
                <>
                  <span className="mx-1">•</span>
                  <span className="flex items-center text-amber-400">
                    <Star size={10} className="fill-current mr-0.5" /> {movie.rating}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Render standard card variants
  return (
    <div 
      ref={cardRef} 
      className={`group relative rounded-md overflow-hidden ${
        variant === "featured" ? "w-full aspect-[16/9]" : "aspect-[2/3]"
      }`}
    >
      <div className={`absolute inset-0 ${variant === "trending" ? "bg-gradient-to-t from-indigo-600 via-indigo-500/30 to-transparent" : ""}`}>
        <div 
          className={`
            h-full w-full relative
            ${!imageLoaded ? "animate-pulse bg-gray-800" : ""}
            ${trapezoid ? "trapezoid" : ""}
          `}
        >
          <img
            src={imageUrl}
            alt={movie.title}
            className={`
              h-full w-full object-cover
              ${imageLoaded ? "opacity-100" : "opacity-0"}
              ${trapezoid ? "trapezoid-image" : ""}
              ${variant === "featured" ? "duration-700 group-hover:scale-105" : ""}
            `}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      </div>

      {/* Overlay and content */}
      <div 
        className={`
          absolute inset-0 flex flex-col justify-end
          ${variant === "featured" ? "p-6" : "p-3"}
          ${variant === "trending" ? "" : "bg-gradient-to-t from-gray-900 to-transparent"}
        `}
      >
        {/* Rating badge - top right */}
        {variant !== "trending" && movie.rating && (
          <div className="absolute top-2 right-2 flex items-center bg-black/60 px-1.5 py-0.5 rounded text-xs font-medium">
            <Star size={12} className="text-amber-400 fill-current mr-0.5" /> 
            <span className="text-white">{movie.rating}</span>
          </div>
        )}

        {/* Play button - center */}
        {(variant === "featured" || variant === "trending") && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 flex items-center justify-center bg-indigo-600/90 rounded-full">
              <Play size={24} className="text-white ml-1" />
            </div>
          </div>
        )}

        {/* Title and info */}
        <h3 className={`font-medium text-white line-clamp-1 ${variant === "featured" ? "text-xl mb-1" : "text-sm"}`}>
          {movie.title}
        </h3>
        
        <div className="flex items-center text-xs text-gray-300">
          <span>{movie.releaseYear}</span>
          
          {variant === "trending" && movie.rating && (
            <>
              <span className="mx-1">•</span>
              <span className="flex items-center">
                <Star size={10} className="text-amber-400 fill-current mr-0.5" /> 
                {movie.rating}
              </span>
            </>
          )}
          
          {(variant === "featured" || variant === "trending") && movie.genres && movie.genres[0] && (
            <>
              <span className="mx-1">•</span>
              <span>
                {typeof movie.genres[0] === "string" ? movie.genres[0] : movie.genres[0].name}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieCard