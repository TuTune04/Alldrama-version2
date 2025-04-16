export interface Episode {
  id: number;
  movieId: number;
  episodeNumber: number;
  title: string;
  description: string;
  playlistUrl: string;
  thumbnailUrl: string;
  duration: number;
  isProcessed: boolean;
  processingError: null | string;
  views: number;
  createdAt: string;
  updatedAt: string;
  movie?: {
    id: number;
    title: string;
    releaseYear: number;
    posterUrl: string;
  };
}

// Note: API returns array directly, not paginated object
export type EpisodeListResponse = Episode[];

// For internal use with pagination
export interface PaginatedEpisodeResponse {
  episodes: Episode[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface CreateEpisodeDto {
  movieId: number;
  episodeNumber: number;
  title: string;
  description: string;
  playlistUrl: string;
  thumbnailUrl: string;
  duration: number;
}

export interface UpdateEpisodeDto extends Partial<CreateEpisodeDto> {}