"use client"

import { useState, useRef, useEffect } from "react"
import type { Movie } from "@/types"
import MovieCard from "./MovieCard"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import Link from "next/link"
// Tạm thời loại bỏ framer-motion để khắc phục lỗi
// import { motion } from "framer-motion"

interface MovieSliderProps {
  title: string
  movies: Movie[]
  viewMoreLink?: string
}

const MovieSlider = ({ title, movies, viewMoreLink }: MovieSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleItems, setVisibleItems] = useState(5)
  const [isHovering, setIsHovering] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  // Xử lý đa phương tiện và tối ưu responsive
  useEffect(() => {
    const updateVisibleItems = () => {
      if (!sliderRef.current) return

      const containerWidth = sliderRef.current.clientWidth
      let calculatedItems = 5

      if (containerWidth < 640) {
        calculatedItems = 2.5 // Mobile
      } else if (containerWidth < 768) {
        calculatedItems = 3.5 // Tablet
      } else if (containerWidth < 1024) {
        calculatedItems = 4 // Small laptop
      } else if (containerWidth < 1280) {
        calculatedItems = 5 // Standard laptop
      } else {
        calculatedItems = 6 // Large screen
      }

      setVisibleItems(calculatedItems)
    }

    // Khởi tạo
    updateVisibleItems()
    
    // Cập nhật khi thay đổi kích thước màn hình
    const handleResize = () => {
      updateVisibleItems()
    }
    
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

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

  return (
    <div 
      className="relative py-8"
      // Loại bỏ các thuộc tính của motion
      // initial={{ opacity: 0, y: 20 }}
      // animate={{ opacity: 1, y: 0 }}
      // transition={{ duration: 0.6, ease: "easeOut" }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Header với tiêu đề và nút xem thêm */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center group">
          <div className="h-5 w-1 bg-amber-500 rounded-full mr-3 group-hover:h-6 transition-all duration-300"></div>
          <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-amber-500 transition-colors duration-300">{title}</h2>
          <div className="ml-4 hidden md:flex space-x-1 items-center">
            {pageCount > 1 &&
              Array.from({ length: pageCount }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * Math.floor(visibleItems))}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentPage
                      ? "bg-amber-500 w-6"
                      : "bg-gray-700 w-2 hover:bg-gray-600"
                  }`}
                  aria-label={`Đến trang ${index + 1}`}
                />
              ))}
          </div>
        </div>

        {viewMoreLink && (
          <Link
            href={viewMoreLink}
            className="group flex items-center text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors"
          >
            <span>Xem thêm</span>
            <ArrowRight className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Container slider chính */}
      <div className="relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Nút điều hướng trái */}
        <button
          onClick={() => navigate("prev")}
          className={`absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/80 border border-gray-700 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
            canNavigatePrev 
              ? "opacity-0 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-gray-800 hover:border-gray-600" 
              : "opacity-0 cursor-default"
          }`}
          disabled={!canNavigatePrev}
          aria-label="Các mục trước"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </button>

        {/* Vùng hiển thị slider */}
        <div className="relative overflow-hidden rounded-xl">
          <div
            ref={sliderRef}
            className="flex gap-4 transition-transform duration-500 ease-out pb-4"
            style={{
              transform: `translateX(-${(currentIndex / movies.length) * 100 * (movies.length / visibleItems)}%)`,
            }}
          >
            {movies.map((movie, index) => (
              <div
                key={movie.id}
                className="flex-shrink-0"
                style={{ width: `calc(${100 / visibleItems}% - ${(4 * (visibleItems - 1)) / visibleItems}rem)` }}
              >
                <MovieCard movie={movie} index={index} />
              </div>
            ))}
          </div>

          {/* Hiệu ứng mờ dần ở phía bên phải */}
          <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none"></div>
        </div>

        {/* Nút điều hướng phải */}
        <button
          onClick={() => navigate("next")}
          className={`absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/80 border border-gray-700 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
            canNavigateNext 
              ? "opacity-0 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-gray-800 hover:border-gray-600" 
              : "opacity-0 cursor-default"
          }`}
          disabled={!canNavigateNext}
          aria-label="Các mục kế tiếp"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </button>
      </div>

      {/* Chấm phân trang trên thiết bị di động */}
      <div className="flex justify-center mt-5 gap-1 md:hidden">
        {pageCount > 1 &&
          Array.from({ length: pageCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * Math.floor(visibleItems))}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentPage ? "bg-amber-500 w-4" : "bg-gray-700"
              }`}
              aria-label={`Đến trang ${index + 1}`}
            />
          ))}
      </div>
    </div>
  )
}

export default MovieSlider

