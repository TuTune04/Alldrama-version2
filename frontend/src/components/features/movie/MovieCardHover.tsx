'use client'

import Link from "next/link"
import Image from "next/image"
import type { Movie } from "@/types"
import { generateMovieUrl } from "@/utils/url"
import { Star, Eye, Play, Heart, Info, Calendar, Clock, Film, User } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface MovieCardHoverProps {
  movie: Movie
  position?: { top: number, left: number } // Optional custom position
}

const MovieCardHover = ({ movie, position }: MovieCardHoverProps) => {
  const [popupPosition, setPopupPosition] = useState(position || { top: 0, left: 0 })
  const [isMounted, setIsMounted] = useState(false)
  const movieDetailUrl = generateMovieUrl(movie.id, movie.title)
  
  // Ensure component is mounted (for SSR compatibility with createPortal)
  useEffect(() => {
    setIsMounted(true)
    
    // If position not provided via props, calculate it based on mouse position
    if (!position) {
      const handleMouseMove = (e: MouseEvent) => {
        // Offset to not cover the cursor and element being hovered
        const offsetY = -250
        const offsetX = 20
        
        setPopupPosition({
          top: e.clientY + window.scrollY + offsetY,
          left: e.clientX + window.scrollX + offsetX,
        })
      }
      
      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [position])
  
  if (!isMounted) return null
  
  // Determine image URL
  const imageUrl = movie.posterUrl || "/images/placeholder-poster.jpg"
  
  return createPortal(
    <div 
      className="fixed bg-gray-900/95 backdrop-blur-md rounded-xl border border-amber-500/30 overflow-hidden z-[9999] shadow-2xl shadow-amber-900/20 min-h-[450px] w-[350px]"
      style={{
        top: `${popupPosition.top}px`,
        left: `${popupPosition.left}px`,
        transform: 'translate(-50%, -120%)',  // Căn giữa theo chiều ngang và đặt phía trên thẻ phim
      }}
      onClick={(e) => {
        e.stopPropagation() // Prevent click from bubbling up
      }}
    >
      {/* Add fade-in animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -95%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -100%) scale(1); }
        }
      `}</style>
      
      {/* Arrow pointing to the card */}
      <div 
        className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-amber-500/30"
      ></div>
      
      {/* Background Image */}
      <div className="absolute inset-0 opacity-15">
        <Image
          src={imageUrl}
          alt={movie.title}
          fill
          className="object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-gray-900/50"></div>
      </div>
      
      <div className="relative z-10 p-4">
        {/* Thumbnail trên cùng - chiếm toàn bộ chiều rộng */}
        <div className="w-full aspect-video relative rounded-md overflow-hidden flex-shrink-0 border border-gray-800/50 shadow-md mb-4">
          <Image
            src={imageUrl}
            alt={movie.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          
          {/* Play button overlay */}
          <Link href={`/watch/${movie.id}`} className="absolute inset-0 flex items-center justify-center">
            <div className="p-3 rounded-full bg-amber-600/80 text-white hover:bg-amber-600 transform hover:scale-110 transition-all duration-300 cursor-pointer">
              <Play fill="white" size={24} />
            </div>
          </Link>
          
          {/* Top badge - Rating */}
          <div className="absolute top-2 left-2 px-2 py-1 bg-amber-600/90 backdrop-blur-sm rounded text-white text-xs font-medium flex items-center gap-1 z-10">
            <Star size={12} className="fill-white" />
            <span>{movie.rating || "N/A"}</span>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-white font-bold text-lg sm:text-xl line-clamp-2 mb-2">
          {movie.title}
        </h3>
        
        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
            <Calendar size={14} className="text-amber-500" />
            <span>{movie.releaseYear}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
            <Clock size={14} className="text-amber-500" />
            <span>120 phút</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
            <Star size={14} className="text-amber-500" />
            <span>{movie.rating || "N/A"} / 10</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
            <Eye size={14} className="text-amber-500" />
            <span>{new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(movie.views || 0)}</span>
          </div>
        </div>
        
        {/* Description */}
        <div className="mb-2">
          <p className="text-xs sm:text-sm text-gray-300 line-clamp-3">
            {movie.description}
          </p>
        </div>
        
        {/* Actors Section */}
        <div className="mb-2">
          <h4 className="text-xs text-gray-400 mb-1.5 flex items-center">
            <User size={12} className="mr-1 text-amber-500" />
            Diễn viên
          </h4>
          <div className="text-xs sm:text-sm text-gray-300 line-clamp-1">
            {movie.actors ? movie.actors.join(', ') : 'Đang cập nhật'}
          </div>
        </div>
        
        {/* Movie Versions */}
        <div className="mb-4">
          <h4 className="text-xs text-gray-400 mb-1.5 flex items-center">
            <Film size={12} className="mr-1 text-amber-500" />
            Phiên bản
          </h4>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-1.5 py-0.5 bg-gray-800 rounded text-xs text-white">Vietsub</span>
            <span className="px-1.5 py-0.5 bg-gray-800 rounded text-xs text-white">Thuyết minh</span>
            <span className="px-1.5 py-0.5 bg-gray-800 rounded text-xs text-white">Lồng tiếng</span>
          </div>
        </div>
        
        {/* Actions buttons */}
        <div className="flex items-center gap-2.5 mt-3">
          <Link href={`/watch/${movie.id}`} className="flex-1" onClick={(e) => e.stopPropagation()}>
            <button className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md flex items-center justify-center gap-2 text-xs sm:text-sm font-medium transition-colors">
              <Play size={16} />
              <span>Xem ngay</span>
            </button>
          </Link>
          
          <button 
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-md bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation() // Prevent triggering card click
            }}
          >
            <Heart size={18} className="text-gray-300 hover:text-amber-500" />
          </button>
          
          <Link 
            href={movieDetailUrl} 
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-md bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white transition-colors"
            onClick={(e) => e.stopPropagation()} // Prevent triggering card click
          >
            <Info size={18} className="text-gray-300 hover:text-amber-500" />
          </Link>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default MovieCardHover 