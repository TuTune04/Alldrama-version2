"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { Movie } from "@/types"
import MovieCard from "./MovieCard"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import Link from "next/link"
import MovieCardHover from "./MovieCardHover"

interface MovieSliderProps {
  title: string
  movies: Movie[]
  viewMoreLink?: string
  variant?: "default" | "popular" | "trending" | "new" | "top"
  viewAllHref?: string
}

const MovieSlider = ({ title, movies, viewMoreLink, variant = "default", viewAllHref = "/movie" }: MovieSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleItems, setVisibleItems] = useState(3) // Mặc định tối đa 3 item
  const [isHovering, setIsHovering] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [maxScrollPosition, setMaxScrollPosition] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const [hoveredMovie, setHoveredMovie] = useState<string | null>(null)
  const [popupPosition, setPopupPosition] = useState<{ top: number, left: number } | null>(null)

  // Xác định màu sắc dựa trên variant
  const getTextColor = () => {
    switch (variant) {
      case 'popular': return 'text-amber-500';
      case 'trending': return 'text-rose-500';
      case 'new': return 'text-emerald-500';
      case 'top': return 'text-sky-500';
      default: return 'text-amber-500';
    }
  }

  const getAccentColor = () => {
    switch (variant) {
      case "popular": return "bg-amber-600"
      case "trending": return "bg-rose-600"
      case "new": return "bg-emerald-600"
      case "top": return "bg-sky-600"
      default: return "bg-amber-600"
    }
  }

  // Xử lý đa phương tiện và tối ưu responsive
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      if (width >= 1280) { // xl và 2xl
        setVisibleItems(3) // Tối đa 3 item
      } else if (width >= 1024) { // lg
        setVisibleItems(3)
      } else if (width >= 768) { // md
        setVisibleItems(2.5)
      } else if (width >= 640) { // sm
        setVisibleItems(2)
      } else { // xs
        setVisibleItems(1.5) // 1 item đầy đủ và nửa item tiếp theo
      }

      // Cập nhật chiều rộng container
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
      }
    }
    
    // Set initial visible items
    handleResize()
    
    // Update visible items on resize
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Update maxScrollPosition when movies or visibleItems change
  useEffect(() => {
    if (sliderRef.current) {
      const totalItems = movies.length
      const maxPosition = Math.max(0, totalItems - visibleItems)
      setMaxScrollPosition(maxPosition)
    }
  }, [movies, visibleItems])

  // Điều hướng qua lại
  const navigate = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentIndex((prev) => Math.max(0, prev - Math.floor(visibleItems)))
    } else {
      const maxIndex = Math.max(0, movies.length - Math.ceil(visibleItems))
      setCurrentIndex((prev) => Math.min(maxIndex, prev + Math.floor(visibleItems)))
    }
  }

  // Điều hướng bằng cử chỉ chạm (touch gestures)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    
    if (isLeftSwipe && currentIndex < movies.length - visibleItems) {
      navigate("next")
    }
    
    if (isRightSwipe && currentIndex > 0) {
      navigate("prev")
    }
    
    setTouchStart(0)
    setTouchEnd(0)
  }

  // Kiểm tra điều kiện hiển thị nút điều hướng
  const canNavigatePrev = currentIndex > 0
  const canNavigateNext = currentIndex + visibleItems < movies.length

  // Phân trang
  const pageCount = Math.ceil(movies.length / Math.floor(visibleItems))
  const currentPage = Math.floor(currentIndex / Math.floor(visibleItems))

  // ---- Navigation Methods ----
  const scroll = useCallback((direction: "left" | "right") => {
    setScrollPosition(prev => {
      if (direction === "left") {
        return Math.max(0, prev - (visibleItems < 1 ? 1 : visibleItems))
      } else {
        return Math.min(maxScrollPosition, prev + (visibleItems < 1 ? 1 : visibleItems))
      }
    })
  }, [maxScrollPosition, visibleItems])
  
  // Handle mouse hover for popup
  const handleMouseEnter = (movieId: string, event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    
    // Tính toán vị trí chính giữa phía trên của thẻ phim
    setPopupPosition({
      top: rect.top + window.scrollY - 10, // Vị trí ở phía trên card với 10px offset
      left: rect.left + window.scrollX + (rect.width / 2) // Căn giữa theo chiều ngang
    })
    setHoveredMovie(movieId)
  }
  
  const canScrollLeft = scrollPosition > 0
  const canScrollRight = scrollPosition < maxScrollPosition && movies.length > visibleItems

  return (
    <div className="relative py-4 md:py-6 lg:py-8">
      {/* Tiêu đề và nút điều hướng */}
      <div className="flex items-stretch mb-6">
        {/* Cột trái: Tiêu đề và link Xem tất cả */}
        <div className="w-1/4 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-1 h-6 ${getAccentColor()} rounded-full`}></div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{title}</h2>
          </div>
          
          <Link 
            href={viewAllHref} 
            className={`hidden sm:flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors mt-2`}
          >
            Xem tất cả
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        {/* Cột phải: điều hướng carousel */}
        <div className="w-3/4 flex items-end justify-end gap-2">
          <button 
            onClick={() => scroll("left")} 
            disabled={!canScrollLeft}
            className={`p-1.5 sm:p-2 rounded-full ${canScrollLeft ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-800/50 cursor-not-allowed'} text-white transition-colors`}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button 
            onClick={() => scroll("right")} 
            disabled={!canScrollRight}
            className={`p-1.5 sm:p-2 rounded-full ${canScrollRight ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-800/50 cursor-not-allowed'} text-white transition-colors`}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {/* Link "Xem tất cả" cho màn hình nhỏ */}
      <div className="sm:hidden mb-4">
        <Link 
          href={viewAllHref}
          className={`flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors`}
        >
          Xem tất cả
          <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>
      
      {/* Layout 2 cột cho carousel */}
      <div className="flex">
        {/* Cột trái - padding cho điều chỉnh canh lề với header */}
        <div className="w-1/4 pr-4 hidden md:block">
          {/* Nội dung phụ hoặc để trống để giữ cấu trúc */}
          <div className="h-full flex flex-col justify-center">
            <div className={`w-1 h-20 ${getAccentColor()} rounded-full opacity-30 ml-3`}></div>
          </div>
        </div>
        
        {/* Cột phải - Carousel */}
        <div 
          ref={containerRef}
          className="w-full md:w-3/4 relative overflow-hidden" 
        >
          <div
            ref={sliderRef}
            className="flex gap-5 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${scrollPosition * (100 / visibleItems)}%)`,
              width: `${(movies.length / visibleItems) * 100}%`, // Đảm bảo tổng chiều rộng đúng
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {movies.map((movie, index) => (
              <div 
                key={movie.id}
                className="flex-shrink-0 z-10 hover:z-50"
                style={{ width: `${100 / movies.length}%` }} // Đảm bảo tổng chiều rộng là 100%
                onMouseEnter={(e) => handleMouseEnter(movie.id, e)}
                onMouseLeave={() => {
                  setHoveredMovie(null)
                  setPopupPosition(null)
                }}
              >
                <MovieCard movie={movie} index={index} variant="slider" />
                
                {/* Hover popup */}
                {hoveredMovie === movie.id && popupPosition && (
                  <MovieCardHover movie={movie} position={popupPosition} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieSlider

