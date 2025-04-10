'use client'

import { useState, useRef, useEffect } from 'react';
import VideoPlayer from '@/components/ui/VideoPlayer';
import { mockMovies } from '@/mocks';
import { getEpisodeListResponse } from '@/mocks/episodes';
import { getIdFromSlug, getEpisodeIdFromSlug, generateEpisodeUrl } from '@/utils/url';
import { Menu, X, ChevronDown, ChevronLeft, ChevronRight, Search, Star, Share2, Bookmark, Grid2X2, List } from 'lucide-react';

// Import Shadcn UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, 
  DropdownMenuItem, DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import MoviePopover from "@/components/features/movie/MoviePopover";


interface WatchPageProps {
  params: {
    movieSlug: string;
    episodeSlug: string;
  };
}

// Common style constants
const GLASS_BG = "bg-gray-800/60 border-gray-700 backdrop-blur-sm";
const BG_HOVER = "hover:bg-white/5";

export default function WatchPage({ params }: WatchPageProps) {
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [episodeView, setEpisodeView] = useState<'grid' | 'list'>('grid');
  
  const movieId = getIdFromSlug(params.movieSlug);
  const episodeId = getEpisodeIdFromSlug(params.episodeSlug);
  const movie = mockMovies.find(m => m.id === movieId);
  
  if (!movie) {
    return <NotFoundMessage message="Không tìm thấy phim" description="Phim bạn đang tìm không tồn tại hoặc đã bị xóa." />;
  }
  
  const episodeListResponse = getEpisodeListResponse(movieId);
  const currentEpisode = episodeListResponse.episodes.find(ep => ep.id === episodeId);
  
  if (!currentEpisode) {
    return <NotFoundMessage message="Không tìm thấy tập phim" description="Tập phim bạn đang tìm không tồn tại hoặc đã bị xóa." />;
  }
  
  // Find previous and next episodes
  const currentIndex = episodeListResponse.episodes.findIndex(ep => ep.id === episodeId);
  const prevEpisode = currentIndex > 0 ? episodeListResponse.episodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < episodeListResponse.episodes.length - 1 
    ? episodeListResponse.episodes[currentIndex + 1] 
    : null;
    
  // Mock data
  const seasons = [1, 2, 3, 4].map(num => ({ id: num, name: `Phần ${num}` }));
  const cast = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Diễn viên ${i + 1}`,
    role: `Vai diễn ${i + 1}`,
    avatar: `https://randomuser.me/api/portraits/${(i + 1) % 2 === 0 ? 'men' : 'women'}/${i + 21}.jpg`
  }));
    
  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="pt-6 space-y-6">
          {/* Video Player Section */}
          <div className="w-full">
            <div ref={videoContainerRef} className="w-full overflow-hidden rounded-lg shadow-xl relative">
              {/* Desktop Episode List Button */}
              <div className="absolute top-4 right-4 z-30 hidden sm:flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" size="icon"
                        onClick={() => setShowEpisodeList(!showEpisodeList)}
                        className="bg-black/60 border-white/20 text-white hover:bg-black/80"
                      >
                        <Menu size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Danh sách tập</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Mobile Episode List Button */}
              <MobileEpisodeSheet 
                episodes={episodeListResponse.episodes}
                currentEpisode={currentEpisode}
                currentSeason={currentSeason}
                setCurrentSeason={setCurrentSeason}
                seasons={seasons}
                movieId={movieId}
                movieTitle={movie.title}
                episodeView={episodeView}
                setEpisodeView={setEpisodeView}
              />
              
        {/* Video Player */}
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
              
              {/* Desktop Episode Panel */}
              <DesktopEpisodePanel 
                episodes={episodeListResponse.episodes}
                currentEpisode={currentEpisode} 
                movieId={movieId}
                movieTitle={movie.title}
                showEpisodeList={showEpisodeList}
                setShowEpisodeList={setShowEpisodeList}
                currentSeason={currentSeason}
                setCurrentSeason={setCurrentSeason}
                seasons={seasons}
              />
              
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
          
          {/* Content Below Video */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Movie Information Card */}
              <Card className={`${GLASS_BG} overflow-hidden`}>
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row p-4 gap-4">
                    {/* Movie Poster */}
                    <div className="flex-shrink-0 w-full sm:w-[150px]">
                      <div className="aspect-[2/3] rounded-md overflow-hidden bg-gray-900">
                        <img 
                          src={movie.posterUrl} 
                          alt={movie.title} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    
                    {/* Movie Details */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <h1 className="text-xl md:text-2xl text-white font-bold leading-tight">
                            {movie.title}
          </h1>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {movie.releaseYear && (
                              <Badge variant="outline" className="text-gray-300 border-gray-600">
                                {movie.releaseYear}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-gray-300 border-gray-600">
                              {currentEpisode.duration} phút
                            </Badge>
                            <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
                              <Star className="mr-1 h-3 w-3" /> {movie.rating || "8.5"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <IconButton icon={<Share2 size={18} />} tooltip="Chia sẻ" />
                          <IconButton icon={<Bookmark size={18} />} tooltip="Lưu vào danh sách" />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h2 className="text-sm font-medium text-gray-200 mb-1">Tóm tắt</h2>
                        <p className="text-gray-300 text-sm">{movie.description}</p>
                      </div>
                      
                      {/* Episode Navigation */}
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-200 mb-1">
                          Tập {currentEpisode.episodeNumber}: {currentEpisode.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          {prevEpisode && (
                            <Button 
                              variant="outline" size="sm"
                              className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
                              asChild
                            >
                              <a href={generateEpisodeUrl(movieId, movie.title, prevEpisode.id)}>
                                <ChevronLeft size={16} className="mr-1" />
                                Tập trước
                              </a>
                            </Button>
                          )}
                          
                          {nextEpisode && (
                            <Button 
                              variant="outline" size="sm"
                              className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
                              asChild
                            >
                              <a href={generateEpisodeUrl(movieId, movie.title, nextEpisode.id)}>
                                Tập sau
                                <ChevronRight size={16} className="ml-1" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div> 
                  </div>
                  
                  
                  {/* Episode Quick Select */}
                  <div className="px-4 pb-4">
                    <Separator className="my-4 bg-gray-700/50" />
                    <h3 className="text-sm font-medium text-gray-200 mb-3">Chọn tập phim</h3>
                    <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 max-w-full">
                      {episodeListResponse.episodes.slice(0, 12).map(ep => (
                        <a 
                          key={ep.id}
                          href={generateEpisodeUrl(movieId, movie.title, ep.id)} 
                          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                            ep.id === currentEpisode.id 
                              ? 'bg-amber-500 text-gray-900' 
                              : 'bg-gray-700 text-white hover:bg-gray-600'
                          }`}
                        >
                          {ep.episodeNumber}
                        </a>
                      ))}
                      
                      {episodeListResponse.episodes.length > 12 && (
                        <Button 
                          variant="ghost" size="sm"
                          className="text-white hover:bg-gray-700 px-2"
                          onClick={() => setShowEpisodeList(true)}
                        >
                          ...
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Comments Section */}
              <Card className={GLASS_BG}>
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold text-white mb-4">Bình luận</h2>
                  <div className="space-y-4">
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <textarea 
                        className="w-full bg-transparent border-none text-white placeholder-gray-400 resize-none focus:ring-0 focus:outline-none" 
                        placeholder="Viết bình luận..."
                        rows={3}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <label className="flex items-center text-sm text-gray-300">
                          <input type="checkbox" className="mr-2 rounded bg-gray-600 border-gray-500" />
                          Ẩn nội dung spoil
                        </label>
                        <Button 
                          variant="default" size="sm" 
                          className="bg-amber-500 hover:bg-amber-600 text-gray-900"
                        >
                          Gửi
                        </Button>
                      </div>
                    </div>
                    <div className="text-center text-gray-400 text-sm py-4">
                      Chưa có bình luận nào
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar - Right Side */}
            <div className="space-y-6">
              {/* Cast Section */}
              <Card className={GLASS_BG}>
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold text-white mb-4">Diễn viên</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {cast.map((actor) => (
                      <div key={actor.id} className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border border-gray-700">
                          <AvatarImage src={actor.avatar} alt={actor.name} />
                          <AvatarFallback className="bg-gray-700 text-gray-300">
                            {actor.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white text-sm font-medium">{actor.name}</p>
                          <p className="text-gray-400 text-xs">{actor.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Related Movies */}
              <Card className={GLASS_BG}>
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold text-white mb-4">Có thể bạn thích</h2>
                  <div className="space-y-3">
                    {mockMovies.slice(0, 5).map(relatedMovie => (
                      <MoviePopover 
                        key={relatedMovie.id} 
                        movie={relatedMovie}
                        size="sm"
                        variant="simple"
                        trigger={
                          <a 
                            href={`/movie/${relatedMovie.id}-${relatedMovie.title.toLowerCase().replace(/\s+/g, '-')}`}
                            className="flex items-center p-2 hover:bg-gray-700/50 rounded-md transition-colors"
                          >
                            <div className="flex-shrink-0 w-16 h-24 rounded overflow-hidden bg-gray-900">
                              <img 
                                src={relatedMovie.posterUrl}
                                alt={relatedMovie.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <h3 className="text-white text-sm font-medium truncate">{relatedMovie.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                {relatedMovie.releaseYear && (
                                  <span className="text-xs text-gray-400">{relatedMovie.releaseYear}</span>
                                )}
                                <div className="flex items-center text-xs text-amber-400">
                                  <Star className="h-3 w-3 mr-0.5" fill="currentColor" />
                                  <span>{relatedMovie.rating || "8.5"}</span>
                                </div>
                              </div>
                            </div>
                          </a>
                        }
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility Components
function NotFoundMessage({ message, description }: { message: string; description: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-2xl text-white font-bold">{message}</h1>
      <p className="text-gray-400 mt-4">{description}</p>
    </div>
  );
}

function IconButton({ icon, tooltip }: { icon: React.ReactNode; tooltip: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface EpisodeSheetProps {
  episodes: any[];
  currentEpisode: any;
  currentSeason: number;
  setCurrentSeason: (season: number) => void;
  seasons: { id: number; name: string }[];
  movieId: string;
  movieTitle: string;
  episodeView: 'grid' | 'list';
  setEpisodeView: (view: 'grid' | 'list') => void;
}

function MobileEpisodeSheet({ 
  episodes, currentEpisode, currentSeason, setCurrentSeason, 
  seasons, movieId, movieTitle, episodeView, setEpisodeView 
}: EpisodeSheetProps) {
  return (
    <div className="sm:hidden absolute top-4 right-4 z-30">
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="bg-black/60 border-white/20 text-white hover:bg-black/80"
          >
            <Menu size={18} />
          </Button>
        </SheetTrigger>
        <SheetContent className="bg-gray-900/95 backdrop-blur-md border-gray-800 text-white p-0 w-[85vw] sm:max-w-md">
          <SheetHeader className="p-4 border-b border-gray-800">
            <SheetTitle className="text-white flex items-center justify-between">
              <span>Danh sách tập</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <span>Phần {currentSeason}</span>
                    <ChevronDown size={14} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                  {seasons.map((season) => (
                    <DropdownMenuItem 
                      key={season.id}
                      className={`cursor-pointer text-sm ${currentSeason === season.id ? 'bg-white/20 text-amber-400' : 'text-white hover:bg-white/10'}`}
                      onClick={() => setCurrentSeason(season.id)}
                    >
                      {season.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SheetTitle>
          </SheetHeader>
          <div className="p-3 border-b border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Tìm tập phim..." 
                className="pl-9 bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          <div className="p-3 border-b border-gray-800 flex items-center justify-between">
            <div className="text-sm text-gray-300">
              {episodes.length} tập phim
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" size="sm"
                className={`px-2 py-1 h-8 ${episodeView === 'grid' ? 'bg-white/20 text-white' : 'text-gray-400'}`}
                onClick={() => setEpisodeView('grid')}
              >
                <Grid2X2 size={16} />
              </Button>
              <Button 
                variant="ghost" size="sm"
                className={`px-2 py-1 h-8 ${episodeView === 'list' ? 'bg-white/20 text-white' : 'text-gray-400'}`}
                onClick={() => setEpisodeView('list')}
              >
                <List size={16} />
              </Button>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[70vh]">
            {episodeView === 'grid' ? (
              <div className="grid grid-cols-2 gap-2 p-3">
                {episodes.map(ep => (
                  <a 
                    key={ep.id}
                    href={generateEpisodeUrl(movieId, movieTitle, ep.id)}
                    className={`block rounded overflow-hidden ${
                      ep.id === currentEpisode.id 
                        ? 'ring-2 ring-amber-500' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="aspect-video bg-gray-800 relative">
                      <img 
                        src={`https://picsum.photos/seed/${ep.id}/300/200`} 
                        alt={`Tập ${ep.episodeNumber}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                        <span className="text-white text-xs">Tập {ep.episodeNumber}</span>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-200 truncate">
                        {ep.title || `Tập ${ep.episodeNumber}`}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {episodes.map(ep => (
                  <a 
                    key={ep.id}
                    href={generateEpisodeUrl(movieId, movieTitle, ep.id)}
                    className={`flex items-center p-3 ${
                      ep.id === currentEpisode.id
                        ? 'bg-white/10 text-amber-400'
                        : 'hover:bg-white/5 text-white'
                    }`}
                  >
                    <Badge className="mr-3 bg-gray-700">
                      {ep.episodeNumber}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm">{ep.title || `Tập ${ep.episodeNumber}`}</p>
                      <p className="text-xs text-gray-400">{ep.duration} phút</p>
                    </div>
                    {ep.id === currentEpisode.id && (
                      <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

interface DesktopEpisodePanelProps {
  episodes: any[];
  currentEpisode: any;
  movieId: string;
  movieTitle: string;
  showEpisodeList: boolean;
  setShowEpisodeList: (show: boolean) => void;
  currentSeason: number;
  setCurrentSeason: (season: number) => void;
  seasons: { id: number; name: string }[];
}

function DesktopEpisodePanel({ 
  episodes, currentEpisode, movieId, movieTitle, 
  showEpisodeList, setShowEpisodeList, currentSeason, setCurrentSeason, seasons 
}: DesktopEpisodePanelProps) {
  return (
    <div 
      className={`absolute top-0 right-0 h-full z-40 backdrop-blur-md shadow-xl transition-all duration-300 ease-in-out hidden sm:block ${
        showEpisodeList ? 'translate-x-0 w-[300px]' : 'translate-x-full w-0 opacity-0'
      }`}
      style={{ 
        backgroundColor: 'rgba(31, 31, 41, 0.5)',
        borderLeft: showEpisodeList ? '1px solid rgba(93, 96, 101, 0.5)' : 'none'
      }}
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header with season selector and close button */}
        <div className="p-3 border-b border-gray-700/50 flex items-center justify-between">
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" size="sm"
                  className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white h-9 rounded text-sm shadow-md"
                >
                  <span>Phần {currentSeason}</span>
                  <ChevronDown size={16} className="ml-1.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent 
                  className="bg-gray-800/95 backdrop-blur-md border-white/20 text-white"
                  align="start"
                  sideOffset={5}
                >
                  {seasons.map((season) => (
                    <DropdownMenuItem 
                      key={season.id}
                      className={`cursor-pointer ${currentSeason === season.id ? 'bg-white/20 text-amber-400' : 'text-white hover:bg-white/10'}`}
                      onClick={() => setCurrentSeason(season.id)}
                    >
                      {season.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" size="icon"
                  onClick={() => setShowEpisodeList(false)}
                  className="text-gray-300 hover:text-white hover:bg-white/10 p-1 h-8 w-8"
                >
                  <X size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Đóng</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Search bar */}
        <div className="px-3 py-2 border-b border-gray-700/50">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <Input 
              placeholder="Tìm tập phim..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm pl-8 h-8"
            />
          </div>
        </div>
        
        {/* Episode tabs */}
        <Tabs defaultValue="grid" className="w-full">
          <div className="px-3 py-2 border-b border-gray-700/50">
            <TabsList className="bg-white/10 p-0.5">
              <TabsTrigger 
                value="grid" 
                className="rounded text-xs data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 py-1"
              >
                Lưới
              </TabsTrigger>
              <TabsTrigger 
                value="list" 
                className="rounded text-xs data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 py-1"
              >
                Danh sách
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="grid" className="mt-0">
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-2 gap-2">
                {episodes.map(ep => (
                  <Card 
                    key={ep.id}
                    className={`border-0 bg-transparent overflow-hidden transition-all ${
                      ep.id === currentEpisode.id
                        ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <a href={generateEpisodeUrl(movieId, movieTitle, ep.id)}>
                      <div className="aspect-video bg-gray-800 relative overflow-hidden rounded-t-md">
                        <img 
                          src={`https://picsum.photos/seed/${ep.id}/300/200`} 
                          alt={`Tập ${ep.episodeNumber}`}
                          className="w-full h-full object-cover"
                        />
                        {ep.id === currentEpisode.id && (
                          <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                            <Badge variant="outline" className="bg-amber-500 text-white border-amber-500">
                              Đang xem
                            </Badge>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                          <span className="text-white text-xs font-semibold">Tập {ep.episodeNumber}</span>
                        </div>
                        
                        <div className="absolute top-1 right-1 bg-black/70 rounded text-xs text-white px-1">
                          {ep.duration} phút
                        </div>
                      </div>
                      
                      <div className="p-1.5">
                        <div className="line-clamp-1 text-xs">
                          <span className={ep.id === currentEpisode.id ? "text-amber-400 font-medium" : "text-gray-300"}>
                            {ep.title || `Tập ${ep.episodeNumber}`}
                          </span>
                        </div>
                      </div>
                    </a>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="mt-0">
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-700/30">
                {episodes.map(ep => (
                  <a 
                    key={ep.id}
                    href={generateEpisodeUrl(movieId, movieTitle, ep.id)}
                    className={`flex items-center p-3 ${
                      ep.id === currentEpisode.id
                        ? 'bg-white/10 text-amber-400'
                        : 'hover:bg-white/5 text-white'
                    }`}
                  >
                    <div className="w-[80px] flex-shrink-0 mr-3 relative">
                      <div className="aspect-video rounded overflow-hidden">
                        <img 
                          src={`https://picsum.photos/seed/${ep.id}/160/90`} 
                          alt={`Tập ${ep.episodeNumber}`}
                          className="w-full h-full object-cover"
          />
        </div>
                      <Badge 
                        variant="default"
                        className="absolute -top-2 -right-2 bg-gray-800 text-white h-5 min-w-5 flex items-center justify-center p-0"
                      >
                        {ep.episodeNumber}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ep.title || `Tập ${ep.episodeNumber}`}</p>
                      <p className="text-xs text-gray-400">{ep.duration} phút</p>
                    </div>
                    {ep.id === currentEpisode.id && (
                      <div className="ml-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 