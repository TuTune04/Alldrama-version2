'use client'

import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { API_ENDPOINTS } from "@/lib/api/endpoints"
import { Movie, Episode } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { generateMovieUrl, getIdFromSlug, generateWatchUrl } from "@/utils/url"
import { useRouter } from "next/navigation"

// Import custom watch components
import VideoPlayer from '@/components/features/movie/VideoPlayer'
import NotFoundMessage from '@/components/features/watch/NotFoundMessage'
import MobileEpisodeSheet from '@/components/features/watch/MobileEpisodeSheet'
import ContentInfoCard from '@/components/features/watch/ContentInfoCard'
import CommentSection from '@/components/features/movie/CommentSection'
import RelatedMovies from '@/components/features/watch/RelatedMovies'
import DesktopEpisodePanel from '@/components/features/watch/DesktopEpisodePanel'

export default function WatchPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  
  // Get episode information from query parameters
  const episodeId = searchParams.get('episode')
  const episodeNumber = searchParams.get('ep')
  
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const [movie, setMovie] = useState<Movie | null>(null)
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentProgress, setCurrentProgress] = useState(0)
  const [nextEpisode, setNextEpisode] = useState<Episode | null>(null)
  const [prevEpisode, setPrevEpisode] = useState<Episode | null>(null)
  
  // UI control states
  const [showEpisodeList, setShowEpisodeList] = useState(false)
  const [episodeView, setEpisodeView] = useState<'grid' | 'list'>('grid')

  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Extract the movie ID from the slug using our URL utility
        const movieId = slug.split('-').pop()
        
        if (!movieId || isNaN(Number(movieId))) {
          console.error("Invalid slug format:", slug);
          throw new Error("Invalid movie ID in URL")
        }
        
        // Log the extracted ID for debugging
        console.log(`Extracted movie ID ${movieId} from slug: ${slug}`);
        
        // 1. Fetch movie details
        const movieResponse = await axios.get(API_ENDPOINTS.MOVIES.DETAIL(movieId))
        setMovie(movieResponse.data)
        
        // 2. If we're watching a TV show with episodes, fetch all episodes
        if (movieResponse.data.totalEpisodes > 1) {
          const episodesResponse = await axios.get(API_ENDPOINTS.EPISODES.LIST_BY_MOVIE(movieId))
          
          // Ensure we have a valid episode array
          if (Array.isArray(episodesResponse.data)) {
            setAllEpisodes(episodesResponse.data)
            
            // 3. If an episode ID was specified, fetch that specific episode
            if (episodeId) {
              try {
                const episodeResponse = await axios.get(API_ENDPOINTS.EPISODES.DETAIL(episodeId))
                setEpisode(episodeResponse.data)
                
                // Find prev and next episodes
                const currentIndex = episodesResponse.data.findIndex((ep: Episode) => ep.id.toString() === episodeId)
                
                if (currentIndex > 0) {
                  setPrevEpisode(episodesResponse.data[currentIndex - 1])
                }
                
                if (currentIndex < episodesResponse.data.length - 1) {
                  setNextEpisode(episodesResponse.data[currentIndex + 1])
                }
                
                // Increment view count for the episode
                try {
                  await axios.post(API_ENDPOINTS.VIEWS.INCREMENT_EPISODE(episodeId), {
                    movieId: movieId,
                    progress: 0,
                    duration: episodeResponse.data.duration || 0
                  })
                } catch (viewErr) {
                  console.error('Error incrementing episode view count:', viewErr)
                }
              } catch (episodeErr) {
                console.error('Error fetching episode:', episodeErr);
                // If episode fetch fails, default to first episode
                if (episodesResponse.data.length > 0) {
                  setEpisode(episodesResponse.data[0]);
                  if (episodesResponse.data.length > 1) {
                    setNextEpisode(episodesResponse.data[1]);
                  }
                }
              }
            } else {
              // If no episode is specified but it's a TV show, default to first episode
              if (episodesResponse.data.length > 0) {
                setEpisode(episodesResponse.data[0])
                setNextEpisode(episodesResponse.data.length > 1 ? episodesResponse.data[1] : null)
              }
            }
          } else {
            console.error("Invalid episodes data format:", episodesResponse.data);
            setAllEpisodes([]);
          }
        } else {
          // For movies, increment movie view count
          try {
            await axios.post(API_ENDPOINTS.VIEWS.INCREMENT_MOVIE(movieId), {
              progress: 0,
              duration: movieResponse.data.duration || 0
            })
          } catch (viewErr) {
            console.error('Error incrementing movie view count:', viewErr)
          }
        }
      } catch (err) {
        console.error('Error fetching data for watch page:', err)
        setError('Đã xảy ra lỗi khi tải thông tin phim')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (slug) {
      fetchData()
    }
  }, [slug, episodeId])

  // Handle view tracking for VideoPlayer component
  const handleProgress = (progress: number) => {
    if (Math.abs(progress - currentProgress) >= 5) {
      setCurrentProgress(progress)
      
      // Update view progress in backend
      if (episode) {
        axios.post(API_ENDPOINTS.VIEWS.INCREMENT_EPISODE(episode.id), {
          movieId: movie?.id,
          progress: progress,
          duration: episode.duration || 0
        }).catch(err => console.error('Error updating episode progress:', err))
      } else if (movie) {
        axios.post(API_ENDPOINTS.VIEWS.INCREMENT_MOVIE(movie.id), {
          progress: progress,
          duration: movie.duration || 0
        }).catch(err => console.error('Error updating movie progress:', err))
      }
    }
  }

  if (isLoading) {
    return (
      <div className="h-[70vh] bg-gray-800 animate-pulse flex items-center justify-center">
        <Skeleton className="w-3/4 h-[80%] max-w-7xl mx-auto rounded-xl" />
      </div>
    )
  }

  if (error || !movie) {
    return <NotFoundMessage 
      message="Không thể tải nội dung" 
      description={error || 'Đã xảy ra lỗi khi tải nội dung phim'} 
    />
  }

  // Check if we're watching a movie or an episode
  const isEpisode = !!episode;
  const isMovie = !isEpisode;

  // Determine video source and poster
  const videoSrc = episode ? episode.playlistUrl : movie.playlistUrl
  const videoPoster = episode?.thumbnailUrl || movie.posterUrl || "/placeholder.svg"
  
  // Determine if we should use test video (if no videoSrc is available)
  const useTestVideo = !videoSrc;
  
  // Check if video is HLS format (ends with .m3u8)
  const isHLS = videoSrc ? videoSrc.toLowerCase().includes('.m3u8') : true;
  
  // Prepare video title
  const videoTitle = isMovie 
    ? movie.title 
    : `${movie.title} - Tập ${episode?.episodeNumber || '?'}: ${episode?.title || 'Không có tiêu đề'}`;

  return (
    <div className="bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="pt-6 space-y-6">
          {/* Video Player Section */}
          <div className="w-full">
            <div ref={videoContainerRef} className="w-full overflow-hidden rounded-lg shadow-xl relative">
              {/* Episode List Button for Desktop */}
              <div className="absolute top-4 right-4 z-30 hidden sm:flex gap-2">
                <button
                  onClick={() => setShowEpisodeList(!showEpisodeList)}
                  className="bg-black/60 border border-white/20 text-white hover:bg-black/80 rounded-md p-1.5"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Mobile episode panel (for series only) */}
              {isEpisode && allEpisodes.length > 0 && (
                <MobileEpisodeSheet
                  episodes={allEpisodes}
                  currentEpisode={episode}
                  movieId={String(movie.id)}
                  movieTitle={movie.title}
                  episodeView={episodeView}
                  setEpisodeView={setEpisodeView}
                />
              )}

              {/* Video Player */}
              {isEpisode && episode ? (
                <VideoPlayer
                  src={videoSrc}
                  poster={videoPoster}
                  title={videoTitle}
                  initialTime={currentProgress}
                  onTimeUpdate={(time) => handleProgress(Math.floor(time))}
                  isHLS={true}
                  autoPlay={true}
                  useCustomControls={true}
                  useTestVideo={!videoSrc}
                  episodeInfo={{
                    ...episode,
                    prevEpisode: prevEpisode ? {
                      id: prevEpisode.id,
                      title: prevEpisode.title,
                      episodeNumber: prevEpisode.episodeNumber,
                    } : null,
                    nextEpisode: nextEpisode ? {
                      id: nextEpisode.id,
                      title: nextEpisode.title,
                      episodeNumber: nextEpisode.episodeNumber,
                    } : null,
                  }}
                  onEnded={() => {
                    if (nextEpisode) {
                      const nextEpisodeUrl = generateWatchUrl(
                        movie.id, 
                        movie.title, 
                        nextEpisode.id, 
                        nextEpisode.episodeNumber
                      );
                      router.push(nextEpisodeUrl);
                    }
                  }}
                  videoUrl={videoSrc}
                />
              ) : (
                /* Nếu là phim lẻ, ta cần tạo một EpisodeWithNavigation từ thông tin movie */
                <VideoPlayer
                  src={videoSrc}
                  poster={videoPoster}
                  title={videoTitle}
                  initialTime={currentProgress}
                  onTimeUpdate={(time) => handleProgress(Math.floor(time))}
                  isHLS={true}
                  autoPlay={true}
                  useCustomControls={true}
                  useTestVideo={!videoSrc}
                  episodeInfo={{
                    id: movie.id,
                    movieId: movie.id,
                    title: movie.title,
                    description: movie.summary || '',
                    duration: movie.duration || 0,
                    episodeNumber: 1,
                    playlistUrl: movie.playlistUrl || videoSrc,
                    thumbnailUrl: movie.posterUrl || '',
                    isProcessed: true,
                    processingError: null,
                    views: movie.views || 0,
                    createdAt: movie.createdAt || '',
                    updatedAt: movie.updatedAt || '',
                    prevEpisode: null,
                    nextEpisode: null,
                  }}
                  onEnded={() => {
                    // Không cần xử lý gì thêm khi phim kết thúc
                  }}
                  videoUrl={videoSrc}
                />
              )}

              {/* Desktop Episode Panel (for series only) */}
              {isEpisode && allEpisodes.length > 0 && (
                <DesktopEpisodePanel
                  episodes={allEpisodes}
                  currentEpisode={episode}
                  movieId={String(movie.id)}
                  movieTitle={movie.title}
                  showEpisodeList={showEpisodeList}
                  setShowEpisodeList={setShowEpisodeList}
                />
              )}

              {/* Overlay to close the episode list */}
              {showEpisodeList && (
                <div
                  className="absolute top-0 left-0 bg-black/30 z-30 hidden sm:block"
                  style={{ width: 'calc(100% - 300px)', height: '100%' }}
                  onClick={() => setShowEpisodeList(false)}
                />
              )}
            </div>
          </div>

          {/* Content below the Video */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Content Information */}
              <ContentInfoCard
                movie={movie}
                currentEpisode={episode}
                prevEpisode={prevEpisode}
                nextEpisode={nextEpisode}
                isMovie={isMovie}
                episodeListResponse={{ episodes: allEpisodes }}
                setShowEpisodeList={setShowEpisodeList}
              />

              {/* Comments Section */}
              <CommentSection movieId={String(movie.id)} />
            </div>

            {/* Sidebar - Right Side */}
            <div className="space-y-6">
              {/* Related Movies */}
              <RelatedMovies movie={movie} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}