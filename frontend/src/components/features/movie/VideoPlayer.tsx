'use client'
import { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import type { Level, ErrorData } from 'hls.js';
import { EpisodeWithNavigation } from '@/types/episode';
import { VideoPlayerProps } from '@/types/media';
import { cn } from '@/lib/utils';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Maximize, Minimize, Settings, Subtitles, Loader2
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

// Thêm video test mẫu
const TEST_HLS_STREAM = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"; // Phim Big Buck Bunny của Mux
const TEST_MP4_VIDEO = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"; // Nếu HLS không được hỗ trợ
const TEST_POSTER = "https://peach.blender.org/wp-content/uploads/bbb-splash.png";

// Hàm throttle để giới hạn số lần gọi của một function
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastResult: ReturnType<T>;
  
  return function(this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
      func.apply(this, args);
    }
  };
}


const VideoPlayer = ({ 
  videoUrl, 
  src,
  title, 
  poster,
  onTimeUpdate,
  initialTime = 0,
  episodeInfo,
  isHLS = true, // Mặc định là HLS từ backend
  useTestVideo = false,
  useCustomControls = false,
  autoPlay = false,
  onEnded,
  thumbnailUrl
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isTestVideo, setIsTestVideo] = useState(false);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  const [availableQualities, setAvailableQualities] = useState<Level[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 là auto
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  // Tạo throttled onTimeUpdate callback - chỉ gọi tối đa mỗi 500ms
  const throttledTimeUpdate = useCallback(
    throttle((time: number) => {
      onTimeUpdate?.(time);
    }, 500),
    [onTimeUpdate]
  );

  // Khởi tạo video player
  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    video.currentTime = initialTime;
    
    const handleDurationChange = () => {
      setDuration(video.duration);
    };
    
    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      setCurrentTime(currentTime);
      throttledTimeUpdate(currentTime);
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleEnded = () => {
      if (onEnded) onEnded();
    };
    
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('ended', handleEnded);
    };
  }, [initialTime, throttledTimeUpdate, onEnded]);
  
  // HLS setup
  useEffect(() => {
    if (!videoRef.current) return;
    
    // Trước khi tạo instance HLS mới, hủy instance cũ nếu có
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Xác định video source, ưu tiên: prop src > prop videoUrl > episodeInfo.playlistUrl > test video nếu được kích hoạt
    const shouldUseTestVideo = useTestVideo || (!src && !videoUrl && !episodeInfo?.playlistUrl);
    const videoSrc = shouldUseTestVideo ? 
      TEST_HLS_STREAM : 
      (src || videoUrl || episodeInfo?.playlistUrl || '');
    
    // Cập nhật trạng thái video test
    setIsTestVideo(shouldUseTestVideo);
    setVideoTitle(isTestVideo 
      ? "Video Test: Big Buck Bunny (Blender Foundation)" 
      : title || episodeInfo?.title || null);
    
    // Nếu không phải là URL HLS, dùng video thông thường
    if (!isHLS && !videoSrc.includes('.m3u8')) {
      videoRef.current.src = shouldUseTestVideo ? TEST_MP4_VIDEO : videoSrc;
      return;
    }
    
    // Kiểm tra nếu trình duyệt hỗ trợ natively HLS (Safari)
    if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = videoSrc;
    } else if (Hls.isSupported()) {
      // Dùng hls.js cho các trình duyệt không hỗ trợ HLS natively
      const hls = new Hls({
        // Cấu hình buffer tối ưu để giảm giật
        maxBufferSize: 0, // Không giới hạn buffer size
        maxBufferLength: 90, // Tăng buffer length lên 60s (từ 30s)
        maxMaxBufferLength: 600, // Giữ nguyên max buffer
        initialLiveManifestSize: 5, // Preload nhiều hơn trước khi bắt đầu
        manifestLoadingTimeOut: 20000, // Tăng timeout cho mạng chậm
        manifestLoadingMaxRetry: 4, // Tăng số lần retry khi load manifest
        fragLoadingTimeOut: 20000, // Tăng timeout cho fragment loading
        fragLoadingMaxRetry: 4, // Tăng số lần retry khi load fragments
        
        // Tối ưu cho live streams (nếu có)
        liveSyncDurationCount: 3, // Số lượng fragments để đồng bộ
        liveMaxLatencyDurationCount: 10, // Max độ trễ chấp nhận được
        
        // Tối ưu hiệu suất
        backBufferLength: 60, // Giảm từ 90 để tiết kiệm RAM
        enableWorker: true, // Sử dụng web worker
        
        // ABR (Adaptive Bitrate) configuration
        startLevel: -1, // Auto quality by default (-1)
        abrEwmaDefaultEstimate: 500000, // Bandwidth estimate mặc định (500kbps)
        
        // Đảm bảo xử lý lỗi tốt
        appendErrorMaxRetry: 5, // Tăng số lần retry
        debug: false
      });
      
      hls.attachMedia(videoRef.current);
      hls.loadSource(videoSrc);
      
      // Cải thiện xử lý sự kiện manifest được parse
      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        console.log("HLS manifest parsed, levels:", data.levels.length);
        
        // Lưu danh sách chất lượng
        setAvailableQualities(data.levels);
        
        // Auto-play nếu được yêu cầu
        if (autoPlay) {
          videoRef.current?.play().catch(e => console.warn('Auto-play bị hạn chế:', e));
        }
      });

      // Theo dõi chuyển đổi chất lượng để debug và UI
      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        console.log(`HLS switched to quality level ${data.level}`);
        setCurrentQuality(data.level);
      });
      
      // Xử lý lỗi
      hls.on(Hls.Events.ERROR, (_event, data: ErrorData) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Lỗi mạng, đang thử kết nối lại...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Lỗi media, đang thử phục hồi...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Lỗi fatal không thể phục hồi:', data);
              const unrecoverableErrorTypes = [
                Hls.ErrorTypes.KEY_SYSTEM_ERROR,
                Hls.ErrorTypes.MUX_ERROR,
                Hls.ErrorTypes.OTHER_ERROR
              ];
              if (unrecoverableErrorTypes.includes(data.type)) {
                setIsError(true);
              }
              hls.destroy();
              break;
          }
        }
      });
      
      // Lưu instance hls vào ref để cleanup và cho phép thay đổi chất lượng
      hlsRef.current = hls;
    }
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, videoUrl, isHLS, useTestVideo, title, isTestVideo, autoPlay, episodeInfo]);

  // Các hàm điều khiển video cho custom controls
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    
    if (newVolume === 0) {
      video.muted = true;
    } else if (video.muted) {
      video.muted = false;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const seekTime = parseFloat(e.target.value);
    video.currentTime = seekTime;
  };

  const changeQuality = (level: number) => {
    if (!hlsRef.current) return;
    
    hlsRef.current.currentLevel = level;
    setCurrentQuality(level);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Thêm các hàm cho tua tiến và lùi
  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(0, video.currentTime - 10);
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Không thể vào chế độ toàn màn hình: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Lắng nghe sự kiện thay đổi trạng thái toàn màn hình
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Thêm xử lý phím tắt
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Kiểm tra nếu đang focus vào input hoặc textarea thì không xử lý phím tắt
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'j':
          e.preventDefault();
          skipBackward();
          break;
        case 'l':
          e.preventDefault();
          skipForward();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowright':
          e.preventDefault();
          skipForward();
          break;
        case 'arrowleft':
          e.preventDefault();
          skipBackward();
          break;
        default:
          break;
      }
    };

    // Chỉ thêm sự kiện khi component VideoPlayer được focus
    const containerElement = containerRef.current;
    if (containerElement) {
      containerElement.addEventListener('keydown', handleKeyDown);
      
      // Đảm bảo container có thể nhận focus
      if (!containerElement.hasAttribute('tabindex')) {
        containerElement.setAttribute('tabindex', '0');
      }
    }

    // Thêm event listener cho document nếu đang ở chế độ toàn màn hình
    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (containerElement) {
        containerElement.removeEventListener('keydown', handleKeyDown);
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, isFullscreen]);

  // Thêm useEffect để phát hiện thiết bị iOS khi component mount
  useEffect(() => {
    // Phát hiện iOS
    const checkIsIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    };
    
    setIsIOS(checkIsIOS());
  }, []);

  return (
    <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {/* Video với native hoặc custom controls */}
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
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 py-6 transition-all duration-300 opacity-0 hover:opacity-100 group-hover:opacity-100">
          {/* Buffering indicator */}
          {isBuffering && (
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
              onChange={(e) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = parseFloat(e.target.value);
                }
              }}
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
                    onChange={(e) => {
                      const newVolume = parseFloat(e.target.value);
                      if (videoRef.current) {
                        videoRef.current.volume = newVolume;
                        if (newVolume === 0) {
                          videoRef.current.muted = true;
                        } else if (videoRef.current.muted) {
                          videoRef.current.muted = false;
                        }
                      }
                    }}
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