export interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  movieId: string;
  videoUrl: string;
  duration: number;
  views?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EpisodeListResponse {
  episodes: Episode[];
  totalPages: number;
  currentPage: number;
  totalEpisodes: number;
} 