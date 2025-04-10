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
}

const MovieGrid = ({ 
  movies, 
  isLoading = false, 
  emptyMessage = "Không tìm thấy phim nào"
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
  
  // Render movie grid
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {movies.map((movie, index) => (
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="h-full"
        >
          <MoviePopover
            movie={movie}
            size="md"
            trigger={
              <div className="transition-transform hover:scale-[1.03] duration-300 h-full cursor-pointer">
                <Link href={generateMovieUrl(movie.id, movie.title)} className="block h-full">
                  <MovieCard movie={movie} index={index} variant="grid" />
                </Link>
              </div>
            }
          />
        </motion.div>
      ))}
    </div>
  )
}

export default MovieGrid

