'use client'
import { useState, useRef, useEffect } from 'react';
import { useMobile } from '@/hooks/use-mobile';
import Hls from 'hls.js';
import type { Level, ErrorData } from 'hls.js';

interface EpisodeInfo {
  id: string;
  title: string;
  number: number;
  prevEpisode: any | null;
  nextEpisode: any | null;
  movieId: string;
  movieTitle: string;
}

interface VideoPlayerProps {
  videoUrl?: string;
  src?: string;
  title?: string;
  poster?: string;
  onTimeUpdate?: (time: number) => void;
  initialTime?: number;
  episodeInfo?: EpisodeInfo;
  isHLS?: boolean;
}

const VideoPlayer = ({ 
  videoUrl, 
  src,
  title, 
  poster,
  onTimeUpdate,
  initialTime = 0,
  episodeInfo,
  isHLS = false
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qualities, setQualities] = useState<Array<{height: number, bitrate: number}>>([]);
  const [currentQuality, setCurrentQuality] = useState<number | 'auto'>('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  
  const isMobile = useMobile();
  
  const hideControlsTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  
  // Khởi tạo video player
  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    video.currentTime = initialTime;
    
    const handleDurationChange = () => {
      setDuration(video.duration);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };
    
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    
    return () => {
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [initialTime, onTimeUpdate]);
  
  // HLS setup
  useEffect(() => {
    if (!videoRef.current || !src) return;
    
    // Trước khi tạo instance HLS mới, hủy instance cũ nếu có
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    const videoSrc = src || videoUrl || '';
    
    // Nếu không phải là URL HLS, dùng video thông thường
    if (!isHLS && !videoSrc.includes('.m3u8')) {
      videoRef.current.src = videoSrc;
      return;
    }
    
    // Kiểm tra nếu trình duyệt hỗ trợ natively HLS (Safari)
    if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = videoSrc;
    } else if (Hls.isSupported()) {
      // Dùng hls.js cho các trình duyệt không hỗ trợ HLS natively
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        backBufferLength: 60,
        enableWorker: true,
        lowLatencyMode: false,
      });
      
      hls.loadSource(videoSrc);
      hls.attachMedia(videoRef.current);
      
      // Events
      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        // Lấy danh sách chất lượng có sẵn
        const availableQualities = data.levels.map((level: Level) => ({
          height: level.height,
          bitrate: level.bitrate
        }));
        setQualities(availableQualities);
        
        // Nếu có các chất lượng khác nhau và auto-play được bật
        if (availableQualities.length > 0 && !videoRef.current?.paused) {
          videoRef.current?.play();
        }
      });
      
      // Handle errors
      hls.on(Hls.Events.ERROR, (_event, data: ErrorData) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Fatal network error encountered, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Fatal media error encountered, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal error, cannot recover:', data);
              hls.destroy();
              break;
          }
        }
      });
      
      // Lưu instance hls vào ref để cleanup
      hlsRef.current = hls;
    }
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, videoUrl, isHLS]);
  
  // Ẩn controls sau một khoảng thời gian
  useEffect(() => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
        setShowQualityMenu(false);
      }, 3000);
    } else {
      setShowControls(true);
    }
    
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, [isPlaying]);
  
  // Xử lý sự kiện play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };
  
  // Xử lý sự kiện mute/unmute
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
  };
  
  // Xử lý sự kiện fullscreen
  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error(err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.error(err));
    }
  };
  
  // Xử lý thay đổi chất lượng HLS
  const changeQuality = (levelIndex: number | 'auto') => {
    if (!hlsRef.current) return;
    
    if (levelIndex === 'auto') {
      hlsRef.current.currentLevel = -1; // Auto quality
    } else {
      hlsRef.current.currentLevel = levelIndex as number;
    }
    
    setCurrentQuality(levelIndex);
    setShowQualityMenu(false);
  };
  
  // Cập nhật seekbar
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };
  
  // Cập nhật volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const vol = parseFloat(e.target.value);
    videoRef.current.volume = vol;
    videoRef.current.muted = vol === 0;
  };
  
  // Format thởi gian
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Format tên của mức chất lượng hiện tại
  const getCurrentQualityLabel = () => {
    if (currentQuality === 'auto') return 'Tự động';
    
    if (qualities.length > 0 && typeof currentQuality === 'number') {
      const quality = qualities[currentQuality];
      return quality ? `${quality.height}p` : 'Không xác định';
    }
    
    return 'Mặc định';
  };
  
  return (
    <div 
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
      onMouseMove={() => {
        setShowControls(true);
        
        if (hideControlsTimer.current) {
          clearTimeout(hideControlsTimer.current);
        }
        
        if (isPlaying) {
          hideControlsTimer.current = setTimeout(() => {
            setShowControls(false);
            setShowQualityMenu(false);
          }, 3000);
        }
      }}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster}
        onClick={togglePlay}
        playsInline
      />
      
      {/* Video title */}
      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
          <h2 className="text-white font-medium">{title}</h2>
        </div>
      )}
      
      {/* Play button overlay (hiển thị khi video đang pause) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-red-600/80 rounded-full flex items-center justify-center"
          aria-label="Play"
        >
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
      
      {/* Controls */}
      {showControls && (
        <div
          className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 z-10"
        >
          {/* Seekbar */}
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 appearance-none bg-gray-700 rounded-full outline-none mb-2 sm:mb-0 focus:ring-2 focus:ring-red-500"
            style={{ cursor: 'pointer' }}
          />

          {/* Controls Row */}
          <div className="flex flex-row items-center justify-between w-full sm:w-auto gap-4 mt-2 sm:mt-0">
            {/* Play/Pause button */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 rounded-full p-2 sm:p-0 text-2xl sm:text-base"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-8 h-8 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Volume control (show range only when hovering the icon) */}
            <div className="flex items-center space-x-1 group relative">
              <button
                onClick={toggleMute}
                className="text-white hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 rounded-full p-2 sm:p-0 text-2xl sm:text-base z-20"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <svg className="w-8 h-8 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : volume < 0.5 ? (
                  <svg className="w-8 h-8 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className={`absolute left-8 top-1/2 -translate-y-1/2 w-0 scale-x-0 opacity-0 group-hover:w-24 group-hover:scale-x-100 group-hover:opacity-100 transition-all duration-300 ease-in-out origin-left bg-red-500 rounded-full appearance-none cursor-pointer h-1 ${isMobile ? 'hidden' : 'block'} z-10`}
                style={{
                  backgroundImage: `linear-gradient(to right, #ef4444 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%)`,
                }}
              />
              <div className={`text-white text-xs sm:text-sm min-w-[60px] text-center transition-all duration-300 ease-in-out ${isMobile ? 'hidden' : 'flex'} group-hover:translate-x-28`}>
                <span>{formatTime(currentTime)}</span>
                <span className="mx-1">/</span>
                <span>{formatTime(duration || 0)}</span>
              </div>
            </div>

            {/* Quality selector - Show only for HLS streams */}
            {(isHLS || qualities.length > 0) && (
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="text-white hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 rounded-full p-2 sm:p-0 text-xs sm:text-sm flex items-center"
                >
                  <svg className="w-7 h-7 sm:w-5 sm:h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.45 12.04l-1.09.83c.34.62.54 1.33.54 2.08 0 2.36-1.91 4.27-4.27 4.27-2.36 0-4.27-1.91-4.27-4.27 0-2.36 1.91-4.27 4.27-4.27.75 0 1.46.2 2.08.54l.83-1.09c-.81-.49-1.75-.78-2.73-.78-2.95 0-5.35 2.4-5.35 5.35s2.4 5.35 5.35 5.35 5.35-2.4 5.35-5.35c0-.98-.29-1.92-.78-2.73zm-5.54 5.28c-1.32 0-2.4-1.08-2.4-2.4s1.08-2.4 2.4-2.4 2.4 1.08 2.4 2.4-1.08 2.4-2.4 2.4zM9.16 7.44c0-.62.51-1.13 1.13-1.13.63 0 1.13.51 1.13 1.13 0 .63-.5 1.13-1.13 1.13-.62 0-1.13-.5-1.13-1.13zm3.57 0c0 .62.51 1.13 1.13 1.13.63 0 1.13-.51 1.13-1.13s-.5-1.13-1.13-1.13c-.62 0-1.13.5-1.13 1.13zm3.57 0c0 .62.51 1.13 1.13 1.13.63 0 1.13-.51 1.13-1.13s-.5-1.13-1.13-1.13c-.62 0-1.13.5-1.13 1.13z" />
                  </svg>
                  <span className="hidden sm:inline-block">{getCurrentQualityLabel()}</span>
                </button>

                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 border border-gray-700 rounded-md shadow-lg overflow-hidden">
                    <ul className="py-1">
                      <li>
                        <button
                          onClick={() => changeQuality('auto')}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            currentQuality === 'auto' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          Tự động
                        </button>
                      </li>
                      {qualities.map((quality, index) => (
                        <li key={index}>
                          <button
                            onClick={() => changeQuality(index)}
                            className={`w-full text-left px-4 py-2 text-sm ${
                              currentQuality === index ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                            }`}
                          >
                            {quality.height}p
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 rounded-full p-2 sm:p-0 text-2xl sm:text-base"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <svg className="w-8 h-8 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer; 