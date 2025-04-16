'use client';

import { useState } from 'react';
import { mockMovieListResponse } from '@/mocks';
import { Movie } from '@/types/movie';
import MovieGrid from '@/components/features/movie/MovieGrid';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronDown, Star, Grid, LayoutGrid, 
  SlidersHorizontal, Heart, TrendingUp, Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import MoviePopover from '@/components/features/movie/MoviePopover';
import Link from 'next/link';
import { generateMovieUrl } from '@/utils/url';

// Genre data for filter badges
const GENRES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'action', name: 'Hành động' },
  { id: 'comedy', name: 'Hài hước' },
  { id: 'drama', name: 'Chính kịch' },
  { id: 'romance', name: 'Lãng mạn' },
  { id: 'scifi', name: 'Khoa học viễn tưởng' },
  { id: 'horror', name: 'Kinh dị' },
  { id: 'fantasy', name: 'Thần thoại' },
  { id: 'mystery', name: 'Bí ẩn' },
  { id: 'thriller', name: 'Giật gân' },
  { id: 'animation', name: 'Hoạt hình' },
];

// URL generation is now handled by the imported generateMovieUrl function from utils/url

export default function MovieListPage() {
  const [activeGenre, setActiveGenre] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [sortOption, setSortOption] = useState('popular');

  const handleGenreChange = (genre: string) => {
    setActiveGenre(genre);
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => setIsLoading(false), 800);
  };

  // Get the actual movies array from the mock data
  const movieItems: Movie[] = mockMovieListResponse.movies || [];
  
  // Add movie type info for demo purposes (using totalEpisodes to determine if it's a series)
  const moviesWithType = movieItems.map(movie => ({
    ...movie,
    type: movie.totalEpisodes > 0 ? 'series' : 'movie'
  }));
  
  // Filter movies based on type for different tabs
  const movieData = {
    ...mockMovieListResponse,
    movies: moviesWithType
  };
  
  const moviesOnly = {
    ...movieData,
    movies: moviesWithType.filter(movie => movie.type === 'movie')
  };
  
  const seriesOnly = {
    ...movieData,
    movies: moviesWithType.filter(movie => movie.type === 'series')
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Khám phá phim</h1>
              <p className="text-gray-400 text-lg max-w-2xl">Thư viện phim đa dạng với nhiều thể loại hấp dẫn, cập nhật liên tục những bộ phim mới nhất.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Bar */}
        <div className="mb-8 bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 top-0 z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 md:pb-0">
              {GENRES.slice(0, 7).map((genre) => (
                <Badge 
                  key={genre.id}
                  variant={activeGenre === genre.id ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1 text-sm font-medium ${
                    activeGenre === genre.id 
                      ? 'bg-amber-500 text-gray-900 hover:bg-amber-600' 
                      : 'bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => handleGenreChange(genre.id)}
                >
                  {genre.name}
                </Badge>
              ))}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                    Thêm <ChevronDown size={16} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                  {GENRES.slice(7).map((genre) => (
                    <DropdownMenuItem 
                      key={genre.id}
                      className="cursor-pointer hover:bg-gray-700"
                      onClick={() => handleGenreChange(genre.id)}
                    >
                      {genre.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                    <SlidersHorizontal size={16} className="mr-2" /> Sắp xếp
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                  <DropdownMenuItem 
                    className={`cursor-pointer flex items-center ${sortOption === 'popular' ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-gray-700'}`}
                    onClick={() => setSortOption('popular')}
                  >
                    <TrendingUp size={16} className="mr-2" /> Phổ biến
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`cursor-pointer flex items-center ${sortOption === 'newest' ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-gray-700'}`}
                    onClick={() => setSortOption('newest')}
                  >
                    <Clock size={16} className="mr-2" /> Mới nhất
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`cursor-pointer flex items-center ${sortOption === 'rating' ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-gray-700'}`}
                    onClick={() => setSortOption('rating')}
                  >
                    <Star size={16} className="mr-2" /> Đánh giá
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        {/* Content Tabs */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="bg-gray-800/30 border border-gray-700/50">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-gray-900"
            >
              Tất cả
            </TabsTrigger>
            <TabsTrigger 
              value="movies" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-gray-900"
            >
              Phim lẻ
            </TabsTrigger>
            <TabsTrigger 
              value="series" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-gray-900"
            >
              Phim bộ
            </TabsTrigger>
            <TabsTrigger 
              value="favorites" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-gray-900"
            >
              <Heart size={16} className="mr-1" /> Yêu thích
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <MovieGrid 
              movies={movieData.movies}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="movies" className="mt-6">
            <MovieGrid 
              movies={moviesOnly.movies}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="series" className="mt-6">
            <MovieGrid 
              movies={seriesOnly.movies}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-6">
            <div className="text-center py-12">
              <h3 className="text-gray-400 mb-4">Bạn chưa có phim yêu thích nào</h3>
              <Button className="bg-amber-500 hover:bg-amber-600 text-gray-900">
                Khám phá phim
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Featured Section */}
        <div className="my-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Phim đề xuất cho bạn</h2>
            <Button variant="link" className="text-amber-400 hover:text-amber-300">
              Xem tất cả
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {movieItems.slice(0, 3).map((movie) => (
              <Card key={movie.id} className="bg-gray-800/40 border-gray-700 overflow-hidden hover:border-gray-500 transition-all">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={movie.posterUrl} 
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-bold text-white line-clamp-1">{movie.title}</h3>
                    <div className="flex items-center mt-1 text-sm text-gray-300">
                      <span>{movie.releaseYear}</span>
                      <Separator orientation="vertical" className="mx-2 h-3 bg-gray-600" />
                      <span className="flex items-center">
                        <Star className="text-amber-400 mr-1" size={14} fill="currentColor" /> 
                        {movie.rating || "8.5"}
                      </span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-gray-300 text-sm line-clamp-2">{movie.summary}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {movie.genres?.slice(0, 3).map((genre, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-600">
                        {typeof genre === 'string' ? genre : genre.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link href={generateMovieUrl(movie.id, movie.title)}>
                      <Button className="w-full bg-amber-500 hover:bg-amber-600 text-gray-900">
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}