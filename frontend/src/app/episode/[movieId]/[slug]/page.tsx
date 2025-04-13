import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { mockMovies } from '@/mocks';
import { getEpisodeListResponse } from '@/mocks/episodes';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft, Play, Share2, ListMinus, MessageSquare, 
  Bookmark, ThumbsUp, Download, Clock, CalendarDays, 
  ChevronRight, Heart, Star
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import VideoPlayer from '@/components/ui/VideoPlayer';
import MovieSlider from '@/components/features/movie/MovieSlider';
import { Comment } from '@/types';

interface EpisodePageProps {
  params: {
    movieId: string;
    slug: string;
    episodeId: string;
  };
}

export default function EpisodePage({ params }: EpisodePageProps) {
  // Get movie and episode data
  const movie = mockMovies.find(m => m.id === params.movieId);
  
  if (!movie) {
    return notFound();
  }
  
  const episodeListResponse = getEpisodeListResponse(params.movieId);
  const currentEpisode = episodeListResponse.episodes?.find(ep => ep.id === params.episodeId);
  
  if (!currentEpisode) {
    return notFound();
  }
  
  // Get episode index for prev/next navigation
  const episodeIndex = episodeListResponse.episodes?.findIndex(ep => ep.id === params.episodeId) || 0;
  const prevEpisode = episodeIndex > 0 ? episodeListResponse.episodes?.[episodeIndex - 1] : null;
  const nextEpisode = episodeIndex < (episodeListResponse.episodes?.length || 0) - 1
    ? episodeListResponse.episodes?.[episodeIndex + 1]
    : null;
  
  // Mock comments for this episode
  const episodeComments: Comment[] = [
    {
      id: "comment1",
      content: "Tập phim này quá hay! Diễn viên diễn xuất quá đỉnh.",
      userId: "user1",
      user: { id: "user1", name: "Minh Anh" },
      movieId: params.movieId,
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "comment2",
      content: "Cảnh chiến đấu cuối tập thật gay cấn, không thể đợi đến tập tiếp theo!",
      userId: "user2",
      user: { id: "user2", name: "Thanh Tùng" },
      movieId: params.movieId,
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  // Get related episodes
  const relatedSeries = mockMovies
    .filter(m => 
      m.id !== movie.id && 
      m.genres.some(g1 => 
        movie.genres.some(g2 => {
          const name1 = typeof g1 === 'string' ? g1 : g1.name;
          const name2 = typeof g2 === 'string' ? g2 : g2.name;
          return name1 === name2;
        })
      )
    )
    .slice(0, 6);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
      {/* Back to series button */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href={`/movie/${movie.id}/${movie.title.toLowerCase().replace(/\s+/g, '-')}`}
            className="inline-flex items-center text-gray-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            <span>Trở về {movie.title}</span>
          </Link>
        </div>
      </div>
      
      {/* Video player section */}
      <div className="bg-black relative">
        <Suspense fallback={<div className="aspect-video bg-gray-800 animate-pulse max-w-7xl mx-auto"></div>}>
          <div className="max-w-7xl mx-auto aspect-video">
            <VideoPlayer 
              src={currentEpisode?.videoUrl || "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8"}
              poster={currentEpisode?.thumbnail || movie.posterUrl}
              title={`${movie.title} - ${currentEpisode?.title}`}
              autoplay={true}
            />
          </div>
        </Suspense>
      </div>
      
      {/* Episode info and controls */}
      <div className="bg-gray-800/50 border-y border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                Tập {currentEpisode.episodeNumber}: {currentEpisode.title}
              </h1>
              <p className="text-gray-400 flex items-center text-sm">
                <Link href={`/movie/${movie.id}/${movie.title.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-indigo-400">
                  {movie.title}
                </Link>
                <ChevronRight size={14} className="mx-1" />
                <span>Mùa {currentEpisode.season || 1}</span>
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {prevEpisode && (
                <Link 
                  href={`/episode/${movie.id}/${movie.title.toLowerCase().replace(/\s+/g, '-')}/${prevEpisode.id}`}
                >
                  <Button variant="outline" size="sm" className="bg-transparent border-gray-600">
                    Tập trước
                  </Button>
                </Link>
              )}
              
              {nextEpisode && (
                <Link 
                  href={`/episode/${movie.id}/${movie.title.toLowerCase().replace(/\s+/g, '-')}/${nextEpisode.id}`}
                >
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    Tập sau
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Episode details and comments */}
          <div className="lg:col-span-2">
            {/* Episode details */}
            <Card className="bg-gray-800/40 border-gray-700 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-indigo-600">Tập {currentEpisode.episodeNumber}</Badge>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-4 w-4 fill-yellow-400" />
                      <span className="font-medium">{currentEpisode.rating || '8.5'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{Math.floor(currentEpisode.duration / 60)}:{(currentEpisode.duration % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" className="rounded-full h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-700">
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Thích</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" className="rounded-full h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-700">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Lưu</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" className="rounded-full h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-700">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Chia sẻ</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-6">{currentEpisode.description || movie.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Phát hành</p>
                    <p className="text-white flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-indigo-400" />
                      {new Date(currentEpisode.releaseDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Thể loại</p>
                    <div className="flex flex-wrap gap-2">
                      {movie.genres.slice(0, 3).map((genre, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-600">
                          {typeof genre === 'string' ? genre : genre.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Comments section */}
            <Card className="bg-gray-800/40 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-indigo-400" />
                  <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Bình luận ({episodeComments.length})
                  </span>
                </h2>
                
                {/* Comment form */}
                <div className="flex gap-4 mb-6">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/images/placeholder-user.jpg" alt="Your avatar" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <textarea 
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Viết bình luận..."
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        Gửi
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Comments list */}
                <div className="space-y-6">
                  {episodeComments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/images/placeholder-user.jpg" alt={comment.user?.name} />
                        <AvatarFallback>{comment.user?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <div className="bg-gray-700/30 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-white">{comment.user?.name}</h4>
                            <span className="text-xs text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{comment.content}</p>
                        </div>
                        <div className="flex gap-4 mt-2 ml-4">
                          <button className="text-gray-400 text-xs flex items-center hover:text-indigo-400">
                            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                            <span>Thích</span>
                          </button>
                          <button className="text-gray-400 text-xs flex items-center hover:text-indigo-400">
                            <MessageSquare className="h-3.5 w-3.5 mr-1" />
                            <span>Phản hồi</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Episodes list and related content */}
          <div>
            {/* Episodes list */}
            <Card className="bg-gray-800/40 border-gray-700 mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <ListMinus className="h-5 w-5 mr-2 text-indigo-400" />
                  <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Danh sách tập
                  </span>
                </h2>
                
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {episodeListResponse.episodes?.map((episode) => (
                      <Link 
                        key={episode.id}
                        href={`/episode/${movie.id}/${movie.title.toLowerCase().replace(/\s+/g, '-')}/${episode.id}`}
                        className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                          episode.id === currentEpisode.id 
                            ? 'bg-indigo-600/20 border border-indigo-500/30' 
                            : 'hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="relative w-24 aspect-video flex-shrink-0 rounded overflow-hidden">
                          <img 
                            src={episode.thumbnail || "https://picsum.photos/500/300"} 
                            alt={episode.title}
                            className="w-full h-full object-cover"
                          />
                          {episode.id === currentEpisode.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-indigo-600/30">
                              <Play size={16} fill="white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between">
                            <Badge className={episode.id === currentEpisode.id ? 'bg-indigo-600' : 'bg-gray-700'}>
                              Tập {episode.episodeNumber}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {Math.floor(episode.duration / 60)}:{(episode.duration % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                          <h5 className={`font-medium text-sm mt-1 line-clamp-2 ${
                            episode.id === currentEpisode.id ? 'text-indigo-300' : 'text-white'
                          }`}>
                            {episode.title}
                          </h5>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* Movie info card */}
            <Card className="bg-gray-800/40 border-gray-700 overflow-hidden mb-8">
              <div className="relative aspect-[2/1]">
                <img 
                  src={movie.posterUrl || "https://picsum.photos/800/400"} 
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-bold text-white">{movie.title}</h3>
                  <div className="flex items-center mt-1 text-sm text-gray-300">
                    <span>{movie.releaseYear}</span>
                    <Separator orientation="vertical" className="mx-2 h-3 bg-gray-600" />
                    <span className="flex items-center">
                      <Star className="text-yellow-400 mr-1" size={14} fill="currentColor" /> 
                      {movie.rating || "8.5"}
                    </span>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-gray-300 text-sm line-clamp-3 mb-4">{movie.description}</p>
                <Link href={`/movie/${movie.id}/${movie.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Xem chi tiết
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Related content section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Có thể bạn cũng thích
            </span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedSeries.map((relatedMovie) => (
              <Link 
                key={relatedMovie.id}
                href={`/movie/${relatedMovie.id}/${relatedMovie.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="block"
              >
                <Card className="bg-gray-800/40 border-gray-700 hover:border-indigo-500 transition-all overflow-hidden h-full flex flex-col">
                  <div className="relative aspect-video">
                    <img 
                      src={relatedMovie.posterUrl || "https://picsum.photos/500/300"} 
                      alt={relatedMovie.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
                      <Button size="icon" className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 w-12 rounded-full">
                        <Play size={24} fill="white" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4 flex-grow flex flex-col">
                    <h3 className="font-bold text-white mb-1 line-clamp-1">{relatedMovie.title}</h3>
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">{relatedMovie.description}</p>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <div className="flex items-center text-yellow-400">
                        <Star className="h-4 w-4 fill-yellow-400 mr-1" />
                        <span>{relatedMovie.rating || '8.5'}</span>
                      </div>
                      <Badge variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-600">
                        {relatedMovie.releaseYear}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 