'use client'
import { useRef, useEffect, useState, useCallback } from 'react';
import { EpisodeWithNavigation } from '@/types/episode';
import { VideoPlayerProps } from '@/types/media';
import { cn } from '@/lib/utils';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Maximize, Minimize, Settings, Loader2
} from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useVideoControls from '@/hooks/useVideoControls';
import useHLSPlayer from '@/hooks/useHLSPlayer';

// Thêm video test mẫu
const TEST_POSTER = "https://peach.blender.org/wp-content/uploads/bbb-splash.png";

const VideoPlayer = ({ 
  videoUrl, 
  src,
  title, 
  poster,
  onTimeUpdate,
  initialTime = 0,
  episodeInfo,
  isHLS = true,
  useTestVideo = false,
  useCustomControls = false,
  autoPlay = false,
  onEnded,
  thumbnailUrl
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isIOS, setIsIOS] = useState(false);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  
  // Use the video hooks to manage state and functionality
  const {
    isPlaying,
    currentTime,
    duration,
    isBuffering,
    isVisibleBuffering,
    isTestVideo,
    isError,
    availableQualities,
    currentQuality,
    volume,
    isMuted,
    togglePlay,
    handleTimeUpdate,
    handleSeek,
    skipBackward,
    skipForward,
    toggleMute,
    handleVolumeChange,
    changeQuality
  } = useHLSPlayer({
    videoRef: videoRef as React.RefObject<HTMLVideoElement>,
    src,
    videoUrl,
    playlistUrl: episodeInfo?.playlistUrl,
    isHLS,
    useTestVideo,
    autoPlay,
    initialTime,
    onTimeUpdate,
    onError: undefined
  });

  const {
    isFullscreen,
    formatTime,
    toggleFullscreen
  } = useVideoControls({
    videoRef: videoRef as React.RefObject<HTMLVideoElement>,
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    duration
  });

  // Set video title
  useEffect(() => {
    setVideoTitle(isTestVideo 
      ? "Video Test: Big Buck Bunny (Blender Foundation)" 
      : title || episodeInfo?.title || null);
  }, [isTestVideo, title, episodeInfo?.title]);
    
  // Add onEnded event handler
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleEnded = () => {
      if (onEnded) onEnded();
    };
    
    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [onEnded]);

  // Detect iOS devices
  useEffect(() => {
    const checkIsIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    };
    
    setIsIOS(checkIsIOS());
  }, []);
  
  return (
    <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {/* Video with native or custom controls */}
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={isTestVideo ? TEST_POSTER : (poster || episodeInfo?.thumbnailUrl || '')}
        controls={isIOS || !useCustomControls}
        playsInline
        preload="auto"
        title={videoTitle || undefined}
        onClick={!isIOS && useCustomControls ? togglePlay : undefined}
      />
      
      {/* Video Test badge */}
      {isTestVideo && (
        <div className="absolute top-0 right-0 bg-yellow-500 text-black px-2 py-1 text-xs font-medium m-2 rounded z-30">
          Video Test
        </div>
      )}
      
      {/* Hiển thị lỗi nếu có */}
      {isError && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
          <p className="mb-2">Không thể phát video.</p>
          <button onClick={() => location.reload()} className="bg-red-500 px-4 py-2 rounded">
            Thử lại
        </button>
        </div>
      )}
      
      {/* Custom Controls - hiển thị khi useCustomControls = true và không phải là iOS */}
      {useCustomControls && !isIOS && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 py-6">
          {/* Buffering indicator */}
          {isVisibleBuffering && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 className="w-16 h-16 text-white animate-spin opacity-80" />
            </div>
          )}
          
          {/* Progress bar */}
          <div className="w-full mb-4">
          <input
            type="range"
            value={currentTime}
              min={0}
              max={duration || 100}
              step={0.1}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500"
              style={{
                backgroundImage: `linear-gradient(to right, #f59e0b ${(currentTime / (duration || 1)) * 100}%, #4b5563 ${(currentTime / (duration || 1)) * 100}%)`,
              }}
            />
          </div>
          
          {/* Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {/* Play/Pause */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
              onClick={togglePlay}
                      className="text-white hover:text-amber-500 transition-colors"
                      aria-label={isPlaying ? "Tạm dừng" : "Phát"}
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isPlaying ? "Tạm dừng (Space/K)" : "Phát (Space/K)"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Skip backward 10s */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={skipBackward}
                      className="text-white hover:text-amber-500 transition-colors"
                      aria-label="Lùi 10 giây"
                    >
                      <SkipBack className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Lùi 10 giây (J/←)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Skip forward 10s */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={skipForward}
                      className="text-white hover:text-amber-500 transition-colors"
                      aria-label="Tiến 10 giây"
                    >
                      <SkipForward className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tiến 10 giây (L/→)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Volume control + Time */}
              <div className="flex items-center space-x-2 group relative">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                onClick={toggleMute}
                        className="text-white hover:text-amber-500 transition-colors z-20"
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isMuted ? "Bật âm thanh (M)" : "Tắt âm thanh (M)"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <div className="w-0 overflow-hidden group-hover:w-20 group-focus-within:w-20 transition-all duration-300">
              <input
                type="range"
                value={isMuted ? 0 : volume}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500"
                style={{
                      backgroundImage: `linear-gradient(to right, #f59e0b ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%)`,
                }}
              />
                </div>
                
                <div className="text-white text-sm ml-2">
                <span>{formatTime(currentTime)}</span>
                <span className="mx-1">/</span>
                <span>{formatTime(duration || 0)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Chất lượng video */}
              {availableQualities.length > 0 && (
                <DropdownMenu>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-white hover:text-amber-500 transition-colors text-xs px-2 py-1 h-auto"
                          >
                            {currentQuality === -1 ? 'Auto' : `${availableQualities[currentQuality]?.height}p`}
                            <Settings className="w-4 h-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Chất lượng video</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <DropdownMenuContent>
                    <DropdownMenuItem 
                      onClick={() => changeQuality(-1)} 
                      className={cn(currentQuality === -1 && "bg-amber-500/20 text-amber-500")}
                        >
                          Tự động
                    </DropdownMenuItem>
                    {availableQualities.map((quality, index) => (
                      <DropdownMenuItem 
                        key={index} 
                            onClick={() => changeQuality(index)}
                        className={cn(currentQuality === index && "bg-amber-500/20 text-amber-500")}
                          >
                            {quality.height}p
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
            )}

            {/* Fullscreen button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
              onClick={toggleFullscreen}
                      className="text-white hover:text-amber-500 transition-colors"
                      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                      {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isFullscreen ? "Thoát toàn màn hình (F)" : "Toàn màn hình (F)"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer; 