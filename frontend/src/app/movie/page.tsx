'use client';

import { useState, useEffect } from 'react';
import { Movie } from '@/types/movie';
import { Genre } from '@/types/genre';
import MovieGrid from '@/components/features/movie/MovieGrid';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronDown, Star, Grid, LayoutGrid, 
  SlidersHorizontal, Heart, TrendingUp, Clock,
  Filter
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
import { useMovies } from '@/hooks/api/useMovies';
import { useGenres } from '@/hooks/api/useGenres';

// Use genres from API
const ALL_GENRE_OPTION = { id: 'all', name: 'Tất cả' };

interface SortOptions {
  sort?: 'title' | 'rating' | 'views' | 'releaseYear' | 'createdAt';
  order?: 'ASC' | 'DESC';
}

interface ProcessedMovie extends Movie {
  type: 'movie' | 'series';
}

export default function MovieListPage() {
  const [activeGenre, setActiveGenre] = useState('all');
  const [sortOption, setSortOption] = useState('popular');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Use the movies hook
  const { 
    movies, 
    loading: isLoading, 
    pagination,
    searchMovies,
    error
  } = useMovies({ limit: 20 });

  const {
    getAllGenres,
    getMoviesByGenre,
  } = useGenres();

  const [genres, setGenres] = useState<Genre[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);

  // Fetch genres when component mounts
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setGenresLoading(true);
        const genreData = await getAllGenres();
        if (genreData) {
          setGenres(genreData);
        }
      } catch (error) {
        console.error('Error fetching genres:', error);
      } finally {
        setGenresLoading(false);
      }
    };
    
    fetchGenres();
  }, [getAllGenres]);

  // State for filtered movies
  const [allMovies, setAllMovies] = useState<ProcessedMovie[]>([]);
  const [moviesOnly, setMoviesOnly] = useState<ProcessedMovie[]>([]);
  const [seriesOnly, setSeriesOnly] = useState<ProcessedMovie[]>([]);

  // Load movies when genre, sort, or page changes
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const sortOptions: SortOptions = {
          sort: 'createdAt',
          order: 'DESC'
        };
        
        switch (sortOption) {
          case 'popular':
            sortOptions.sort = 'views';
            break;
          case 'trending':
          case 'topRated':
            sortOptions.sort = 'rating';
            break;
          case 'newest':
            sortOptions.sort = 'createdAt';
            break;
        }

        // Use different fetch strategy based on active genre
        if (activeGenre === 'all') {
          // Just update the search params - data will come through the movies state
          searchMovies({
            page: currentPage,
            limit: 20,
            ...sortOptions
          });
          // Don't try to access the result directly
        } else {
          // Get movies by genre - this does return data
          const genreMovies = await getMoviesByGenre(activeGenre);
          
          if (genreMovies) {
            const moviesArray = Array.isArray(genreMovies) ? genreMovies : [];
            
            const processedMovies = moviesArray.map((movie: Movie) => ({
              ...movie,
              type: movie.totalEpisodes > 0 ? 'series' : 'movie'
            })) as ProcessedMovie[];
            
            setAllMovies(processedMovies);
            setMoviesOnly(processedMovies.filter(movie => movie.type === 'movie'));
            setSeriesOnly(processedMovies.filter(movie => movie.type === 'series'));
          }
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovies();
  }, [activeGenre, sortOption, currentPage, searchMovies, getMoviesByGenre]);
  
  // Separate movies into categories based on totalEpisodes
  useEffect(() => {
    if (movies) {
      // Add movie type info (using totalEpisodes to determine if it's a series)
      const processedMovies = movies.map(movie => ({
        ...movie,
        type: movie.totalEpisodes > 0 ? 'series' : 'movie'
      })) as ProcessedMovie[];
      
      setAllMovies(processedMovies);
      setMoviesOnly(processedMovies.filter(movie => movie.type === 'movie'));
      setSeriesOnly(processedMovies.filter(movie => movie.type === 'series'));
    }
  }, [movies]);

  const handleGenreChange = (genre: string) => {
    // Reset to page 1 when changing genre
    setCurrentPage(1);
    setActiveGenre(genre);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Get current movie list based on active tab
  const getCurrentMovies = () => {
    switch (activeTab) {
      case 'movies':
        return moviesOnly;
      case 'series':
        return seriesOnly;
      default:
        return allMovies;
    }
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
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-medium">Lọc phim theo thể loại</h3>
              
              {/* Right-side controls */}
              <div className="flex items-center gap-2">
                {/* Sort Options */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700 flex gap-1.5 items-center">
                      <SlidersHorizontal size={16} />
                      <span className="hidden sm:inline">Sắp xếp</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700">
                    <DropdownMenuItem 
                      className={`flex items-center gap-2 cursor-pointer ${sortOption === 'popular' ? 'text-indigo-500' : 'text-gray-300'} hover:bg-gray-700`}
                      onClick={() => setSortOption('popular')}
                    >
                      <Heart size={16} />
                      <span>Phổ biến nhất</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={`flex items-center gap-2 cursor-pointer ${sortOption === 'trending' ? 'text-indigo-500' : 'text-gray-300'} hover:bg-gray-700`}
                      onClick={() => setSortOption('trending')}
                    >
                      <TrendingUp size={16} /> 
                      <span>Xu hướng</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={`flex items-center gap-2 cursor-pointer ${sortOption === 'newest' ? 'text-indigo-500' : 'text-gray-300'} hover:bg-gray-700`}
                      onClick={() => setSortOption('newest')}
                    >
                      <Clock size={16} />
                      <span>Mới nhất</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={`flex items-center gap-2 cursor-pointer ${sortOption === 'topRated' ? 'text-indigo-500' : 'text-gray-300'} hover:bg-gray-700`}
                      onClick={() => setSortOption('topRated')}
                    >
                      <Star size={16} />
                      <span>Đánh giá cao</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Genre Tags */}
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-2">
                <Badge 
                  variant={activeGenre === 'all' ? "default" : "outline"}
                  className={`px-4 py-2 rounded-full cursor-pointer text-sm font-normal ${
                    activeGenre === 'all' 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                  }`}
                  onClick={() => handleGenreChange('all')}
                >
                  Tất cả
                </Badge>
                
                {genresLoading ? (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-9 bg-gray-800 rounded-full w-20 animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  genres.map((genre) => (
                    <Badge 
                      key={genre.id}
                      variant={activeGenre === String(genre.id) ? "default" : "outline"}
                      className={`px-4 py-2 rounded-full cursor-pointer text-sm font-normal ${
                        activeGenre === String(genre.id) 
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                          : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                      }`}
                      onClick={() => handleGenreChange(String(genre.id))}
                    >
                      {genre.name}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs for movies/series/all */}
        <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="mb-5 bg-gray-800/30 border border-gray-700/50">
            <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600">Tất cả</TabsTrigger>
            <TabsTrigger value="movies" className="data-[state=active]:bg-indigo-600">Phim lẻ</TabsTrigger>
            <TabsTrigger value="series" className="data-[state=active]:bg-indigo-600">Phim bộ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid grid-cols-1 gap-8">
              <MovieGrid
                isLoading={isLoading}
                movies={allMovies}
                showPagination={true}
                totalPages={pagination?.totalPages || 1}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="movies">
            <div className="grid grid-cols-1 gap-8">
              <MovieGrid
                isLoading={isLoading}
                movies={moviesOnly}
                showPagination={true}
                totalPages={pagination?.totalPages || 1}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="series">
            <div className="grid grid-cols-1 gap-8">
              <MovieGrid
                isLoading={isLoading}
                movies={seriesOnly}
                showPagination={true}
                totalPages={pagination?.totalPages || 1}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}