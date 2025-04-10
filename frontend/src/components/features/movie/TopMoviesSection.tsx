'use client'

import Link from "next/link"
import Image from "next/image"
import { Star, Play, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { generateMovieUrl } from "@/utils/url"
import { Movie } from "@/types"
import MoviePopover from "./MoviePopover"

interface TopMoviesSectionProps {
  movies: Movie[]
  title?: string
  limit?: number
}

const TopMoviesSection = ({ movies, title = "Top 10 Phim Xem Nhiều", limit = 10 }: TopMoviesSectionProps) => {
  const topMovies = movies.slice(0, limit)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  
  const handlePrevClick = () => {
    if (sliderRef.current) {
      const containerWidth = sliderRef.current.clientWidth
      const newPosition = Math.max(0, scrollPosition - containerWidth)
      sliderRef.current.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }
  }
  
  const handleNextClick = () => {
    if (sliderRef.current) {
      const containerWidth = sliderRef.current.clientWidth
      const scrollWidth = sliderRef.current.scrollWidth
      const newPosition = Math.min(scrollWidth - containerWidth, scrollPosition + containerWidth)
      sliderRef.current.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }
  }
  
  return (
    <div className="py-10 bg-gradient-to-b from-[#0F111A] to-[#151823]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center">
            <span className="bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">{title}</span>
          </h2>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevClick}
              className="p-2 rounded-full bg-gray-800/70 hover:bg-amber-600/80 text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={handleNextClick}
              className="p-2 rounded-full bg-gray-800/70 hover:bg-amber-600/80 text-white transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        
        <div className="relative overflow-hidden">
          <div 
            ref={sliderRef}
            className="flex gap-3 overflow-x-scroll no-scrollbar scroll-smooth pb-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {topMovies.map((movie, index) => (
              <div
                key={movie.id}
                className="relative flex-shrink-0 w-[calc(100%/5-12px)] min-w-[190px] py-4"
              >
                <MoviePopover 
                  movie={movie} 
                  size="sm"
                  variant="simple"
                  trigger={
                    <div className="relative transition-all duration-300 hover:z-50">
                      <Link href={generateMovieUrl(movie.id, movie.title)}>
                        {/* Card thiết kế với hiệu ứng cắt chéo mạnh hơn */}
                        <div 
                          className="relative overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all duration-300 bg-[#1A1C25] group"
                          style={{
                            borderRadius: '0 0 8px 8px',
                            clipPath: index % 2 === 0 
                              ? 'polygon(0 0, 100% 25px, 100% 100%, 0 100%)' // Card lẻ: cắt chéo nhiều hơn từ trái sang phải
                              : 'polygon(0 25px, 100% 0, 100% 100%, 0 100%)' // Card chẵn: cắt chéo nhiều hơn từ phải sang trái
                          }}
                        >
                          {/* Poster Image */}
                          <div className="relative aspect-[2/3] w-full">
                            <Image 
                              src={movie.posterUrl || "/placeholder.svg"} 
                              alt={movie.title}
                              fill
                              className="object-cover group-hover:brightness-105"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 20vw"
                              priority={index < 5}
                            />
                            
                            {/* Overlay badges */}
                            <div className="absolute bottom-1.5 left-1.5 flex gap-1">
                              <span className="bg-[#4B5563] text-white text-[9px] px-1 py-0.5 rounded-md font-medium">PD.{movie.releaseYear.toString().substring(2)}</span>
                              <span className="bg-[#22C55E] text-white text-[9px] px-1 py-0.5 rounded-md font-medium">TM.{movie.releaseYear.toString().substring(2)}</span>
                            </div>
                            
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F111A] via-transparent to-transparent opacity-70"></div>
                          </div>
                          
                          {/* Content */}
                          <div className="p-2.5 text-white">
                            <h3 className="font-bold text-sm line-clamp-1">{movie.title}</h3>
                            <p className="text-[10px] text-gray-400 line-clamp-1 mb-1">
                              {movie.description ? movie.description.substring(0, 50) + '...' : 'Đang cập nhật thông tin'}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-[10px] text-gray-300 gap-0.5">
                                <span className="px-1 py-0.5 bg-gray-800 rounded-sm">T{movie.releaseYear.toString().substring(2)}</span>
                                <span>•</span>
                                <div className="flex items-center ml-0.5">
                                  <Star className="w-2 h-2 text-[#FFD95A] mr-0.5" fill="#FFD95A" />
                                  <span className="text-[#FFD95A] font-medium">{movie.rating ? movie.rating.toFixed(1) : 'N/A'}</span>
                                </div>
                              </div>
                              
                              {/* Số thứ tự phim được đặt bên dưới */}
                              <div>
                                <span style={{fontFamily: 'Georgia, serif'}} className="text-2xl font-extrabold text-[#FFD95A] leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]">
                                  {index + 1}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Play button overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50">
                            <div className="p-2.5 rounded-full bg-[#22C55E] text-white transform scale-0 group-hover:scale-100 transition-all duration-300 shadow-lg">
                              <Play fill="white" size={20} />
                            </div>
                          </div>
                          
                          {/* Border highlight */}
                          <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 border-2 border-[#22C55E]/50 transition-opacity duration-300"
                            style={{
                              borderRadius: '0 0 8px 8px',
                              clipPath: index % 2 === 0 
                                ? 'polygon(0 0, 100% 25px, 100% 100%, 0 100%)' // Card lẻ
                                : 'polygon(0 25px, 100% 0, 100% 100%, 0 100%)' // Card chẵn
                            }}
                          ></div>
                        </div>
                      </Link>
                    </div>
                  }
                />
              </div>
            ))}
          </div>
          
          {/* Gradient fades on sides */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0F111A] to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0F111A] to-transparent z-10"></div>
        </div>
      </div>
    </div>
  )
}

export default TopMoviesSection 