'use client'
import { Movie, Episode } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { generateWatchUrl } from '@/utils/url';
interface MovieDetailProps {
  movie: Movie;
  episodes?: Episode[];
}

const MovieDetail = ({ movie, episodes = [] }: MovieDetailProps) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  return (
    <div className="text-white">
      {/* Banner */}
      <div className="relative w-full h-[40vh] md:h-[60vh] overflow-hidden">
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="hidden md:block w-64 h-96 flex-shrink-0 relative rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="space-y-4 flex-grow">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  {movie.title}
                </h1>
                
                <div className="flex flex-wrap gap-2 items-center text-sm md:text-base text-gray-300">
                  <span>{movie.releaseYear}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span>{movie.rating || 0}</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  <span>
                    {new Intl.NumberFormat('vi-VN').format(movie.views || 0)} lượt xem
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {movie.genres.map((genre, index) => {
                    const genreId = typeof genre === 'string' ? genre : genre.id;
                    const genreName = typeof genre === 'string' ? genre : genre.name;
                    
                    return (
                      <Link 
                        key={`${genreId}-${index}`} 
                        href={`/movie?genre=${encodeURIComponent(genreName)}`} 
                        className="px-3 py-1 bg-gray-800/80 hover:bg-red-600 rounded-full text-white text-sm transition-colors"
                      >
                        {genreName}
                      </Link>
                    );
                  })}
                </div>
                
                <div className="flex gap-4">
                  {episodes.length > 0 && (
                    <Link
                      href={generateWatchUrl(movie.id, movie.title, episodes[0].id, episodes[0].episodeNumber)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full inline-flex items-center transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Xem ngay
                    </Link>
                  )}
                  <Link
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-full inline-flex items-center transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Xem trailer
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_18rem] gap-8">
          <div>
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Nội dung phim</h2>
              <div className={`text-gray-300 ${!showFullDescription && 'line-clamp-3'}`}>
                {movie.description}
              </div>
              <button 
                onClick={toggleDescription}
                className="mt-2 text-red-500 hover:text-red-400 text-sm font-medium"
              >
                {showFullDescription ? 'Thu gọn' : 'Xem thêm'}
              </button>
            </div>
            
            {/* Episodes */}
            {episodes.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Danh sách tập</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {episodes.map((episode) => (
                    <Link 
                      key={episode.id} 
                      href={generateWatchUrl(movie.id, movie.title, episode.id, episode.episodeNumber)}
                      className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold">{episode.episodeNumber}</span>
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-medium line-clamp-1">{episode.title}</div>
                        <div className="text-sm text-gray-400">
                          {Math.floor(episode.duration / 60)} phút
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Thông tin phim</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Năm phát hành</span>
                  <span>{movie.releaseYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Số tập</span>
                  <span>{episodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Đánh giá</span>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span>{movie.rating || 0}/10</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lượt xem</span>
                  <span>{new Intl.NumberFormat('vi-VN').format(movie.views || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cập nhật</span>
                  <span>
                    {new Date(movie.updatedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail; 