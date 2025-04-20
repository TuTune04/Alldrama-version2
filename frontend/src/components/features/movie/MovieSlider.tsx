'use client'

import Link from "next/link"
import type { Movie } from "@/types"
import MovieCard from "./MovieCard"
import { Button } from "@/components/ui/button"
import { generateMovieUrl } from "@/utils/url"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Heart } from "lucide-react"
import MoviePopover from "./MoviePopover"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useMobile } from "@/hooks/use-mobile"
import { useMovies } from "@/hooks/api/useMovies"
import { useFavorites } from "@/hooks/api/useFavorites"
import { Skeleton } from "@/components/ui/skeleton"
import React from "react"
import { useAuth } from "@/hooks/api/useAuth"
import { toast } from "react-hot-toast"

interface MovieSliderProps {
  title: string
  // Thay vì truyền movies, chuyển sang sử dụng endpoint để lấy dữ liệu từ API
  endpoint?: "newest" | "popular" | "trending" | "featured" | "topRated"
  // Vẫn giữ lại movies để có thể truyền trực tiếp nếu cần
  movies?: Movie[]
  variant?: "default" | "popular" | "trending" | "new" | "top"
  className?: string
  maxItems?: number
  size?: 'sm' | 'md' | 'lg'
  showPopover?: boolean
  // Thêm các props liên quan đến API
  limit?: number
  genreId?: number | string
  showFavoriteButton?: boolean
}

const MovieSlider = ({ 
  title, 
  endpoint,
  movies, 
  variant = "default",
  className = "",
  maxItems = 5,
  size = 'md',
  showPopover = true,
  limit = 10,
  genreId,
  showFavoriteButton = true
}: MovieSliderProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const isMobileSmall = useMobile(768);
  const isMobileLarge = useMobile(1024);
  
  // State cho dữ liệu phim từ API
  const [movieData, setMovieData] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Authentication state
  const { isAuthenticated } = useAuth();
  
  // Sử dụng hooks đã tạo
  const { 
    getFeaturedMovies,
    getPopularMovies,
    getTrendingMovies,
    getNewestMovies,
    getSimilarMovies,
  } = useMovies();
  
  // Sử dụng hook favorites
  const { 
    toggleFavorite, 
    checkIsFavorite,
    favorites
  } = useFavorites();
  
  // State lưu trữ các phim yêu thích
  const [favoritedMovies, setFavoritedMovies] = useState<Record<string | number, boolean>>({});
  
  // Determine device type from breakpoints - memoize để tránh tính toán lại
  const deviceInfo = useMemo(() => {
    const isMobile = isMobileSmall;
    const isTablet = isMobileLarge && !isMobileSmall;
    return { isMobile, isTablet };
  }, [isMobileSmall, isMobileLarge]);

  // Fetch dữ liệu từ API nếu không có movies được truyền vào
  const fetchMovies = useCallback(async () => {
    // Nếu đã truyền movies thì sử dụng chúng, không cần gọi API
    if (movies && movies.length > 0) {
      setMovieData(movies);
      return;
    }
    
    // Nếu không có endpoint thì không gọi API
    if (!endpoint && !genreId) {
      setMovieData([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let result: Movie[] = [];
      
      if (genreId) {
        // Khi có genreId, sử dụng getSimilarMovies (chỉ nhận 1 tham số)
        const genreIdValue = typeof genreId === 'string' ? genreId : String(genreId);
        result = await getSimilarMovies(genreIdValue);
      } else {
        // Fetch movies theo endpoint - các hàm này không nhận tham số limit
        switch (endpoint) {
          case "newest":
            result = await getNewestMovies();
            break;
          case "popular":
            result = await getPopularMovies();
            break;
          case "trending":
            result = await getTrendingMovies();
            break;
          case "featured":
            result = await getFeaturedMovies();
            break;
          case "topRated":
            // Sử dụng getTrendingMovies để thay thế topRated
            result = await getTrendingMovies();
            break;
          default:
            result = [];
        }
      }
      
      // Nếu kết quả là null, đặt thành mảng rỗng để tránh lỗi
      if (result === null) {
        result = [];
      }
      
      setMovieData(result);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError("Không thể tải dữ liệu phim");
    } finally {
      setLoading(false);
    }
  }, [
    endpoint, 
    movies, 
    genreId, 
    getFeaturedMovies,
    getPopularMovies,
    getTrendingMovies,
    getNewestMovies,
    getSimilarMovies,
  ]);
  
  // Cập nhật thông tin phim yêu thích
  const updateFavoriteStatus = useCallback(async () => {
    if (!isAuthenticated || !movieData.length) return;
    
    const favoriteStatuses: Record<string | number, boolean> = {};
    
    // Check favorite status for each movie
    for (const movie of movieData) {
      try {
        const isFavorite = await checkIsFavorite(String(movie.id));
        favoriteStatuses[movie.id] = isFavorite;
      } catch (error) {
        favoriteStatuses[movie.id] = false;
      }
    }
    
    setFavoritedMovies(favoriteStatuses);
  }, [movieData, isAuthenticated, checkIsFavorite]);
  
  // Handle toggle favorite
  const handleToggleFavorite = useCallback(async (e: React.MouseEvent, movieId: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Bạn cần đăng nhập để thêm phim vào danh sách yêu thích");
      return;
    }
    
    try {
      const currentStatus = favoritedMovies[movieId] || false;
      const success = await toggleFavorite(String(movieId), currentStatus);
      
      if (success) {
        // Update local state immediately for better UX
        setFavoritedMovies(prev => ({
          ...prev,
          [movieId]: !currentStatus
        }));
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  }, [isAuthenticated, favoritedMovies, toggleFavorite]);
  
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);
  
  // Check favorite status whenever movies change or user logs in
  useEffect(() => {
    updateFavoriteStatus();
  }, [updateFavoriteStatus, isAuthenticated]);
  
  // Hiển thị skeleton khi đang loading
  if (loading) {
    return (
      <div className={cn("w-full mb-8 md:mb-12", className)}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-1 h-6 bg-indigo-500 rounded-full`}></div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-400">
              {title}
            </h2>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="w-full aspect-[2/3] rounded-md h-64 sm:h-72" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Hiển thị thông báo lỗi nếu có
  if (error) {
    return (
      <div className={cn("w-full mb-8 md:mb-12", className)}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-1 h-6 bg-indigo-500 rounded-full`}></div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-400">
              {title}
            </h2>
          </div>
        </div>
        
        <div className="bg-red-900/30 border border-red-700 rounded-md p-4">
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }
  
  // Không hiển thị gì nếu không có dữ liệu
  if (!movieData || movieData.length === 0) return null;
  
  // Tính toán các thông số pagination và hiển thị - memoize để tránh tính toán lại
  const paginationConfig = useMemo(() => {
    // Adjust maxItems based on screen size
    const responsiveMaxItems = deviceInfo.isTablet ? 4 : maxItems;
  
    // Limit the number of movies to maxItems and handle pagination
    const totalPages = Math.ceil(movieData.length / responsiveMaxItems);
    const startIndex = currentPage * responsiveMaxItems;
    const displayMovies = movieData.slice(startIndex, startIndex + responsiveMaxItems);
    
    return {
      responsiveMaxItems,
      totalPages,
      startIndex,
      displayMovies
    };
  }, [movieData, maxItems, currentPage, deviceInfo.isTablet]);
  
  const handlePrevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  }, []);
  
  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(paginationConfig.totalPages - 1, prev + 1));
  }, [paginationConfig.totalPages]);
  
  // Handle touch events for mobile scrolling
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    // Reset values
    setTouchStart(0);
    setTouchEnd(0);
  }, []);
  
  // Render movie card with optional favorite button
  const renderMovieCard = useCallback((movie: Movie, index: number) => {
    const isFavorite = favoritedMovies[movie.id] || false;
    
    return (
      <div className="relative group">
        <MovieCard
          movie={movie}
          index={index}
          variant={variant === "trending" ? "trending" : "slider"}
          trapezoid={false}
          fullWidth={true}
          className="h-full"
        />
        
        {/* Favorite button */}
        {showFavoriteButton && (
          <button
            onClick={(e) => handleToggleFavorite(e, movie.id)}
            className={`absolute top-2 right-2 p-2 rounded-full z-10 transition-all duration-200 ${
              isFavorite 
                ? 'bg-indigo-600 text-white' 
                : 'bg-black/40 text-gray-300 hover:bg-black/60'
            } opacity-${deviceInfo.isMobile ? '100' : '0'} group-hover:opacity-100`}
            aria-label={isFavorite ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
          >
            <Heart
              size={16}
              className={isFavorite ? 'fill-white' : ''}
            />
          </button>
        )}
      </div>
    );
  }, [favoritedMovies, variant, handleToggleFavorite, showFavoriteButton, deviceInfo.isMobile]);
  
  // Render mobile hoặc desktop view dựa vào kích thước màn hình
  const renderMobileView = useCallback(() => {
    return (
      <div 
        className="overflow-x-auto flex gap-3 snap-x snap-mandatory scrollbar-hide pb-4"
        style={{ 
          scrollbarWidth: 'none', 
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory'
        }}
      >
        {paginationConfig.displayMovies.map((movie, index) => (
          <div 
            key={String(movie.id)}
            className="flex-shrink-0 snap-start" 
            style={{ 
              width: deviceInfo.isMobile ? 'calc(50% - 0.75rem)' : 'calc(33.333% - 1rem)',
              scrollSnapAlign: 'start'
            }}
          >
            <motion.div
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
                  <Link 
                    href={generateMovieUrl(movie.id, movie.title)} 
                    className="transition-transform hover:scale-[1.03] duration-300 block w-full h-full"
                  >
                    {renderMovieCard(movie, index)}
                  </Link>
                }
                size={size}
                showPopover={showPopover}
              />
            </motion.div>
          </div>
        ))}
      </div>
    );
  }, [paginationConfig.displayMovies, deviceInfo.isMobile, renderMovieCard, size, showPopover]);
  
  const renderDesktopView = useCallback(() => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
        {paginationConfig.displayMovies.map((movie, index) => (
          <motion.div
            key={String(movie.id)}
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
                <Link 
                  href={generateMovieUrl(movie.id, movie.title)} 
                  className="transition-transform hover:scale-[1.03] duration-300 block w-full h-full"
                >
                  {renderMovieCard(movie, index)}
                </Link>
              }
              size={size}
              showPopover={showPopover}
            />
          </motion.div>
        ))}
      </div>
    );
  }, [paginationConfig.displayMovies, renderMovieCard, size, showPopover]);
  
  // Main render
  return (
    <div className={cn("w-full mb-8 md:mb-12", className)}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-6 bg-indigo-500 rounded-full`}></div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-400">
            {title}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {paginationConfig.totalPages > 1 && !deviceInfo.isMobile && (
            <div className="flex items-center space-x-2">
              <Button 
                size="icon"
                variant="outline"
                onClick={handlePrevPage} 
                disabled={currentPage === 0}
                className={`rounded-full ${
                  currentPage > 0 
                    ? 'bg-black/80 hover:bg-black/60 border-gray-700' 
                    : 'bg-black/50 cursor-not-allowed border-transparent opacity-50'
                } flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9`}
              >
                <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
              </Button>

              <Button 
                size="icon"
                variant="outline"
                onClick={handleNextPage} 
                disabled={currentPage >= paginationConfig.totalPages - 1}
                className={`rounded-full ${
                  currentPage < paginationConfig.totalPages - 1 
                    ? 'bg-black/80 hover:bg-black/60 border-gray-700' 
                    : 'bg-black/50 cursor-not-allowed border-transparent opacity-50'
                } flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9`}
              >
                <ChevronRight size={16} className="sm:w-5 sm:h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {deviceInfo.isMobile ? renderMobileView() : renderDesktopView()}
    </div>
  )
}

export default React.memo(MovieSlider)