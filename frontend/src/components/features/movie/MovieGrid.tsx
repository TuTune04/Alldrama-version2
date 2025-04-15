'use client'

import { FileQuestion } from "lucide-react"
import MovieCard from "./MovieCard"
import type { Movie } from "@/types"
import { motion } from "framer-motion"
import MoviePopover from "./MoviePopover"
import Link from "next/link"
import { generateMovieUrl } from "@/utils/url"

interface MovieGridProps {
  movies: Movie[]
  isLoading?: boolean
  emptyMessage?: string
  layout?: 'grid' | 'classic'
}

const MovieGrid = ({ 
  movies, 
  isLoading = false, 
  emptyMessage = "Không tìm thấy phim nào",
  layout = 'grid'
}: MovieGridProps) => {
  const isEmpty = !isLoading && movies.length === 0
  
  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 10 }).map((_, index) => (
          <div 
            key={index} 
            className="bg-gray-800/50 rounded-md h-64 sm:h-80 animate-pulse"
          ></div>
        ))}
      </div>
    )
  }
  
  // Render empty state
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-gray-800/60 p-5 rounded-full mb-4">
          <FileQuestion size={48} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Không tìm thấy phim</h3>
        <p className="text-gray-400 max-w-md">
          {emptyMessage}
        </p>
      </div>
    )
  }

  // Render classic layout
  if (layout === 'classic') {
    return (
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {movies.map((movie) => (
          <div key={movie.id} className="bg-gray-800/40 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-500 transition-colors">
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-1/4 md:w-1/5 h-48 sm:h-auto relative">
                <Link href={generateMovieUrl(movie.id, movie.title)}>
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                </Link>
              </div>
              <div className="flex-1 p-4 sm:p-6">
                <div className="flex justify-between items-start">
                  <Link href={generateMovieUrl(movie.id, movie.title)}>
                    <h3 className="text-xl font-bold text-white hover:text-indigo-400 transition-colors">{movie.title}</h3>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <span className="bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded text-xs">
                      {movie.releaseYear}
                    </span>
                    {movie.rating && (
                      <span className="flex items-center bg-amber-600/20 text-amber-400 px-2 py-1 rounded text-xs">
                        ★ {movie.rating}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-400 mt-3 line-clamp-3">{movie.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {movie.genres?.slice(0, 5).map((genre, index) => (
                    <span key={index} className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-md text-xs">
                      {typeof genre === 'string' ? genre : genre.name}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex space-x-3">
                  <Link href={generateMovieUrl(movie.id, movie.title)}>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
                      Chi tiết
                    </button>
                  </Link>
                  <MoviePopover 
                    movie={movie} 
                    trigger={
                      <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm transition-colors">
                        Xem nhanh
                      </button>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Render grid layout (default)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {movies.map((movie, index) => (
        <motion.div
          key={movie.id}
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
              <div className="transition-transform hover:scale-[1.03] duration-300 cursor-pointer">
                <MovieCard movie={movie} />
              </div>
            }
          />
        </motion.div>
      ))}
    </div>
  )
}

export default MovieGrid
