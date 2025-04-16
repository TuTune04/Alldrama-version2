'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSlug, generateWatchUrl } from '@/utils/url';
import { mockMovies } from '@/mocks';
import { getEpisodeListResponse } from '@/mocks/episodes';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronDown, Play, Grid, Clock, Filter,
  Calendar, TrendingUp, ListFilter, Search
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Episode } from '@/types/episode';
import { generateMovieUrl } from '@/utils/url';

// Enhanced episode type with additional movie information
interface EnhancedEpisode extends Episode {
  movieTitle: string;
  moviePoster: string;
}

// Get all series movies (those with episodes)
const seriesMovies = mockMovies.filter(movie => {
  const episodes = getEpisodeListResponse(movie.id);
  return episodes && episodes.length > 0;
});

// Get all episodes from all series
const allEpisodes: EnhancedEpisode[] = seriesMovies.flatMap(movie => {
  const episodes = getEpisodeListResponse(movie.id);
  return episodes.map(episode => ({
    ...episode,
    movieTitle: movie.title,
    moviePoster: movie.posterUrl
  }));
});

// Sort episodes by creation date (newest first)
const sortedEpisodes = [...allEpisodes].sort((a, b) => 
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);

export default function EpisodeListPage() {
  const [activeTab, setActiveTab] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  // Filter episodes based on search query
  const filteredEpisodes = sortedEpisodes.filter(episode => 
    episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    episode.movieTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get trending episodes (based on views in this demo)
  const trendingEpisodes = [...sortedEpisodes]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 12);
  
  // Get latest episodes
  const latestEpisodes = [...sortedEpisodes].slice(0, 16);

  // Use the utility function from utils/url.ts to generate watch URLs
  const getEpisodeWatchUrl = (movieId: string | number, movieTitle: string, episodeId: string | number, episodeNumber: number) => {
    return generateWatchUrl(movieId, movieTitle, episodeId, episodeNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
      {/* Hero Section with curved design */}
      <div className="w-full bg-gradient-to-r from-gray-900 via-gray-900 to-gray-900 relative pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Tập Mới Cập Nhật</h1>
              <p className="text-gray-400 text-lg max-w-2xl">
                Khám phá các tập phim mới nhất từ những bộ phim bạn yêu thích. Cập nhật liên tục, không bỏ lỡ bất kỳ nội dung nào.
              </p>
            </div>
            
            <form onSubmit={handleSearch} className="flex w-full md:w-auto">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  type="search"
                  placeholder="Tìm kiếm tập phim..." 
                  className="pl-10 bg-black/20 border-gray-700 text-white focus:border-gray-500 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="ml-2 bg-gray-600 hover:bg-gray-700 text-white">
                Tìm
              </Button>
            </form>
          </div>
        </div>
        
        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gray-900 rounded-t-[50%]"></div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4 relative z-20">
        {/* Filter Bar */}
        <div className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={activeTab === 'latest' ? "default" : "outline"} 
                size="sm"
                className={activeTab === 'latest' ? "bg-gray-800 hover:bg-gray-700" : "bg-transparent border-gray-600"}
                onClick={() => setActiveTab('latest')}
              >
                <Clock size={16} className="mr-2" /> Mới nhất
              </Button>
              <Button 
                variant={activeTab === 'trending' ? "default" : "outline"} 
                size="sm"
                className={activeTab === 'trending' ? "bg-gray-800 hover:bg-gray-700" : "bg-transparent border-gray-600"}
                onClick={() => setActiveTab('trending')}
              >
                <TrendingUp size={16} className="mr-2" /> Thịnh hành
              </Button>
              <Button 
                variant={activeTab === 'series' ? "default" : "outline"} 
                size="sm"
                className={activeTab === 'series' ? "bg-gray-800 hover:bg-gray-700" : "bg-transparent border-gray-600"}
                onClick={() => setActiveTab('series')}
              >
                <ListFilter size={16} className="mr-2" /> Theo bộ phim
              </Button>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-transparent border-gray-600 text-gray-300">
                  <Filter size={16} className="mr-2" /> Lọc
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                <DropdownMenuItem className="cursor-pointer hover:bg-gray-700">
                  <Calendar size={14} className="mr-2" /> Mới nhất trước
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-gray-700">
                  <Calendar size={14} className="mr-2" /> Cũ nhất trước
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Episodes Grid */}
        <div className={activeTab === 'latest' ? 'block' : 'hidden'}>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Clock size={20} className="mr-2 text-gray-400" />
            <span className="bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">
              Tập mới cập nhật
            </span>
          </h2>
          
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 ${isLoading ? 'opacity-60' : ''}`}>
            {latestEpisodes.map((episode) => (
              <Link 
                href={generateWatchUrl(episode.movieId, episode.movieTitle, episode.id, episode.episodeNumber)}
                key={`${episode.movieId}-${episode.id}`}
              >
                <Card className="bg-gray-800/40 border-gray-700 hover:border-gray-500 transition-all overflow-hidden h-full flex flex-col">
                  <div className="relative aspect-video">
                    <img 
                      src={episode.moviePoster} 
                      alt={episode.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
                      <Button size="icon" className="bg-gray-600 hover:bg-gray-700 text-white h-12 w-12 rounded-full">
                        <Play size={24} fill="white" />
                      </Button>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-gray-600 text-white">Tập {episode.episodeNumber}</Badge>
                  </div>
                  <CardContent className="p-4 flex-grow flex flex-col">
                    <h3 className="font-bold text-white mb-1 line-clamp-1">{episode.title}</h3>
                    <p className="text-sm text-gray-400 mb-2 line-clamp-1">{episode.movieTitle}</p>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(episode.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      <Badge variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-600">
                        {Math.floor(episode.duration / 60)}:{(episode.duration % 60).toString().padStart(2, '0')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Trending episodes tab content */}
        <div className={activeTab === 'trending' ? 'block' : 'hidden'}>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <TrendingUp size={20} className="mr-2 text-gray-400" />
            <span className="bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">
              Tập phim thịnh hành
            </span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trendingEpisodes.map((episode, index) => (
              <Link 
                href={generateWatchUrl(episode.movieId, episode.movieTitle, episode.id, episode.episodeNumber)}
                key={`${episode.movieId}-${episode.id}`}
              >
                <Card className="bg-gray-800/40 border-gray-700 hover:border-gray-500 transition-all overflow-hidden h-full flex flex-col">
                  <div className="relative aspect-video">
                    <img 
                      src={episode.moviePoster} 
                      alt={episode.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
                      <Button size="icon" className="bg-gray-600 hover:bg-gray-700 text-white h-12 w-12 rounded-full">
                        <Play size={24} fill="white" />
                      </Button>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-gray-600 text-white">Tập {episode.episodeNumber}</Badge>
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white text-xs font-bold px-2 py-1 rounded">
                      #{index + 1}
                    </div>
                  </div>
                  <CardContent className="p-4 flex-grow flex flex-col">
                    <h3 className="font-bold text-white mb-1 line-clamp-1">{episode.title}</h3>
                    <p className="text-sm text-gray-400 mb-2 line-clamp-1">{episode.movieTitle}</p>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(episode.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      <Badge variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-600">
                        {Math.floor(episode.duration / 60)}:{(episode.duration % 60).toString().padStart(2, '0')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Series tab content */}
        <div className={activeTab === 'series' ? 'block' : 'hidden'}>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <ListFilter size={20} className="mr-2 text-gray-400" />
            <span className="bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">
              Phim bộ
            </span>
          </h2>
          
          <div className="space-y-10">
            {seriesMovies.slice(0, 5).map((movie) => (
              <div key={movie.id} className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <Link href={generateMovieUrl(movie.id, movie.title)} className="group">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-300 to-gray-100 bg-clip-text text-transparent">
                      {movie.title}
                    </h3>
                  </Link>
                  <Link href={generateMovieUrl(movie.id, movie.title)}>
                    <Button variant="outline" size="sm" className="bg-transparent border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white">
                      Xem tất cả tập
                    </Button>
                  </Link>
                </div>
                
                <ScrollArea className="pb-4">
                  <div className="flex gap-4">
                    {getEpisodeListResponse(movie.id).slice(0, 5).map((episode) => (
                      <Link 
                        href={generateWatchUrl(movie.id, movie.title, episode.id, episode.episodeNumber)}
                        key={episode.id}
                        className="flex-shrink-0 w-[280px]"
                      >
                        <Card className="bg-gray-800/40 border-gray-700 hover:border-gray-500 transition-all overflow-hidden h-full">
                          <div className="relative aspect-video">
                            <img 
                              src={movie.posterUrl} 
                              alt={episode.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
                              <Button size="icon" className="bg-gray-600 hover:bg-gray-700 text-white h-12 w-12 rounded-full">
                                <Play size={24} fill="white" />
                              </Button>
                            </div>
                            <Badge className="absolute top-2 right-2 bg-gray-600 text-white">Tập {episode.episodeNumber}</Badge>
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-medium text-white line-clamp-1">{episode.title}</h4>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {Math.floor(episode.duration / 60)}:{(episode.duration % 60).toString().padStart(2, '0')}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(episode.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
                
                <Separator className="bg-gray-800 my-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 