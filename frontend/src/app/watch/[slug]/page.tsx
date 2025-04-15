'use client'

import { useState, useRef } from 'react';
import VideoPlayer from '@/components/ui/VideoPlayer';
import { mockMovies } from '@/mocks';
import { getEpisodeListResponse } from '@/mocks/episodes';
import { createSlug } from '@/utils/url';

// UI Components
import { Button } from '@/components/ui/button';

// Import components from features/watch
import NotFoundMessage from '@/components/features/watch/NotFoundMessage';
import MobileEpisodeSheet from '@/components/features/watch/MobileEpisodeSheet';
import ContentInfoCard from '@/components/features/watch/ContentInfoCard';
import CommentsSection from '@/components/features/watch/CommentsSection';
import RelatedMovies from '@/components/features/watch/RelatedMovies';
import DesktopEpisodePanel from '@/components/features/watch/DesktopEpisodePanel';


interface WatchPageProps {
  params: {
    slug: string; // ten-phim
  };
  searchParams: {
    episode?: string; // id tập phim, vd: episode-3-1
    ep?: string; // số tập, vd: 1
  };
}

export default function WatchPage({ params, searchParams }: WatchPageProps) {
  // UI control states
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [episodeView, setEpisodeView] = useState<'grid' | 'list'>('grid');

  // Get data from URL parameters
  const movieTitle = params.slug;
  const episodeId = searchParams.episode;
  const episodeNumber = searchParams.ep ? parseInt(searchParams.ep) : undefined;

  console.log("Movie title slug:", movieTitle);
  console.log("Episode ID:", episodeId);
  console.log("Episode number:", episodeNumber);

  // Find the movie by slug
  const movie = mockMovies.find(m => createSlug(m.title) === movieTitle);

  if (!movie) {
    return <NotFoundMessage message="Không tìm thấy phim" description="Phim bạn đang tìm không tồn tại hoặc đã bị xóa." />;
  }

  // Check if we're watching a movie or an episode
  const isEpisode = !!episodeId;
  const isMovie = !isEpisode;

  // Get episodes for this movie
  const episodeListResponse = getEpisodeListResponse(movie.id);

  // If we're watching an episode, find the episode
  let currentEpisode = null;
  if (isEpisode) {
    currentEpisode = episodeListResponse.episodes.find(ep => ep.id === episodeId);

    if (!currentEpisode) {
      return <NotFoundMessage message="Không tìm thấy tập phim" description="Tập phim bạn đang tìm không tồn tại hoặc đã bị xóa." />;
    }
  }

  // Find previous and next episodes (only for episodes)
  let prevEpisode = null;
  let nextEpisode = null;

  if (isEpisode && currentEpisode) {
    const currentIndex = episodeListResponse.episodes.findIndex(ep => ep.id === episodeId);
    prevEpisode = currentIndex > 0 ? episodeListResponse.episodes[currentIndex - 1] : null;
    nextEpisode = currentIndex < episodeListResponse.episodes.length - 1
      ? episodeListResponse.episodes[currentIndex + 1]
      : null;
  }

  // Datos simulados
  const seasons = [1, 2, 3, 4].map(num => ({ id: num, name: `Phần ${num}` }));

  return (
    <div className="bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="pt-6 space-y-6">
          {/*Video Player Section */}
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
              {!isMovie && episodeListResponse.episodes.length > 0 && (
                <MobileEpisodeSheet
                  episodes={episodeListResponse.episodes}
                  currentEpisode={currentEpisode}
                  currentSeason={currentSeason}
                  setCurrentSeason={setCurrentSeason}
                  seasons={seasons}
                  movieId={movie.id}
                  movieTitle={movie.title}
                  episodeView={episodeView}
                  setEpisodeView={setEpisodeView}
                />
              )}

              {/* Video Player */}
              <VideoPlayer
                src={isMovie ? (movie as any).videoUrl || 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4' : (currentEpisode as any).videoUrl || 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'}
                poster={isMovie ? movie.posterUrl : `https://picsum.photos/seed/${(currentEpisode as any)?.id || 'default'}/800/450`}
                title={isMovie ? movie.title : `${movie.title} - Tập ${(currentEpisode as any)?.episodeNumber || '?'}: ${(currentEpisode as any)?.title || 'Không có tiêu đề'}`}
                episodeInfo={isEpisode && currentEpisode ? {
                  id: currentEpisode.id,
                  title: currentEpisode.title,
                  number: currentEpisode.episodeNumber,
                  prevEpisode: prevEpisode ? {
                    id: prevEpisode.id,
                    number: prevEpisode.episodeNumber,
                    title: prevEpisode.title
                  } : null,
                  nextEpisode: nextEpisode ? {
                    id: nextEpisode.id,
                    number: nextEpisode.episodeNumber,
                    title: nextEpisode.title
                  } : null,
                  movieId: movie.id,
                  movieTitle: movie.title,
                } : undefined}
                controls={true}
                autoPlay={false}
              />

              {/* Desktop Episode Panel (for series only) */}
              {!isMovie && episodeListResponse.episodes.length > 0 && (
                <DesktopEpisodePanel
                  episodes={episodeListResponse.episodes}
                  currentEpisode={currentEpisode}
                  movieId={movie.id}
                  movieTitle={movie.title}
                  showEpisodeList={showEpisodeList}
                  setShowEpisodeList={setShowEpisodeList}
                  currentSeason={currentSeason}
                  setCurrentSeason={setCurrentSeason}
                  seasons={seasons}
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
                currentEpisode={currentEpisode}
                prevEpisode={prevEpisode}
                nextEpisode={nextEpisode}
                isMovie={isMovie}
                episodeListResponse={episodeListResponse}
                setShowEpisodeList={setShowEpisodeList}
              />

              {/* Comments Section */}
              <CommentsSection />
            </div>

            {/* Sidebar - Right Side */}
            <div className="space-y-6">
              {/* Películas Relacionadas */}
              <RelatedMovies relatedMovies={mockMovies.slice(0, 5)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}