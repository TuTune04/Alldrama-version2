import Link from 'next/link';
import Image from 'next/image';
import { Movie, Genre } from '@/types';
import { generateMovieUrl } from '@/utils/url';
interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-all duration-300 hover:scale-105">
      <Link href={generateMovieUrl(movie.id, movie.title)}>
        <div className="aspect-[2/3] relative">
          <Image
            src={movie.posterUrl || 'https://via.placeholder.com/350x500?text=No+Image'}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 p-4 text-white">
              <p className="text-sm font-medium line-clamp-2">{movie.description}</p>
              <div className="flex items-center mt-2">
                <span className="text-yellow-500 mr-1">★</span>
                <span className="text-sm font-bold">{movie.rating || 0}</span>
              </div>
            </div>
          </div>
          
          {/* Hiển thị thông tin view */}
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
            {new Intl.NumberFormat('vi-VN').format(movie.views || 0)} lượt xem
          </div>
        </div>
      </Link>
      
      <div className="p-3">
        <Link href={generateMovieUrl(movie.id, movie.title)}>
          <h3 className="text-white font-bold text-lg mb-1 line-clamp-1 hover:text-red-500 transition-colors">
            {movie.title}
          </h3>
        </Link>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">{movie.releaseYear}</span>
          <div className="flex flex-wrap gap-1">
            {movie.genres && movie.genres.slice(0, 2).map((genre, index) => {
              // Kiểm tra nếu genre là object (Genre) hay string
              const genreId = typeof genre === 'string' ? genre : genre.id;
              const genreName = typeof genre === 'string' ? genre : genre.name;
              
              return (
                <Link 
                  key={`${genreId}-${index}`}
                  href={`/movie?genre=${encodeURIComponent(genreName)}`}
                  className="text-xs bg-gray-700 hover:bg-red-600 text-white px-2 py-0.5 rounded-full transition-colors"
                >
                  {genreName}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard; 