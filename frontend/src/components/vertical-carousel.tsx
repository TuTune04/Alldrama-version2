import type React from "react"
import Image from "next/image"
import Link from "next/link"
import type { Movie } from "@/app/providers/MovieContext"

interface VerticalCarouselProps {
  movies: Movie[]
}

export const VerticalCarousel: React.FC<VerticalCarouselProps> = ({ movies }) => {
  // Giới hạn chỉ 5 phim đầu tiên
  const displayedMovies = movies.slice(0, 5)

  return (
    <div className="space-y-4">
      {displayedMovies.map((movie) => (
        <Link href={`/movie/${movie.id}`} key={movie.id} className="block">
          <div className="flex items-center space-x-4 hover:bg-gray-700 rounded-lg transition-colors duration-200 p-2">
            <div className="relative w-1/3 aspect-[2/3]">
              <Image
                src={movie.posterUrl || "/placeholder.svg"}
                alt={movie.title}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1 line-clamp-2">{movie.title}</h4>
              <p className="text-xs text-gray-400">{movie.releaseYear}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
