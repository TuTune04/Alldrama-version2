import Link from 'next/link';
import { mockGenres } from '@/mocks';

const GenreList = () => {
  return (
    <div className="py-6">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Thể loại phim</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {mockGenres.map((genre) => (
          <Link
            key={genre.id}
            href={`/movie?genre=${encodeURIComponent(genre.name)}`}
            className="bg-gray-800 hover:bg-red-600 text-center p-3 rounded-lg transition-colors"
          >
            <span className="text-white font-medium">{genre.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GenreList; 