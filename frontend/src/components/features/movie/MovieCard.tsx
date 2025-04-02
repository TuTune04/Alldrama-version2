import Link from "next/link"
import Image from "next/image"
import type { Movie } from "@/types"
import { generateMovieUrl } from "@/utils/url"
import { Star, Eye, Play } from "lucide-react"
// Tạm thời loại bỏ framer-motion để khắc phục lỗi
// import { motion } from "framer-motion"

interface MovieCardProps {
  movie: Movie
  index?: number
}

const MovieCard = ({ movie, index = 0 }: MovieCardProps) => {
  // Xử lý URL cho backdrop an toàn
  const imageUrl = movie.posterUrl || "/images/placeholder-poster.jpg"
  
  return (
    <div className="group relative h-full w-full overflow-hidden rounded-xl">
      {/* Card Container */}
      <div className="relative h-full bg-gray-900 rounded-xl overflow-hidden border border-gray-800 transition-all duration-500 group-hover:border-amber-500/30 group-hover:shadow-xl group-hover:shadow-amber-950/10">
        {/* Border gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/0 via-amber-600/0 to-amber-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl group-hover:from-amber-600/10 group-hover:via-amber-600/5 group-hover:to-purple-700/10"></div>
        
        {/* Poster Image Container */}
        <Link href={generateMovieUrl(movie.id, movie.title)} className="block aspect-[2/3] relative overflow-hidden">
          <div className="absolute inset-0 bg-gray-800 animate-pulse"></div>
          
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 150px, (max-width: 768px) 200px, (max-width: 1024px) 240px, 280px"
            className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110 group-hover:saturate-110"
            loading="lazy"
          />
          
          {/* Image overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Play button overlay on hover */}
          <div className="absolute inset-0 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-100 scale-125">
            <div className="relative flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full bg-amber-600/90 text-white shadow-lg shadow-amber-900/30 transition-transform duration-300 group-hover:scale-110">
              <div className="absolute inset-0 rounded-full animate-ping bg-amber-600/40 opacity-0 group-hover:opacity-100"></div>
              <Play fill="white" size={20} className="ml-0.5 sm:ml-1" />
            </div>
          </div>
          
          {/* Top badges */}
          <div className="absolute top-0 left-0 right-0 p-1.5 sm:p-2.5 flex justify-between items-center">
            {/* Rating badge */}
            <div className="bg-black/60 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg flex items-center gap-1 text-white z-10 border border-gray-800/40">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-[10px] sm:text-xs font-semibold">{movie.rating || "N/A"}</span>
            </div>
            
            {/* Views badge */}
            <div className="bg-amber-600/80 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg flex items-center gap-1 text-white z-10 border border-amber-500/40">
              <Eye size={12} className="text-white" />
              <span className="text-[10px] sm:text-xs font-semibold">
                {new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(movie.views || 0)}
              </span>
            </div>
          </div>
          
          {/* Description overlay on hover - Chỉ hiển thị trên màn hình lớn hơn */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10 hidden sm:block">
            <p className="text-white text-xs sm:text-sm line-clamp-3 mb-3 opacity-0 group-hover:opacity-100 transition-opacity delay-100 duration-500 transform translate-y-4 group-hover:translate-y-0">
              {movie.description}
            </p>
          </div>
          
          {/* Shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 pointer-events-none bg-gradient-to-tr from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out"></div>
        </Link>
        
        {/* Content area */}
        <div className="p-2 sm:p-3 md:p-4 relative">
          <Link href={generateMovieUrl(movie.id, movie.title)}>
            <h3 className="text-white font-bold text-xs sm:text-sm md:text-base mb-1 sm:mb-1.5 line-clamp-1 group-hover:text-amber-500 transition-colors">
              {movie.title}
            </h3>
          </Link>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-[10px] sm:text-xs">{movie.releaseYear}</span>
            <div className="flex flex-wrap gap-1 max-w-[60%] justify-end">
              {movie.genres && movie.genres.slice(0, 2).map((genre, index) => {
                const genreId = typeof genre === "string" ? genre : genre.id
                const genreName = typeof genre === "string" ? genre : genre.name
                // Nếu tên thể loại quá dài, cắt bớt
                const displayName = genreName.length > 10 ? genreName.substring(0, 8) + '...' : genreName
                
                return (
                  <Link
                    key={`${genreId}-${index}`}
                    href={`/movie?genre=${encodeURIComponent(genreName)}`}
                    className="text-[8px] xs:text-[10px] sm:text-xs bg-gray-800/80 hover:bg-amber-600 text-gray-300 hover:text-white px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded-md transition-all duration-300 truncate"
                    title={genreName}
                  >
                    {displayName}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Reflection effect for premium look - chỉ hiển thị trên màn hình lớn hơn */}
      <div className="hidden sm:block h-[10%] mt-1 mx-6 rounded-b-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-b from-amber-600/30 to-transparent"></div>
    </div>
  )
}

export default MovieCard

