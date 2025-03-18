'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Movie } from '@/types';
import { mockMovies } from '@/mocks';
import { generateMovieUrl } from '@/utils/url';
const Hero = () => {
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    // Sử dụng movie đầu tiên trong mock data làm phim nổi bật
    setFeaturedMovie(mockMovies[0]);
  }, []);

  if (!featuredMovie) {
    return <div className="h-[70vh] bg-gray-800 animate-pulse"></div>;
  }

  return (
    <div className="relative w-full h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={featuredMovie.posterUrl}
          alt={featuredMovie.title}
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            {featuredMovie.title}
          </h1>
          <p className="text-gray-300 md:text-lg line-clamp-3">
            {featuredMovie.description}
          </p>
          <div className="flex flex-wrap gap-2 items-center text-sm text-gray-300">
            <span>{featuredMovie.releaseYear}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
            <div className="flex items-center">
              <span className="text-yellow-500 mr-1">★</span>
              <span>{featuredMovie.rating || 0}</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
            <span>{new Intl.NumberFormat('vi-VN').format(featuredMovie.views || 0)} lượt xem</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {featuredMovie.genres.slice(0, 3).map((genre, index) => {
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
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href={generateMovieUrl(featuredMovie.id, featuredMovie.title)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full transition duration-300 inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Xem ngay
            </Link>
            <Link
              href={featuredMovie.trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-800/80 hover:bg-gray-700 text-white font-medium rounded-full transition duration-300 inline-flex items-center"
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
  );
};

export default Hero; 