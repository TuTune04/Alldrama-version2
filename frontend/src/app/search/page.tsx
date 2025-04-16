'use client'

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { mockMovies } from '@/mocks';
import { mockGenres } from '@/mocks/genres';
import MovieCard from '@/components/features/movie/MovieCard';
import { Movie, Genre } from '@/types';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [results, setResults] = useState<Movie[]>([]);
  
  // Tạo mảng các năm để hiển thị trong dropdown
  const years = Array.from(
    new Set(mockMovies.map((movie) => movie.releaseYear))
  ).sort((a, b) => b - a);

  // Thực hiện tìm kiếm khi các tham số thay đổi
  useEffect(() => {
    const performSearch = () => {
      const query = searchQuery.toLowerCase().trim();
      
      let filtered = [...mockMovies];
      
      // Lọc theo query nếu có
      if (query) {
        filtered = filtered.filter(movie => 
          movie.title.toLowerCase().includes(query) || 
          movie.summary.toLowerCase().includes(query)
        );
      }
      
      // Lọc theo thể loại nếu được chọn
      if (selectedGenre) {
        filtered = filtered.filter(movie => 
          movie.genres.some(genre => {
            const genreName = typeof genre === 'string' ? genre : genre.name;
            return genreName.toLowerCase() === selectedGenre.toLowerCase();
          })
        );
      }
      
      // Lọc theo năm nếu được chọn
      if (selectedYear) {
        const year = parseInt(selectedYear);
        filtered = filtered.filter(movie => movie.releaseYear === year);
      }
      
      // Sắp xếp kết quả
      if (sortBy === 'title-asc') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === 'title-desc') {
        filtered.sort((a, b) => b.title.localeCompare(a.title));
      } else if (sortBy === 'year-asc') {
        filtered.sort((a, b) => a.releaseYear - b.releaseYear);
      } else if (sortBy === 'year-desc') {
        filtered.sort((a, b) => b.releaseYear - a.releaseYear);
      } else if (sortBy === 'rating-desc') {
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sortBy === 'views-desc') {
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
      }
      
      setResults(filtered);
    };
    
    performSearch();
  }, [searchQuery, selectedGenre, selectedYear, sortBy]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  const handleReset = () => {
    setSearchQuery(initialQuery);
    setSelectedGenre('');
    setSelectedYear('');
    setSortBy('');
  };
  
  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className="text-3xl font-bold text-white mb-8">Tìm kiếm phim</h1>
          
          {/* Form tìm kiếm */}
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="search-query" className="block text-sm font-medium text-gray-400 mb-1">
                  Từ khóa
                </label>
                <input
                  type="text"
                  id="search-query"
                  placeholder="Nhập tên phim, diễn viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label htmlFor="genre-filter" className="block text-sm font-medium text-gray-400 mb-1">
                  Thể loại
                </label>
                <select
                  id="genre-filter"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Tất cả thể loại</option>
                  {mockGenres.map((genre) => (
                    <option key={genre.id} value={genre.name}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="year-filter" className="block text-sm font-medium text-gray-400 mb-1">
                  Năm phát hành
                </label>
                <select
                  id="year-filter"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Tất cả các năm</option>
                  {years.map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap justify-between items-center">
              <div>
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-400 mb-1">
                  Sắp xếp theo
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Mặc định</option>
                  <option value="title-asc">Tên A-Z</option>
                  <option value="title-desc">Tên Z-A</option>
                  <option value="year-desc">Năm mới nhất</option>
                  <option value="year-asc">Năm cũ nhất</option>
                  <option value="rating-desc">Đánh giá cao nhất</option>
                  <option value="views-desc">Lượt xem nhiều nhất</option>
                </select>
              </div>
              
              <div className="mt-4 md:mt-0">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg mr-2 hover:bg-gray-600"
                >
                  Đặt lại
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
          </form>
          
          {/* Kết quả tìm kiếm */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                {results.length > 0 
                  ? `Kết quả tìm kiếm (${results.length})` 
                  : 'Không tìm thấy kết quả phù hợp'}
              </h2>
            </div>
            
            {results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {results.map((movie) => (
                  <div key={movie.id}>
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-16 w-16 mx-auto text-gray-600 mb-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
                <p className="text-gray-400 text-lg">Không tìm thấy phim phù hợp với tìm kiếm của bạn.</p>
                <p className="text-gray-500 mt-2">Hãy thử với từ khóa khác hoặc thay đổi bộ lọc.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
