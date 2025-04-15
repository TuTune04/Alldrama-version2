import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import MoviePopover from "@/components/features/movie/MoviePopover";

interface RelatedMoviesProps {
  relatedMovies: any[];
}

export default function RelatedMovies({ relatedMovies }: RelatedMoviesProps) {
  // Define the common glass background style
  const GLASS_BG = "bg-gradient-to-br from-gray-800/70 to-gray-900/80 border-gray-700/60 backdrop-blur-sm shadow-lg";
  
  return (
    <Card className={GLASS_BG}>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold text-white mb-4">Có thể bạn thích</h2>
        <div className="space-y-3">
          {relatedMovies.map(relatedMovie => (
            <MoviePopover 
              key={relatedMovie.id} 
              movie={relatedMovie}
              size="sm"
              variant="simple"
              trigger={
                <a 
                  href={`/movie/${relatedMovie.id}-${relatedMovie.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center p-2 hover:bg-gray-700/50 rounded-md transition-colors"
                >
                  <div className="flex-shrink-0 w-16 h-24 rounded overflow-hidden bg-gray-900">
                    <img 
                      src={relatedMovie.posterUrl}
                      alt={relatedMovie.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <h3 className="text-white text-sm font-medium truncate">{relatedMovie.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {relatedMovie.releaseYear && (
                        <span className="text-xs text-gray-400">{relatedMovie.releaseYear}</span>
                      )}
                      <div className="flex items-center text-xs text-amber-400">
                        <Star className="h-3 w-3 mr-0.5" fill="currentColor" />
                        <span>{relatedMovie.rating || "8.5"}</span>
                      </div>
                    </div>
                  </div>
                </a>
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
