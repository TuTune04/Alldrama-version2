import type { MovieListResponse } from "@/types"
import MovieCard from "./MovieCard"
import { FileQuestion } from "lucide-react"
// Tạm thời loại bỏ import motion để khắc phục lỗi
// import { motion } from "framer-motion"

interface MovieGridProps {
  movieList: MovieListResponse
  isLoading?: boolean
}

const MovieGrid = ({ movieList, isLoading = false }: MovieGridProps) => {
  // Loại bỏ các animation variants tạm thời
  // const containerVariants = {
  //   hidden: { opacity: 0 },
  //   visible: {
  //     opacity: 1,
  //     transition: {
  //       staggerChildren: 0.05
  //     }
  //   }
  // }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 xs:gap-3 sm:gap-4 md:gap-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div 
            key={index} 
            className="flex flex-col h-full"
          >
            <div className="relative aspect-[2/3] bg-gray-900 rounded-xl w-full overflow-hidden border border-gray-800">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/80 animate-pulse"></div>
              
              {/* Top badges */}
              <div className="absolute top-0 left-0 right-0 p-1.5 sm:p-2.5 flex justify-between items-center">
                {/* Rating badge placeholder */}
                <div className="bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-lg h-5 w-10 sm:h-6 sm:w-12 animate-pulse bg-gray-800"></div>
                
                {/* Views badge placeholder */}
                <div className="bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-lg h-5 w-10 sm:h-6 sm:w-12 animate-pulse bg-gray-800"></div>
              </div>
            </div>
            
            <div className="p-2 sm:p-3">
              <div className="h-4 sm:h-5 bg-gray-800 rounded-md w-4/5 animate-pulse"></div>
              <div className="mt-2 flex justify-between items-center">
                <div className="h-3 sm:h-4 bg-gray-800 rounded-md w-1/4 animate-pulse"></div>
                <div className="flex gap-1">
                  <div className="h-3 sm:h-4 bg-gray-800 rounded-md w-8 sm:w-12 animate-pulse"></div>
                  <div className="h-3 sm:h-4 bg-gray-800 rounded-md w-8 sm:w-12 animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Reflection effect placeholder - chỉ hiển thị trên màn hình lớn */}
            <div className="hidden sm:block h-[10%] mt-1 mx-6 rounded-b-full opacity-30 bg-gradient-to-b from-gray-800/20 to-transparent"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!movieList.movies || movieList.movies.length === 0) {
    return (
      <div className="py-12 sm:py-16 text-center">
        <div className="inline-flex justify-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-800/50 flex items-center justify-center backdrop-blur-sm border border-gray-700">
            <FileQuestion className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
        </div>
        <h3 className="text-xl sm:text-2xl font-medium text-white mb-2 sm:mb-3">Không tìm thấy phim</h3>
        <p className="text-gray-400 text-sm sm:text-base mt-2 max-w-md mx-auto">
          Không tìm thấy phim nào phù hợp với tiêu chí tìm kiếm. Vui lòng thử lại với từ khóa khác.
        </p>
        <div className="mt-6 sm:mt-8">
          <button 
            onClick={() => history.back()}
            className="px-5 py-2 sm:px-6 sm:py-2.5 bg-amber-600/90 hover:bg-amber-600 text-white text-sm sm:text-base rounded-full transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 xs:gap-3 sm:gap-4 md:gap-5">
      {movieList.movies.map((movie, index) => (
        <MovieCard key={movie.id} movie={movie} index={index} />
      ))}
    </div>
  )
}

export default MovieGrid

