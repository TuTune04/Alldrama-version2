'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'

import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { Movie, Episode } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import VideoPlayer from '@/components/features/movie/VideoPlayer'
import NotFoundMessage from '@/components/features/watch/NotFoundMessage'
import MobileEpisodeSheet from '@/components/features/watch/MobileEpisodeSheet'
import DesktopEpisodePanel from '@/components/features/watch/DesktopEpisodePanel'
import ContentInfoCard from '@/components/features/watch/ContentInfoCard'
import CommentSection from '@/components/features/movie/CommentSection'
import RelatedMovies from '@/components/features/watch/RelatedMovies'
import { generateWatchUrl } from '@/utils/url'

// Extend base types to include subtitles
interface MovieWithSubtitles extends Movie {
  subtitles?: Array<{
    src: string;
    label: string;
    lang: string;
    default?: boolean;
  }>;
}

interface EpisodeWithSubtitles extends Episode {
  subtitles?: Array<{
    src: string;
    label: string;
    lang: string;
    default?: boolean;
  }>;
}

export default function WatchPage() {
  /* ----------------- URL params ----------------- */
  const { slug }      = useParams<{ slug: string }>()
  const searchParams  = useSearchParams()
  const router        = useRouter()

  const episodeId = searchParams.get('episode')      // ?episode=123
  /* ----------------- local state ----------------- */
  const [movie,  setMovie]  = useState<MovieWithSubtitles | null>(null)
  const [eps,    setEps]    = useState<EpisodeWithSubtitles[]>([])
  const [ep,     setEp]     = useState<EpisodeWithSubtitles | null>(null)
  const [nextEp, setNextEp] = useState<EpisodeWithSubtitles | null>(null)
  const [prevEp, setPrevEp] = useState<EpisodeWithSubtitles | null>(null)

  const [loading, setLoading] = useState(true)
  const [err,     setErr]     = useState<string | null>(null)

  /* ----------------- UI control ----------------- */
  const [showPanel, setShowPanel]   = useState(false)
  const [viewMode,  setViewMode]    = useState<'grid' | 'list'>('grid')

  /* ----------------- fetch data ----------------- */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setErr(null)

        /* id trong slug ở cuối: phim-hay-123  -> 123 */
        const movieId = slug.split('-').pop()
        if (!movieId || isNaN(+movieId)) throw new Error('invalid id')

        /* movie */
        const { data: m } = await axios.get(API_ENDPOINTS.MOVIES.DETAIL(movieId))
        setMovie(m)

        /* lấy danh sách tập (nếu có) */
        if (m.totalEpisodes > 0) {
          const { data: list } = await axios.get(API_ENDPOINTS.EPISODES.LIST_BY_MOVIE(movieId))
          setEps(list)

          // xác định tập hiện tại
          let current = list[0]
          if (episodeId) {
            const found = list.find((e: EpisodeWithSubtitles) => String(e.id) === episodeId)
            if (found) current = found
          }
          setEp(current)

          const idx = list.findIndex((e: EpisodeWithSubtitles) => e.id === current.id)
          setPrevEp(idx > 0 ? list[idx - 1] : null)
          setNextEp(idx < list.length - 1 ? list[idx + 1] : null)
        }
      } catch (e) {
        console.error(e)
        setErr('Đã xảy ra lỗi khi tải nội dung')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, episodeId])

  /* ----------------- loading / error ----------------- */
  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <Skeleton className="w-3/4 h-[80%] max-w-7xl rounded-xl" />
      </div>
    )
  }
  if (err || !movie) {
    return <NotFoundMessage message="Không thể tải nội dung" description={err || ''} />
  }

  /* ----------------- derived ----------------- */
  const isSeries   = Boolean(ep)
  const videoSrc   = isSeries ? ep!.playlistUrl : movie.playlistUrl
  const posterSrc  = (isSeries ? ep!.thumbnailUrl : movie.posterUrl) || '/placeholder.svg'
  const title      = isSeries
    ? `${movie.title} - Tập ${ep!.episodeNumber}: ${ep!.title}`
    : movie.title
  
  // Get subtitles with proper types
  const subtitles = isSeries 
    ? (ep!.subtitles || [])
    : (movie.subtitles || [])

  /* ----------------- render ----------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6">
        {/* ---------- player box ---------- */}
        <div className="relative">
          {/* Mở panel tập (desktop) */}
          {isSeries && (
            <button
              onClick={() => setShowPanel(!showPanel)}
              className="absolute top-4 right-4 z-30 hidden sm:block bg-black/60 text-white p-2 rounded hover:bg-black/80"
            >
              ☰
            </button>
          )}

          {/* Sheet mobile */}
          {isSeries && (
            <MobileEpisodeSheet
              episodes={eps}
              currentEpisode={ep!}
              movieId={String(movie.id)}
              movieTitle={movie.title}
              episodeView={viewMode}
              setEpisodeView={setViewMode}
            />
          )}

          {/* player */}
          <VideoPlayer
            src={videoSrc}
            poster={posterSrc}
            title={title}
            autoPlay={true}
            useCustomControls={true}
            useTestVideo={!videoSrc}
            subtitles={subtitles}
            initialTime={0}
            isHLS={true}
            onTimeUpdate={(time) => {
              // Optional time update handling
              console.log("Current time:", time);
            }}
            onEnded={() => {
              if (nextEp) {
                router.push(
                  generateWatchUrl(movie.id, movie.title, nextEp.id, nextEp.episodeNumber)
                )
              }
            }}
          />

          {/* Panel desktop */}
          {isSeries && (
            <DesktopEpisodePanel
              episodes={eps}
              currentEpisode={ep!}
              movieId={String(movie.id)}
              movieTitle={movie.title}
              showEpisodeList={showPanel}
              setShowEpisodeList={setShowPanel}
            />
          )}

          {showPanel && (
            <div
              className="absolute inset-0 bg-black/40 hidden sm:block z-20"
              onClick={() => setShowPanel(false)}
            />
          )}
        </div>

        {/* ---------- thông tin + bình luận ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ContentInfoCard
              movie={movie}
              currentEpisode={ep ?? undefined}
              prevEpisode={prevEp ?? undefined}
              nextEpisode={nextEp ?? undefined}
              isMovie={!isSeries}
              episodeListResponse={{ episodes: eps }}
              setShowEpisodeList={setShowPanel}
            />

            <CommentSection movieId={String(movie.id)} />
          </div>

          <div className="space-y-6">
            <RelatedMovies movie={movie} />
          </div>
        </div>
      </div>
    </div>
  )
}
