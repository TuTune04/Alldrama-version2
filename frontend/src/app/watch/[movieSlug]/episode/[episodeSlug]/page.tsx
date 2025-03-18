import { Suspense } from 'react';
import VideoPlayer from '@/components/ui/VideoPlayer';
import { mockMovies } from '@/mocks';
import { getEpisodeListResponse } from '@/mocks/episodes';
import EpisodeList from '@/components/ui/EpisodeList';
import { getIdFromSlug, getEpisodeIdFromSlug } from '@/utils/url';

interface WatchPageProps {
  params: {
    movieSlug: string;
    episodeSlug: string;
  };
}

export default async function WatchPage({ params }: WatchPageProps) {
  console.log("Movie slug received:", params.movieSlug);
  console.log("Episode slug received:", params.episodeSlug);
  
  const movieId = getIdFromSlug(params.movieSlug);
  const episodeId = getEpisodeIdFromSlug(params.episodeSlug);
  
  console.log("Extracted movieId:", movieId);
  console.log("Extracted episodeId:", episodeId);
  
  const movie = mockMovies.find(m => m.id === movieId);
  console.log("Found movie:", movie ? `${movie.id} - ${movie.title}` : "Not found");
  
  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl text-white font-bold">Không tìm thấy phim</h1>
        <p className="text-gray-400 mt-4">Phim bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
      </div>
    );
  }
  
  const episodeListResponse = getEpisodeListResponse(movieId);
  const currentEpisode = episodeListResponse.episodes.find(ep => ep.id === episodeId);
  
  console.log("Episode IDs available:", episodeListResponse.episodes.map(ep => ep.id));
  console.log("Found episode:", currentEpisode ? `${currentEpisode.id} - ${currentEpisode.title}` : "Not found");
  
  if (!currentEpisode) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl text-white font-bold">Không tìm thấy tập phim</h1>
        <p className="text-gray-400 mt-4">Tập phim bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
      </div>
    );
  }
  
  // Tìm tập trước và tập sau
  const currentIndex = episodeListResponse.episodes.findIndex(ep => ep.id === episodeId);
  const prevEpisode = currentIndex > 0 ? episodeListResponse.episodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < episodeListResponse.episodes.length - 1 
    ? episodeListResponse.episodes[currentIndex + 1] 
    : null;
    
  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        {/* Video Player */}
        <Suspense fallback={<div className="aspect-video bg-gray-800 animate-pulse rounded-lg"></div>}>
          <div className="overflow-hidden rounded-lg shadow-2xl">
            <VideoPlayer
              src={currentEpisode.videoUrl}
              poster={movie.posterUrl}
              title={`${movie.title} - Tập ${currentEpisode.episodeNumber}: ${currentEpisode.title}`}
              episodeInfo={{
                id: currentEpisode.id,
                title: currentEpisode.title,
                number: currentEpisode.episodeNumber,
                prevEpisode,
                nextEpisode,
                movieId,
                movieTitle: movie.title,
              }}
            />
          </div>
        </Suspense>
        
        {/* Thông tin tập phim */}
        <div className="mt-6">
          <h1 className="text-xl md:text-2xl text-white font-bold">
            {movie.title} - Tập {currentEpisode.episodeNumber}: {currentEpisode.title}
          </h1>
          <div className="flex items-center mt-2 text-gray-400 text-sm">
            <span className="mr-4">{currentEpisode.duration} phút</span>
            <span>{(currentEpisode.views || 0).toLocaleString()} lượt xem</span>
          </div>
        </div>
        
        {/* Mô tả phim */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg text-white font-semibold mb-2">Mô tả phim</h2>
          <p className="text-gray-300">{movie.description}</p>
        </div>
        
        {/* Danh sách tập */}
        <div className="mt-10">
          <h2 className="text-xl text-white font-bold mb-4">Danh sách tập</h2>
          <EpisodeList 
            episodes={episodeListResponse.episodes} 
            currentEpisodeId={currentEpisode.id} 
            movieId={movieId}
            movieTitle={movie.title}
          />
        </div>
      </div>
    </div>
  );
} 