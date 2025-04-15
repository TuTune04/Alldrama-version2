"use client"

import type { Movie, Episode } from "@/types"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { generateMovieUrl, generateWatchUrl } from "@/utils/url"
import { Star, Play, Film, Clock, Calendar, Eye, ChevronDown, ChevronUp, Info, Heart, Bookmark, TrendingUp, BarChart3, Layers, Share, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import CommentSection from "./comment-section"
import { Badge } from "@/components/ui/badge"
import { mockMovies } from "@/mocks"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import MovieCard from "./MovieCard" // Import MovieCard

// Mock movie versions
const movieVersions = [
  { id: '1', name: 'Bản Việt Sub', type: 'SUB', isDefault: true },
  { id: '2', name: 'Bản Thuyết Minh', type: 'DUB', isDefault: false },
  { id: '3', name: 'Bản Chiếu Rạp', type: 'CINEMA', isDefault: false },
]

interface MovieDetailProps {
  movie: Movie
  episodes?: Episode[]
}

const MovieDetail = ({ movie, episodes = [] }: MovieDetailProps) => {
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [activeEpisode, setActiveEpisode] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState(movieVersions[0].id)
  const [isWatchlist, setIsWatchlist] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleCards, setVisibleCards] = useState(2)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Get top rated movies for sidebar and similar movies
  const topRatedMovies = [...mockMovies]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5)

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription)
  }

  useEffect(() => {
    // Reset description state when movie changes
    setShowFullDescription(false)
  }, [movie.id])

  // Tính toán số lượng thẻ hiển thị dựa trên kích thước màn hình
  useEffect(() => {
    const updateVisibleCards = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCards(4) // Máy tính: 4 thẻ
      } else if (window.innerWidth >= 640) {
        setVisibleCards(4) // Tablet: 3 thẻ
      } else {
        setVisibleCards(2) // Điện thoại: 2 thẻ
      }
    }

    updateVisibleCards()
    window.addEventListener("resize", updateVisibleCards)
    return () => window.removeEventListener("resize", updateVisibleCards)
  }, [])

  // Điều hướng carousel
  const scrollCarousel = (direction: "left" | "right") => {
    if (direction === "left" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else if (direction === "right" && currentIndex < topRatedMovies.length - visibleCards) {
      setCurrentIndex(currentIndex + 1)
    }

    if (carouselRef.current) {
      const cardWidth = window.innerWidth < 640 ? 112 : 128 // w-28 (112px) hoặc w-32 (128px)
      const gap = window.innerWidth < 640 ? 8 : 12 // gap-2 (8px) hoặc gap-3 (12px)
      const scrollPosition = currentIndex * (cardWidth + gap)
      carouselRef.current.style.transform = `translateX(-${scrollPosition}px)`
    }
  }

  return (
    <div className="text-foreground">
      {/* Hero Banner with parallax effect */}
      <div className="relative w-full h-[50vh] md:h-[75vh] overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800/40 to-gray-900/40 mix-blend-multiply z-20" />
          <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none z-20" />
          <Image
            src={movie.posterUrl || "/placeholder.svg"}
            alt={movie.title}
            fill
            priority
            className="object-cover object-center scale-110 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/30" />
        </div>

        {/* Movie Details */}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8 md:pb-12">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              {/* Poster with glow effect */}
              <div className="hidden md:block w-64 h-96 flex-shrink-0 relative rounded-xl overflow-hidden shadow-2xl shadow-indigo-500/10 group">
                <Image 
                  src={movie.posterUrl || "/placeholder.svg"} 
                  alt={movie.title} 
                  fill 
                  className="object-cover transform group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 ring-1 ring-indigo-500/20 rounded-xl group-hover:ring-indigo-500/40 transition-all"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
                    <Play className="h-5 w-5 fill-current mr-2" /> Xem ngay
                  </Button>
                </div>
              </div>

              {/* Movie Info */}
              <div className="space-y-5 flex-grow">
                <div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-sm">{movie.title}</h1>
                  <div className="relative">
                    <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                    <p className="text-lg text-gray-300 italic pl-1">{"Một bộ phim đáng xem"}</p>
                  </div>
                </div>

                {/* Movie Metrics */}
                <div className="flex flex-wrap gap-4 items-center text-sm md:text-base">
                  <div className="flex items-center bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full text-indigo-200 border border-indigo-500/20">
                    <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
                    <span>{movie.releaseYear}</span>
                  </div>
                  
                  <div className="flex items-center bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full text-amber-200 border border-amber-500/20">
                    <Star className="w-4 h-4 mr-2 text-amber-400 fill-amber-400" />
                    <span>{movie.rating || "8.5"}</span>
                  </div>
                  
                  <div className="flex items-center bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full text-indigo-200 border border-indigo-500/20">
                    <Eye className="w-4 h-4 mr-2 text-indigo-400" />
                    <span>{new Intl.NumberFormat("vi-VN").format(movie.views || 0)} lượt xem</span>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap items-center gap-2">
                  {movie.genres && movie.genres.map((genre, index) => {
                    const genreId = typeof genre === "string" ? genre : genre.id
                    const genreName = typeof genre === "string" ? genre : genre.name

                    return (
                      <Link
                        key={`${genreId}-${index}`}
                        href={`/movie?genre=${encodeURIComponent(genreName)}`}
                        className="px-3 py-1 bg-gray-800/80 hover:bg-indigo-600 border border-gray-700 hover:border-indigo-500 rounded-full text-white text-sm transition-all backdrop-blur-sm shadow-sm"
                      >
                        {genreName}
                      </Link>
                    )
                  })}
                </div>

                {/* Movie Versions */}
                <div className="flex flex-wrap gap-2">
                  {movieVersions.map((version) => (
                    <button
                      key={version.id}
                      onClick={() => setSelectedVersion(version.id)}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        selectedVersion === version.id
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                          : 'bg-gray-800/40 text-gray-300 hover:bg-gray-800/60 border border-gray-700'
                      }`}
                    >
                      {version.name}
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {episodes.length > 0 ? (
                    <Button asChild size="lg" className="rounded-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-none text-white shadow-lg">
                      <Link href={generateWatchUrl(movie.id, movie.title, episodes[0].id, episodes[0].episodeNumber)}>
                        <Play className="h-5 w-5 fill-current" />
                        Xem ngay
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="rounded-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-none text-white shadow-lg">
                      <Link href={movie.trailerUrl || "#"}>
                        <Play className="h-5 w-5 fill-current" />
                        Xem phim
                      </Link>
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="rounded-full gap-2 border-gray-600 bg-gray-900/40 hover:bg-gray-800 text-white backdrop-blur-sm"
                    asChild
                  >
                    <Link href={movie.trailerUrl || "#"} target="_blank" rel="noopener noreferrer">
                      <Film className="h-5 w-5" />
                      Xem trailer
                    </Link>
                  </Button>
                  
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className={`rounded-full w-11 h-11 ${isWatchlist 
                              ? 'bg-indigo-600 text-white border-indigo-500' 
                              : 'bg-gray-900/40 border-gray-600 hover:bg-gray-800 text-white backdrop-blur-sm'}`}
                            onClick={() => setIsWatchlist(!isWatchlist)}
                          >
                            <Bookmark className={`h-5 w-5 ${isWatchlist ? 'fill-white' : ''}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isWatchlist ? 'Đã lưu' : 'Lưu phim'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className={`rounded-full w-11 h-11 ${isLiked 
                              ? 'bg-pink-600 text-white border-pink-500' 
                              : 'bg-gray-900/40 border-gray-600 hover:bg-gray-800 text-white backdrop-blur-sm'}`}
                            onClick={() => setIsLiked(!isLiked)}
                          >
                            <Heart className={`h-5 w-5 ${isLiked ? 'fill-white' : ''}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isLiked ? 'Đã thích' : 'Thích phim'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="rounded-full w-11 h-11 bg-gray-900/40 border-gray-600 hover:bg-gray-800 text-white backdrop-blur-sm"
                          >
                            <Share className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Chia sẻ</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Column */}
          <div>
            <Tabs defaultValue="info" className="mb-8">
              <TabsList className="bg-gray-800/60 border border-gray-700/50 p-0.5 rounded-lg mb-6">
                <TabsTrigger 
                  value="info" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-md py-2"
                >
                  <Info className="w-4 h-4 mr-2" /> Giới thiệu
                </TabsTrigger>
                {episodes.length > 0 && (
                  <TabsTrigger 
                    value="episodes" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-md py-2"
                  >
                    <Layers className="w-4 h-4 mr-2" /> Tập phim ({episodes.length})
                  </TabsTrigger>
                )}
                <TabsTrigger 
                  value="comments" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-md py-2"
                >
                  <TrendingUp className="w-4 h-4 mr-2" /> Bình luận
                </TabsTrigger>
              </TabsList>
              
              {/* Info Tab */}
              <TabsContent value="info" className="space-y-4">
                {/* Nội dung phim */}
                <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
                  <CardContent className="p-6 relative">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                      <Info className="w-5 h-5 mr-2 text-indigo-400" />
                      <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                        Nội dung phim
                      </span>
                    </h2>
                    
                    <div className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                      {movie.description}
                    </div>
                    
                    <button
                      onClick={toggleDescription}
                      className="mt-2 text-blue-400 hover:text-blue-300 text-xs sm:text-sm flex items-center"
                    >
                      {showFullDescription ? (
                        <>
                          Thu gọn <ChevronUp className="ml-1 w-3 h-3 sm:w-4 sm:h-4" />
                        </>
                      ) : (
                        <>
                          Xem thêm <ChevronDown className="ml-1 w-3 h-3 sm:w-4 sm:h-4" />
                        </>
                      )}
                    </button>
                  </CardContent>
                </Card>

                {/* Movie stats */}
                <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
                  <CardContent className="p-3 sm:p-6 relative">
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-indigo-400" />
                        <div>
                          <p className="text-gray-400 text-[10px] sm:text-sm">Phát hành</p>
                          <p className="text-white text-[10px] sm:text-sm">{movie.releaseYear}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-indigo-400" />
                        <div>
                          <p className="text-gray-400 text-[10px] sm:text-sm">Thời lượng</p>
                          <p className="text-white text-[10px] sm:text-sm">{movie.duration || "120"} phút</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <BarChart3 className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-indigo-400" />
                        <div>
                          <p className="text-gray-400 text-[10px] sm:text-sm">Đánh giá</p>
                          <p className="text-white text-[10px] sm:text-sm flex items-center">
                            <Star className="h-3 w-3 sm:h-5 sm:w-5 mr-0.5 sm:mr-1 text-yellow-400 fill-yellow-400" />
                            {movie.rating || "8.5"}/10
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Có thể bạn cũng thích */}
                <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
                  <CardContent className="p-3 sm:p-6 relative">
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <h2 className="text-sm sm:text-xl font-bold flex items-center text-white">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-400" />
                        <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                          Có thể bạn cũng thích
                        </span>
                      </h2>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => scrollCarousel("left")}
                          className="p-1 rounded-full bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={currentIndex === 0}
                        >
                          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => scrollCarousel("right")}
                          className="p-1 rounded-full bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={currentIndex >= topRatedMovies.length - visibleCards}
                        >
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <div
                        ref={carouselRef}
                        className="flex gap-2 sm:gap-3 transition-transform duration-300"
                        style={{ 
                          transform: `translateX(-${currentIndex * (100 / Math.max(1, visibleCards))}%)`,
                          width: `${(topRatedMovies.length / Math.max(1, visibleCards)) * 100}%`
                        }}
                      >
                        {topRatedMovies.map((movie, idx) => (
                          <div 
                            key={movie.id} 
                            className="flex-shrink-0" 
                            style={{ width: `${100 / Math.max(1, visibleCards)}%` }}
                          >
                            <MovieCard
                              movie={movie}
                              index={idx}
                              variant="slider"
                              trapezoid={false}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>  
              
              {/* Episodes Tab */}
              {episodes.length > 0 && (
                <TabsContent value="episodes">
                  <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
                    <CardContent className="p-6 relative">
                      <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                        <Layers className="w-5 h-5 mr-2 text-indigo-400" />
                        <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                          Danh sách tập phim
                        </span>
                      </h2>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {episodes.map((episode) => (
                          <Link
                            key={episode.id}
                            href={generateWatchUrl(movie.id, movie.title, episode.id, episode.episodeNumber)}
                            className="group p-4 bg-gray-800/50 rounded-xl hover:bg-gradient-to-r hover:from-indigo-900/40 hover:to-purple-900/40 transition-all flex items-center gap-3 border border-gray-700 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-900/10"
                            onMouseEnter={() => setActiveEpisode(episode.id)}
                            onMouseLeave={() => setActiveEpisode(null)}
                          >
                            <div className={`relative w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                              activeEpisode === episode.id 
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600" 
                                : "bg-gray-700 group-hover:bg-gradient-to-r group-hover:from-indigo-600/80 group-hover:to-purple-600/80"
                            }`}>
                              <span className="font-bold text-white">
                                {episode.episodeNumber}
                              </span>
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
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
              
              {/* Comments Tab */}
              <TabsContent value="comments">
                <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
                  <CardContent className="p-6 relative">
                    <CommentSection movieId={movie.id} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Rated Movies */}
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 sticky top-4">
              <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
              <CardContent className="p-6 relative">
                <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                  <TrendingUp className="w-5 h-5 mr-2 text-indigo-400" />
                  <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                    Phim đánh giá cao
                  </span>
                </h2>
                
                <div className="space-y-4">
                  {topRatedMovies.map((movie, index) => (
                    <Link
                      key={movie.id}
                      href={generateMovieUrl(movie.id, movie.title)}
                      className="flex gap-3 group items-start hover:bg-gray-800/30 p-2 rounded-lg transition-colors"
                    >
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center font-bold text-lg border border-gray-600 text-indigo-300">
                        {index + 1}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="font-medium text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">{movie.title}</h3>
                        <div className="flex items-center text-sm text-gray-400 mt-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-1" />
                          <span>{movie.rating || "8.5"}</span>
                          <Separator orientation="vertical" className="mx-2 h-3 bg-gray-700" />
                          <span>{movie.releaseYear}</span>
                        </div>
                      </div>
                      <div className="w-16 h-22 flex-shrink-0 rounded-md overflow-hidden relative">
                        <Image
                          src={movie.posterUrl || "/placeholder.svg"}
                          alt={movie.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieDetail