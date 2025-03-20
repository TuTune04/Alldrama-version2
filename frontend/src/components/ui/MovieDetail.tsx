"use client"

import type { Movie, Episode } from "@/types"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { generateWatchUrl } from "@/utils/url"
import { Star, Play, Film, Clock, Calendar, Eye, ChevronDown, ChevronUp, Info } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface MovieDetailProps {
  movie: Movie
  episodes?: Episode[]
}

const MovieDetail = ({ movie, episodes = [] }: MovieDetailProps) => {
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [activeEpisode, setActiveEpisode] = useState<string | null>(null)
  const isMobile = useMobile()

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription)
  }

  useEffect(() => {
    // Reset description state when movie changes
    setShowFullDescription(false)
  }, [movie.id])

  return (
    <div className="text-white">
      {/* Banner */}
      <div className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={movie.posterUrl || "/placeholder.svg"}
            alt={movie.title}
            fill
            priority
            className="object-cover object-center scale-110 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-gray-900/40" />
        </div>

        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8 md:pb-12">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="hidden md:block w-64 h-96 flex-shrink-0 relative rounded-xl overflow-hidden shadow-2xl">
                <Image src={movie.posterUrl || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
                <div className="absolute inset-0 ring-1 ring-white/10 rounded-xl"></div>
              </div>

              <div className="space-y-4 flex-grow">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">{movie.title}</h1>

                <div className="flex flex-wrap gap-3 items-center text-sm md:text-base text-gray-300">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    <span>{movie.releaseYear}</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
                    <span>{movie.rating || 0}</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1 text-gray-400" />
                    <span>{new Intl.NumberFormat("vi-VN").format(movie.views || 0)} lượt xem</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {movie.genres.map((genre, index) => {
                    const genreId = typeof genre === "string" ? genre : genre.id
                    const genreName = typeof genre === "string" ? genre : genre.name

                    return (
                      <Link
                        key={`${genreId}-${index}`}
                        href={`/movie?genre=${encodeURIComponent(genreName)}`}
                        className="px-3 py-1 bg-gray-800/80 hover:bg-red-600 rounded-full text-white text-sm transition-colors backdrop-blur-sm"
                      >
                        {genreName}
                      </Link>
                    )
                  })}
                </div>

                <div className="flex flex-wrap gap-4">
                  {episodes.length > 0 && (
                    <Link
                      href={generateWatchUrl(movie.id, movie.title, episodes[0].id, episodes[0].episodeNumber)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full inline-flex items-center transition-colors shadow-lg shadow-red-600/20"
                    >
                      <Play className="h-5 w-5 mr-2 fill-white" />
                      Xem ngay
                    </Link>
                  )}
                  <Link
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gray-800/80 hover:bg-gray-700 text-white font-medium rounded-full inline-flex items-center transition-colors backdrop-blur-sm"
                  >
                    <Film className="h-5 w-5 mr-2" />
                    Xem trailer
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_22rem] gap-8">
          <div>
            {/* Description */}
            <div className="mb-8 bg-gray-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-red-500" />
                Nội dung phim
              </h2>
              <div className={!showFullDescription ? "line-clamp-3" : ""}>{movie.description}</div>
              <button
                onClick={toggleDescription}
                className="mt-3 text-red-500 hover:text-red-400 text-sm font-medium inline-flex items-center"
              >
                {showFullDescription ? (
                  <>
                    Thu gọn <ChevronUp className="ml-1 w-4 h-4" />
                  </>
                ) : (
                  <>
                    Xem thêm <ChevronDown className="ml-1 w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Episodes */}
            {episodes.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Play className="w-5 h-5 mr-2 text-red-500" />
                  Danh sách tập
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {episodes.map((episode) => (
                    <Link
                      key={episode.id}
                      href={generateWatchUrl(movie.id, movie.title, episode.id, episode.episodeNumber)}
                      className="group p-4 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 hover:shadow-lg hover:shadow-red-500/5 transition-all flex items-center gap-3 border border-transparent hover:border-red-500/20"
                      onMouseEnter={() => setActiveEpisode(episode.id)}
                      onMouseLeave={() => setActiveEpisode(null)}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${activeEpisode === episode.id ? "bg-red-600" : "bg-gray-700 group-hover:bg-red-600/80"}`}
                      >
                        <span className="font-bold">{episode.episodeNumber}</span>
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-medium line-clamp-1 group-hover:text-white transition-colors">
                          {episode.title}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {Math.floor(episode.duration / 60)} phút
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-white/5 sticky top-24">
              <h3 className="text-xl font-bold mb-6 pb-2 border-b border-gray-700 flex items-center">
                <Info className="w-5 h-5 mr-2 text-red-500" />
                Thông tin phim
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    Năm phát hành
                  </span>
                  <span className="font-medium">{movie.releaseYear}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center">
                    <Film className="w-4 h-4 mr-2 text-gray-500" />
                    Số tập
                  </span>
                  <span className="font-medium bg-gray-700 px-2 py-0.5 rounded-md">{episodes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center">
                    <Star className="w-4 h-4 mr-2 text-gray-500" />
                    Đánh giá
                  </span>
                  <div className="flex items-center font-medium">
                    <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
                    <span>{movie.rating || 0}/10</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-gray-500" />
                    Lượt xem
                  </span>
                  <span className="font-medium">{new Intl.NumberFormat("vi-VN").format(movie.views || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    Cập nhật
                  </span>
                  <span className="font-medium">{new Date(movie.updatedAt).toLocaleDateString("vi-VN")}</span>
                </div>

                {/* Quick actions */}
                {episodes.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <Link
                      href={generateWatchUrl(movie.id, movie.title, episodes[0].id, episodes[0].episodeNumber)}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg inline-flex items-center justify-center transition-colors"
                    >
                      <Play className="h-5 w-5 mr-2 fill-white" />
                      Xem ngay
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieDetail

