'use client'

import { Suspense, useState, useRef, useEffect } from 'react';
import VideoPlayer from '@/components/ui/VideoPlayer';
import { mockMovies } from '@/mocks';
import { getEpisodeListResponse } from '@/mocks/episodes';
import EpisodeList from '@/components/ui/EpisodeList';
import { getIdFromSlug, getEpisodeIdFromSlug, generateEpisodeUrl } from '@/utils/url';
import { Menu, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface WatchPageProps {
  params: {
    movieSlug: string;
    episodeSlug: string;
  };
}

export default function WatchPage({ params }: WatchPageProps) {
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const episodeScrollRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [videoHeight, setVideoHeight] = useState(0);
  const [videoWidth, setVideoWidth] = useState(0);
  const [currentSeason, setCurrentSeason] = useState(1);
  
  // Calculate and update video dimensions when component mounts or window resizes
  useEffect(() => {
    const updateVideoDimensions = () => {
      if (videoContainerRef.current) {
        const height = videoContainerRef.current.offsetHeight;
        const width = videoContainerRef.current.offsetWidth;
        setVideoHeight(height);
        setVideoWidth(width);
      }
    };
    
    // Initial calculation
    updateVideoDimensions();
    
    // Update on window resize
    window.addEventListener('resize', updateVideoDimensions);
    
    return () => {
      window.removeEventListener('resize', updateVideoDimensions);
    };
  }, []);
  
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
    
  // Horizontal scroll navigation for episodes
  const scrollEpisodes = (direction: 'left' | 'right') => {
    if (!episodeScrollRef.current) return;
    
    const scrollAmount = 200; // Adjust as needed
    if (direction === 'left') {
      episodeScrollRef.current.scrollLeft -= scrollAmount;
    } else {
      episodeScrollRef.current.scrollLeft += scrollAmount;
    }
  };

  // Mock seasons data
  const seasons = [1, 2, 3, 4].map(num => ({
    id: num,
    name: `Phần ${num}`
  }));
  
  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Video Player - Full Width */}
          <Suspense fallback={<div className="w-full aspect-video bg-gray-800 animate-pulse rounded-lg"></div>}>
            <div ref={videoContainerRef} className="w-full overflow-hidden rounded-lg shadow-2xl relative">
              {/* Episode List Button - Over the video */}
              <button 
                onClick={() => setShowEpisodeList(true)}
                className="absolute top-4 right-4 z-30 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors shadow-lg"
                aria-label="Show Episode List"
              >
                <Menu size={20} />
              </button>
              
              <VideoPlayer
                src={currentEpisode.videoUrl}
                poster={movie.posterUrl}
                title={`${movie.title} - Tập ${currentEpisode.episodeNumber}: ${currentEpisode.title}`}
                episodeInfo={{
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
                  movieId,
                  movieTitle: movie.title,
                }}
              />
              
              {/* Episode Panel - Inside the video container */}
              <div 
                className={`absolute top-0 right-0 h-full z-40 backdrop-blur-md shadow-xl transition-all duration-300 ease-in-out ${
                  showEpisodeList ? 'translate-x-0 w-[300px]' : 'translate-x-full w-0 opacity-0'
                }`}
                style={{ 
                  backgroundColor: 'rgba(31, 31, 41, 0.5)',
                  borderLeft: showEpisodeList ? '1px solid rgba(93, 96, 101, 0.5)' : 'none'
                }}
              >
                <div className="h-full flex flex-col overflow-hidden">
                  {/* Header with season selector */}
                  <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                    <div className="relative">
                      <button 
                        className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-3 py-1.5 rounded text-sm transition-colors shadow-md"
                        onClick={() => {
                          // In a real app, would toggle a dropdown here
                        }}
                      >
                        <span>Phần {currentSeason}</span>
                        <ChevronDown size={16} className="ml-1.5" />
                      </button>

                      {/* Dropdown có thể thêm ở đây nếu cần */}
                      {/* <div className="absolute mt-2 w-40 bg-white/10 backdrop-blur-md border border-white/20 rounded shadow-md z-10">...</div> */}
                    </div>
                    <button 
                      onClick={() => setShowEpisodeList(false)}
                      className="text-gray-300 hover:text-white p-1"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  {/* Episode Grid */}
                  <div className="flex-1 overflow-y-auto p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {episodeListResponse.episodes.map(ep => (
                        <a 
                          key={ep.id}
                          href={generateEpisodeUrl(movieId, movie.title, ep.id)}
                          className={`block rounded overflow-hidden transition-all ${
                            ep.id === currentEpisode.id
                              ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20'
                              : 'hover:bg-white/80 shadow-sm'
                          }`}
                        >
                          <div className="aspect-video bg-gray-100 relative overflow-hidden">
                            {/* Thumbnail with episode number overlay */}
                            <img 
                              src={`https://picsum.photos/seed/${ep.id}/300/200`} 
                              alt={`Tập ${ep.episodeNumber}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                              <span className="text-white text-xs font-semibold">Tập {ep.episodeNumber}</span>
                            </div>
                            
                            {/* Duration badge */}
                            <div className="absolute top-1 right-1 bg-black/70 rounded text-xs text-white px-1">
                              {ep.duration} phút
                            </div>
                          </div>
                          
                          <div className="p-1.5">
                            <div className="line-clamp-1 text-xs">
                              <span className={ep.id === currentEpisode.id ? "text-amber-600 font-medium" : "text-gray-700"}>
                                {ep.title || `Tập ${ep.episodeNumber}`}
                              </span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Overlay to close the episode list - Covers the rest of the video */}
              {showEpisodeList && (
                <div 
                  className="absolute top-0 left-0 bg-black/30 z-30"
                  style={{ 
                    width: 'calc(100% - 300px)',
                    height: '100%'
                  }}
                  onClick={() => setShowEpisodeList(false)}
                ></div>
              )}
            </div>
          </Suspense>
          
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Main Content - Left Side */}
            <div className="w-full lg:w-[70%] space-y-4">
              {/* Movie Information */}
              <div className="bg-gray-800 rounded-lg p-4 flex">
                <div className="flex-shrink-0 w-[70px] h-[70px] mr-4">
                  <img 
                    src={movie.posterUrl} 
                    alt={movie.title} 
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl text-white font-bold">
                      {movie.title}
                    </h1>
                    <button className="text-gray-400 hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center mt-1 text-gray-400 text-sm">
                    {movie.releaseYear && <span className="mr-4">{movie.releaseYear}</span>}
                    <span className="mr-4">{currentEpisode.duration} phút</span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      {movie.rating || "8.5"}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mt-2">{movie.description}</p>
                </div>
              </div>
              
              {/* Episode Selector */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-white font-semibold mb-3">Chọn tập phim</h2>
                <div className="flex flex-wrap gap-2">
                  {episodeListResponse.episodes.slice(0, 8).map(ep => (
                    <a 
                      key={ep.id}
                      href={generateEpisodeUrl(movieId, movie.title, ep.id)} 
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        ep.id === currentEpisode.id 
                          ? 'bg-amber-500 text-black' 
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                    >
                      Tập {ep.episodeNumber}
                    </a>
                  ))}
                  {episodeListResponse.episodes.length > 8 && (
                    <button 
                      className="px-3 py-1.5 rounded text-sm font-medium bg-gray-700 text-white hover:bg-gray-600"
                      onClick={() => setShowEpisodeList(true)}
                    >
                      ...
                    </button>
                  )}
                </div>
              </div>
              
              {/* Comments Section */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-white font-semibold mb-4">Bình luận</h2>
                <div className="bg-gray-700 rounded-lg p-2 mb-4">
                  <textarea 
                    className="w-full bg-transparent border-none text-white placeholder-gray-400 resize-none focus:ring-0 focus:outline-none" 
                    placeholder="Viết bình luận..."
                    rows={3}
                  ></textarea>
                  <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center text-sm text-gray-300">
                      <input type="checkbox" className="mr-2 rounded bg-gray-600 border-gray-500" />
                      Ẩn nội dung spoil
                    </label>
                    <button className="px-4 py-1.5 bg-amber-500 text-black rounded font-medium text-sm">
                      Gửi
                    </button>
                  </div>
                </div>
                <div className="space-y-4 text-sm text-gray-300">
                  <p className="text-center text-gray-400">Chưa có bình luận nào</p>
                </div>
              </div>
            </div>
            
            {/* Sidebar - Right Side */}
            <div className="w-full lg:w-[30%] space-y-4">
              {/* Actors Section */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-white font-semibold mb-3">Diễn viên</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(index => (
                    <div key={index} className="flex items-center">
                      <div className="w-[50px] h-[50px] bg-gray-700 rounded-full overflow-hidden">
                        <img 
                          src={`https://randomuser.me/api/portraits/${index % 2 === 0 ? 'men' : 'women'}/${index + 20}.jpg`} 
                          alt={`Actor ${index}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-2">
                        <p className="text-white text-sm">Diễn viên {index}</p>
                        <p className="text-gray-400 text-xs">Vai diễn {index}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Related Movies */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-white font-semibold mb-3">Phim liên quan</h2>
                <div className="space-y-2">
                  {mockMovies.slice(0, 5).map(relatedMovie => (
                    <a 
                      key={relatedMovie.id} 
                      href={`/movie/${relatedMovie.id}-${relatedMovie.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center p-2 hover:bg-gray-700 rounded transition-colors"
                    >
                      <div className="w-[60px] h-[80px] flex-shrink-0">
                        <img 
                          src={relatedMovie.posterUrl} 
                          alt={relatedMovie.title}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-white text-sm font-medium">{relatedMovie.title}</h3>
                        <p className="text-gray-400 text-xs mt-1">{relatedMovie.releaseYear}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 