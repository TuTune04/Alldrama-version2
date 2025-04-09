"use client"

import type { Movie, Episode } from "@/types"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { generateWatchUrl } from "@/utils/url"
import { Star, Play, Film, Clock, Calendar, Eye, ChevronDown, ChevronUp, Info, Heart, User, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import CommentSection from "./comment-section"
import { Badge } from "@/components/ui/badge"
import { mockMovies } from "@/mocks"
import MovieCardHover from "./MovieCardHover"

// Mock actors data (in a real app, this would come from the API)
const mockActors = [
  { id: '1', name: 'Tom Hanks', avatarUrl: '/images/actors/tom-hanks.jpg', role: 'Diễn viên chính' },
  { id: '2', name: 'Emma Stone', avatarUrl: '/images/actors/emma-stone.jpg', role: 'Diễn viên chính' },
  { id: '3', name: 'Robert Downey Jr.', avatarUrl: '/images/actors/robert-downey.jpg', role: 'Diễn viên phụ' },
  { id: '4', name: 'Scarlett Johansson', avatarUrl: '/images/actors/scarlett-johansson.jpg', role: 'Diễn viên phụ' },
]

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
  const [hoveredMovie, setHoveredMovie] = useState<string | null>(null)
  const [popupPosition, setPopupPosition] = useState<{ top: number, left: number } | null>(null)

  // Get top rated movies for sidebar
  const topRatedMovies = [...mockMovies]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription)
  }

  useEffect(() => {
    // Reset description state when movie changes
    setShowFullDescription(false)
  }, [movie.id])
  
  // Xử lý hiển thị popup khi hover vào phim
  const handleMouseEnter = (movieId: string, event: React.MouseEvent<HTMLElement>) => {
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    
    // Tính toán vị trí popup
    setPopupPosition({
      top: rect.top + window.scrollY, 
      left: rect.left + window.scrollX + (rect.width / 2)
    })
    setHoveredMovie(movieId)
  }

  return (
    <div className="text-foreground">
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
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>

        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8 md:pb-12">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="hidden md:block w-64 h-96 flex-shrink-0 relative rounded-xl overflow-hidden shadow-2xl">
                <Image src={movie.posterUrl || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
                <div className="absolute inset-0 ring-1 ring-border rounded-xl"></div>
              </div>

              <div className="space-y-4 flex-grow">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">{movie.title}</h1>

                <div className="flex flex-wrap gap-3 items-center text-sm md:text-base text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                    <span>{movie.releaseYear}</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-muted" />
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-amber-500 fill-amber-500" />
                    <span>{movie.rating || 0}</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-muted" />
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1 text-muted-foreground" />
                    <span>{new Intl.NumberFormat("vi-VN").format(movie.views || 0)} lượt xem</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {movie.genres && movie.genres.map((genre, index) => {
                    const genreId = typeof genre === "string" ? genre : genre.id
                    const genreName = typeof genre === "string" ? genre : genre.name

                    return (
                      <Link
                        key={`${genreId}-${index}`}
                        href={`/movie?genre=${encodeURIComponent(genreName)}`}
                        className="px-3 py-1 bg-secondary/80 hover:bg-primary rounded-full text-foreground hover:text-primary-foreground text-sm transition-colors backdrop-blur-sm"
                      >
                        {genreName}
                      </Link>
                    )
                  })}
                </div>

                {/* Movie Versions - NEW */}
                <div className="flex flex-wrap gap-2">
                  {movieVersions.map((version) => (
                    <button
                      key={version.id}
                      onClick={() => setSelectedVersion(version.id)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        selectedVersion === version.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary/40 text-foreground hover:bg-secondary/60'
                      }`}
                    >
                      {version.name}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  {episodes.length > 0 && (
                    <Button asChild size="lg" className="rounded-full gap-2">
                      <Link href={generateWatchUrl(movie.id, movie.title, episodes[0].id, episodes[0].episodeNumber)}>
                        <Play className="h-5 w-5 fill-current" />
                        Xem ngay
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" size="lg" className="rounded-full gap-2" asChild>
                    <Link href={movie.trailerUrl || "#"} target="_blank" rel="noopener noreferrer">
                      <Film className="h-5 w-5" />
                      Xem trailer
                    </Link>
                  </Button>
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
            <div className="mb-8 bg-card/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-primary" />
                Nội dung phim
              </h2>
              <div className={!showFullDescription ? "line-clamp-3" : ""}>{movie.description}</div>
              <button
                onClick={toggleDescription}
                className="mt-3 text-primary hover:text-primary/80 text-sm font-medium inline-flex items-center"
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
            
            {/* Actors Section - NEW */}
            <div className="mb-8 bg-card/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                Diễn viên
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {mockActors.map((actor) => (
                  <div key={actor.id} className="flex flex-col items-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2 border border-border/50">
                      <div className="relative w-full h-full">
                        <Image 
                          src={actor.avatarUrl || "/images/placeholder-user.jpg"} 
                          alt={actor.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-center">{actor.name}</h3>
                    <p className="text-xs text-muted-foreground text-center">{actor.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Episodes */}
            {episodes.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Play className="w-5 h-5 mr-2 text-primary" />
                  Danh sách tập
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {episodes.map((episode) => (
                    <Link
                      key={episode.id}
                      href={generateWatchUrl(movie.id, movie.title, episode.id, episode.episodeNumber)}
                      className="group p-4 bg-card/50 rounded-xl hover:bg-card hover:shadow-lg hover:shadow-primary/5 transition-all flex items-center gap-3 border border-transparent hover:border-primary/20"
                      onMouseEnter={() => setActiveEpisode(episode.id)}
                      onMouseLeave={() => setActiveEpisode(null)}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${activeEpisode === episode.id ? "bg-primary" : "bg-secondary group-hover:bg-primary/80"}`}
                      >
                        <span className="font-bold text-foreground group-hover:text-primary-foreground">
                          {episode.episodeNumber}
                        </span>
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-medium line-clamp-1 group-hover:text-foreground transition-colors">
                          {episode.title}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {Math.floor(episode.duration / 60)} phút
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Comment Section */}
            <CommentSection movieId={movie.id} />
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-card/50 rounded-xl p-6 backdrop-blur-sm border border-border/5 sticky top-24">
              <h3 className="text-xl font-bold mb-6 pb-2 border-b border-border flex items-center">
                <Info className="w-5 h-5 mr-2 text-primary" />
                Thông tin phim
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    Năm phát hành
                  </span>
                  <span className="font-medium">{movie.releaseYear}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center">
                    <Film className="w-4 h-4 mr-2 text-muted-foreground" />
                    Số tập
                  </span>
                  <Badge variant="secondary">{episodes.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center">
                    <Star className="w-4 h-4 mr-2 text-muted-foreground" />
                    Đánh giá
                  </span>
                  <div className="flex items-center font-medium">
                    <Star className="w-4 h-4 mr-1 text-amber-500 fill-amber-500" />
                    <span>{movie.rating || 0}/10</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
                    Lượt xem
                  </span>
                  <span className="font-medium">{new Intl.NumberFormat("vi-VN").format(movie.views || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    Cập nhật
                  </span>
                  <span className="font-medium">{new Date(movie.updatedAt || "").toLocaleDateString("vi-VN")}</span>
                </div>

                {/* Quick actions */}
                {episodes.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link href={generateWatchUrl(movie.id, movie.title, episodes[0].id, episodes[0].episodeNumber)}>
                          <Play className="h-5 w-5 mr-2 fill-current" />
                          Xem ngay
                        </Link>
                      </Button>

                      <Button variant="outline" size="icon">
                        <Heart className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Top Rated Movies - NEW */}
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                    Top phim xem nhiều
                  </h3>
                  <div className="space-y-3">
                    {topRatedMovies.map((topMovie, index) => (
                      <div 
                        key={topMovie.id}
                        className="relative"
                        onMouseEnter={(e) => handleMouseEnter(topMovie.id, e)}
                        onMouseLeave={() => {
                          setHoveredMovie(null)
                          setPopupPosition(null)
                        }}
                      >
                        <Link 
                          href={`/movie/${topMovie.id}-${topMovie.title.toLowerCase().replace(/\s+/g, '-')}`}
                          className="flex items-center gap-3 group hover:bg-card/70 p-2 rounded-lg transition-colors"
                        >
                          <div className="flex-shrink-0 relative w-12 h-16 rounded-md overflow-hidden">
                            <Image
                              src={topMovie.posterUrl || "/placeholder.svg"}
                              alt={topMovie.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-0 left-0 bg-primary/80 text-xs font-medium text-primary-foreground w-5 h-5 flex items-center justify-center">
                              {index + 1}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                              {topMovie.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">{topMovie.releaseYear}</span>
                              <div className="flex items-center">
                                <Star className="w-3 h-3 text-amber-500 mr-0.5" />
                                <span className="text-xs">{topMovie.rating || 0}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                        
                        {/* Popup hiển thị khi hover */}
                        {hoveredMovie === topMovie.id && popupPosition && (
                          <MovieCardHover movie={topMovie} position={popupPosition} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieDetail

