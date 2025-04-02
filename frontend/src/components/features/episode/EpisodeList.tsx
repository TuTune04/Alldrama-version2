'use client'

import Link from 'next/link';
import Image from 'next/image';
import { Episode } from '@/types/episode';
import { generateWatchUrl } from '@/utils/url';

interface EpisodeListProps {
  episodes: Episode[];
  currentEpisodeId: string;
  movieId: string;
  movieTitle: string;
}

export default function EpisodeList({ episodes, currentEpisodeId, movieId, movieTitle }: EpisodeListProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
        {episodes.map((episode) => (
          <Link 
            key={episode.id} 
            href={generateWatchUrl(movieId, movieTitle, episode.id, episode.episodeNumber)}
            className={`flex items-center p-2 rounded ${episode.id === currentEpisodeId ? 'bg-red-600' : 'hover:bg-gray-700'}`}
          >
            <div className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded flex-shrink-0">
              <span className="text-xl font-bold text-white">
                {episode.episodeNumber}
              </span>
            </div>
            <div className="ml-3 flex-grow">
              <div className={`font-medium ${episode.id === currentEpisodeId ? 'text-white' : 'text-gray-300'}`}>
                Tập {episode.episodeNumber}: {episode.title}
              </div>
              <div className={episode.id === currentEpisodeId ? 'text-gray-200' : 'text-gray-400'}>
                {episode.duration} phút
              </div>
            </div>
            {episode.id === currentEpisodeId && (
              <div className="text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
} 