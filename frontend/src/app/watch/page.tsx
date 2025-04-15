'use client'

import { useState, useRef } from 'react';
import VideoPlayer from '@/components/ui/VideoPlayer';
import { mockMovies } from '@/mocks';
import { getEpisodeListResponse } from '@/mocks/episodes';
import { getIdFromSlug, getEpisodeIdFromSlug, generateWatchEpisodeUrl } from '@/utils/url';

// Define types
interface Episode {
  id: string;
  episodeNumber: number;
  title?: string;
  duration: number;
  seasonId: number;
}

// UI Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Icons
import { ChevronDown, Grid2X2, List, Menu, Search, X } from 'lucide-react';

// Import components from features/watch
import NotFoundMessage from '@/components/features/watch/NotFoundMessage';
import MobileEpisodeSheet from '@/components/features/watch/MobileEpisodeSheet';
import ContentInfoCard from '@/components/features/watch/ContentInfoCard';
import CommentsSection from '@/components/features/watch/CommentsSection';
import RelatedMovies from '@/components/features/watch/RelatedMovies';


interface WatchPageProps {
  params: {
    type: string; // 'movie' or 'episode'
    contentSlug: string;
  };
}

// Constantes comunes

export default function WatchPage({ params }: WatchPageProps) {
  // Estados para controlar la UI
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [episodeView, setEpisodeView] = useState<'grid' | 'list'>('grid');
  
  // Determinar si estamos viendo una película o un episodio según el patrón de URL
  const isMovie = params.type === 'movie';
  const isEpisode = params.type === 'episode';
  
  // Analizar los IDs de contenido de la URL
  let movieId = '';
  let episodeId = '';
  let movie;
  let currentEpisode;
  let episodeListResponse;
  
  if (isMovie) {
    // Manejar tipo de contenido película
    movieId = getIdFromSlug(params.contentSlug);
    movie = mockMovies.find(m => m.id === movieId);
    
    if (!movie) {
      return <NotFoundMessage message="Không tìm thấy phim" description="Phim bạn đang tìm không tồn tại hoặc đã bị xóa." />;
    }
    
    // Para películas, no tenemos episodios
    episodeListResponse = { episodes: [] };
    currentEpisode = null;
  } else if (isEpisode) {
    // Manejar tipo de contenido episodio
    episodeId = getEpisodeIdFromSlug(params.contentSlug);
    
    // Extraer información de la película del ID del episodio
    // Asumiendo que el formato del ID del episodio contiene información de la película
    const episodeParts = episodeId.split('-');
    if (episodeParts.length >= 3) {
      // Formato: episode-MOVIEID-EPISODENUMBER
      movieId = `movie-${episodeParts[1]}`;
    }
    
    movie = mockMovies.find(m => m.id === movieId);
    
    if (!movie) {
      return <NotFoundMessage message="Không tìm thấy phim" description="Phim bạn đang tìm không tồn tại hoặc đã bị xóa." />;
    }
    
    episodeListResponse = getEpisodeListResponse(movieId);
    currentEpisode = episodeListResponse.episodes.find(ep => ep.id === episodeId);
    
    if (!currentEpisode) {
      return <NotFoundMessage message="Không tìm thấy tập phim" description="Tập phim bạn đang tìm không tồn tại hoặc đã bị xóa." />;
    }
  } else {
    return <NotFoundMessage message="Nội dung không hợp lệ" description="URL không đúng định dạng." />;
  }
  
  // Encontrar episodios anteriores y siguientes (solo para tipo episodio)
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
          {/* Sección del Reproductor de Video */}
          <div className="w-full">
            <div ref={videoContainerRef} className="w-full overflow-hidden rounded-lg shadow-xl relative">
              {/* Botón de lista de episodios para escritorio */}
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
              
              {/* Panel móvil de episodios (solo para series) */}
              {!isMovie && episodeListResponse.episodes.length > 0 && (
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
              )}
              
              {/* Reproductor de Video */}
              <VideoPlayer
                src={isMovie ? movie.videoUrl : currentEpisode?.videoUrl}
                poster={movie.posterUrl}
                title={isMovie ? movie.title : `${movie.title} - Tập ${currentEpisode?.episodeNumber}: ${currentEpisode?.title}`}
                episodeInfo={isMovie ? null : {
                  id: currentEpisode?.id,
                  title: currentEpisode?.title,
                  number: currentEpisode?.episodeNumber,
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
              
              {/* Panel de Episodios para Escritorio (solo para series) */}
              {!isMovie && episodeListResponse.episodes.length > 0 && (
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
              )}
              
              {/* Overlay para cerrar la lista de episodios */}
              {showEpisodeList && (
                <div 
                  className="absolute top-0 left-0 bg-black/30 z-30 hidden sm:block"
                  style={{ width: 'calc(100% - 300px)', height: '100%' }}
                  onClick={() => setShowEpisodeList(false)}
                />
              )}
            </div>
          </div>
          
          {/* Contenido debajo del Video */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contenido Principal - Lado Izquierdo */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información del Contenido */}
              <ContentInfoCard 
                movie={movie}
                currentEpisode={currentEpisode}
                prevEpisode={prevEpisode}
                nextEpisode={nextEpisode}
                isMovie={isMovie}
                episodeListResponse={episodeListResponse}
                setShowEpisodeList={setShowEpisodeList}
              />
              
              {/* Sección de Comentarios */}
              <CommentsSection />
            </div>
            
            {/* Barra Lateral - Lado Derecho */}
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
  if (!showEpisodeList) return null;
  
  return (
    <div className="absolute right-0 top-0 h-full bg-gray-900/95 backdrop-blur-md border-l border-gray-800 w-[300px] z-40 hidden sm:block">
      <div className="flex flex-col h-full">
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
                  {seasons.map((season: { id: number; name: string }) => (
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
                {episodes.map((ep: any) => (
                  <Card 
                    key={ep.id}
                    className={`overflow-hidden border-0 bg-transparent hover:bg-white/5 transition-colors ${
                      ep.id === currentEpisode.id
                        ? 'ring-1 ring-amber-500'
                        : ''
                    }`}
                  >
                    <a href={generateWatchEpisodeUrl(`${movieId}-${ep.id}`)}>
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

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-2 py-1.5">
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
                {episodes.map((ep: any) => (
                  <a 
                    key={ep.id}
                    href={generateWatchEpisodeUrl(`${movieId}-${ep.id}`)}
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