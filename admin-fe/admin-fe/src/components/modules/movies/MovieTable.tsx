'use client';
import { Movie } from '@/types/movie';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface MovieTableProps {
  movies: Movie[];
  onEdit: (movie: Movie) => void;
  onDelete: (id: string) => void;
}

export default function MovieTable({ movies, onEdit, onDelete }: MovieTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Movie ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Movie</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Year</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Duration</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Rating</th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {movies.map((movie) => (
            <tr key={movie.id}>
              <td className="whitespace-nowrap px-6 py-4 text-black">{movie.id}</td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center">
                  <img className="h-10 w-10 rounded object-cover" src={movie.posterUrl} alt={movie.title} />
                  <span className="ml-4 text-black">{movie.title}</span>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-black">{movie.releaseYear}</td>
              <td className="whitespace-nowrap px-6 py-4 text-black">{movie.duration}m</td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  movie.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {movie.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-black">{movie.rating}/10</td>
              <td className="whitespace-nowrap px-6 py-4 text-right">
                <button
                  onClick={() => onEdit(movie)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(movie.id)}
                  className="ml-4 text-red-600 hover:text-red-900"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}