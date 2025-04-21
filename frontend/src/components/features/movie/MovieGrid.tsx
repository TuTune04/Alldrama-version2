'use client'

import { FileQuestion, ChevronLeft, ChevronRight } from "lucide-react"
import MovieCard from "./MovieCard"
import type { Movie, MovieSearchParams } from "@/types"
import { motion } from "framer-motion"
import MoviePopover from "./MoviePopover"
import Link from "next/link"
import { generateMovieUrl } from "@/utils/url"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback } from "react"
import { useMovies } from "@/hooks/api/useMovies"
import React from "react"

interface MovieGridProps {
  movies?: Movie[]
  isLoading?: boolean
  emptyMessage?: string
  layout?: 'grid' | 'classic'
  onHover?: (movie: Movie) => void
  // Thêm props liên quan đến API
  endpoint?: "newest" | "popular" | "trending" | "featured"
  genreId?: string | number
  searchQuery?: string
  limit?: number
  // Thêm props hỗ trợ phân trang
  showPagination?: boolean
  totalPages?: number
  currentPage?: number
  onPageChange?: (page: number) => void
}

const MovieGrid = ({
  movies,
  isLoading: externalLoading = false,
  emptyMessage = "Không tìm thấy phim nào",
  layout = 'grid',
  onHover,
  endpoint,
  genreId,
  searchQuery,
  limit = 20,
  showPagination = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
}: MovieGridProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    movies: swrMovies,
    searchMovies,
    loading: swrLoading
  } = useMovies();
  
  const fetchMovies = useCallback(async () => {
    // Nếu đã truyền movies thì sử dụng chúng, không cần gọi API
    if (movies) {
      return;
    }
    
    // Nếu không có endpoint hoặc genreId thì không gọi API
    if (!endpoint && !genreId && !searchQuery) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Chuẩn bị search params theo props
      const params: MovieSearchParams = { 
        limit: limit || 20,
        page: currentPage
      };
      
      if (searchQuery) {
        params.q = searchQuery;
      }
      
      if (genreId) {
        // Convert genreId to number because MovieSearchParams.genre requires number
        const genreIdAsNumber = typeof genreId === 'string' ? parseInt(genreId, 10) : genreId;
        if (!isNaN(genreIdAsNumber)) {
          params.genre = genreIdAsNumber;
        }
      }
      
      if (endpoint) {
        // Các endpoint đặc biệt sẽ map sang sort params
        switch (endpoint) {
          case "newest":
            params.sort = "createdAt";
            params.order = "DESC";
            break;
          case "popular":
            params.sort = "views";
            params.order = "DESC";
            break;
          case "trending":
            params.sort = "rating";
            params.order = "DESC";
            break;
          case "featured":
            // Sử dụng solution khác cho featured movies (sort by rating)
            params.sort = "rating";
            params.order = "DESC";
            // Trong API service sẽ cần thêm logic để xử lý featured movies
            break;
        }
      }
      
      // Sử dụng searchMovies để fetch dữ liệu
      await searchMovies(params);
      
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError("Không thể tải dữ liệu phim");
    } finally {
      setLoading(false);
    }
  }, [
    movies, 
    endpoint, 
    genreId, 
    searchQuery,
    limit,
    currentPage,
    searchMovies
  ]);
  
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);
  
  // Xử lý chuyển trang
  const handlePageChange = useCallback((newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  }, [onPageChange]);
  
  // Sử dụng dữ liệu từ API hoặc props
  const displayMovies = movies || swrMovies || [];
  // Xác định trạng thái loading tổng hợp
  const isLoadingState = externalLoading || loading || swrLoading;
  // Xác định trạng thái trống
  const isEmpty = !isLoadingState && (!displayMovies || displayMovies.length === 0);
  
  // Render error state
  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-md p-4">
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  // Render loading skeleton
  if (isLoadingState) {
    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="w-full aspect-[2/3] rounded-md h-64 sm:h-80" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
        
        {showPagination && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render empty state
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-black/60 p-5 rounded-full mb-4">
          <FileQuestion size={48} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Không tìm thấy phim</h3>
        <p className="text-gray-400 max-w-md">{emptyMessage}</p>
      </div>
    )
  }

  // Render pagination controls
  const renderPagination = () => {
    if (!showPagination || totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-8">
        <div className="flex items-center gap-2">
          <Button 
            size="icon"
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage <= 1}
            className={`rounded-full ${
              currentPage > 1 
                ? 'bg-black/80 hover:bg-black/60 border-gray-700' 
                : 'bg-black/50 cursor-not-allowed border-transparent opacity-50'
            } flex items-center justify-center w-10 h-10`}
          >
            <ChevronLeft size={18} />
          </Button>
          
          <div className="px-4 py-2 rounded-md bg-gray-800/50 border border-gray-700">
            <span className="text-gray-300">
              Trang {currentPage} / {totalPages}
            </span>
          </div>

          <Button 
            size="icon"
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage >= totalPages}
            className={`rounded-full ${
              currentPage < totalPages 
                ? 'bg-black/80 hover:bg-black/60 border-gray-700' 
                : 'bg-black/50 cursor-not-allowed border-transparent opacity-50'
            } flex items-center justify-center w-10 h-10`}
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>
    );
  };

  // Render grid layout
  if (layout === 'grid') {
    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {displayMovies.map((movie) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onMouseEnter={() => onHover && onHover(movie)}
            >
              <Link href={generateMovieUrl(movie.id, movie.title)}>
                <MovieCard movie={movie} />
              </Link>
            </motion.div>
          ))}
        </div>
        
        {renderPagination()}
      </div>
    )
  }

  // Render classic layout (with popover)
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {displayMovies.map((movie) => (
          <MoviePopover key={movie.id} movie={movie}>
            <MovieCard movie={movie} />
          </MoviePopover>
        ))}
      </div>
      
      {renderPagination()}
    </div>
  )
}

export default React.memo(MovieGrid)
