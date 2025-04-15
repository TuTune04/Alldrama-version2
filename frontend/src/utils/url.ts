/**
 * URL generator utilities for the application
 */

/**
 * Create a slug from text
 * @param text The text to slugify
 * @returns The slugified text
 */
export function createSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

/**
 * Generate a URL for a movie detail page
 * @param id The movie ID
 * @param title The movie title (will be slugified)
 * @returns The URL string
 */
export const generateMovieUrl = (id: string, title: string): string => {
  const slug = createSlug(title);
  return `/movies/${id}`;
};

/**
 * Generate a URL for an episode detail page
 * @param episodeId The episode ID
 * @returns The URL string
 */
export const generateEpisodeUrl = (episodeId: string): string => {
  return `/episodes/${episodeId}`;
};

/**
 * Generate a URL for episodes of a specific movie
 * @param movieId The movie ID
 * @param movieTitle The movie title (for SEO-friendly URL)
 * @returns The URL string
 */
export const generateMovieEpisodesUrl = (movieId: string, movieTitle: string): string => {
  return `/episodes/movie/${movieId}`;
};

/**
 * Generate a URL for the watch movie page
 * @param movieId The movie ID
 * @returns The URL string
 */
export const generateWatchMovieUrl = (movieId: string): string => {
  return `/watch/movie/${movieId}`;
};

/**
 * Generate a URL for the watch episode page
 * @param episodeId The episode ID
 * @returns The URL string
 */
export const generateWatchEpisodeUrl = (episodeId: string): string => {
  return `/watch/episode/${episodeId}`;
};

/**
 * Generate a watch URL (backward compatibility)
 * @param movieId The movie ID
 * @param movieTitle The movie title (will be slugified)
 * @param episodeId The episode ID
 * @param episodeNumber The episode number
 * @returns The URL string
 */
export function generateWatchUrl(movieId: string, movieTitle: string, episodeId: string, episodeNumber: number): string {
  return `/watch/episode/${episodeId}`;
}

/**
 * Extract movie ID from a slug
 * @param slug The URL slug
 * @returns The extracted movie ID
 */
export function getIdFromSlug(slug: string): string {
  // Format of slug: movie-4-ten-phim
  // We need to extract movie-4
  const regex = /^(movie-\d+)/;
  const match = slug.match(regex);
  
  if (match && match[1]) {
    console.log("Regex match found:", match[1]);
    return match[1];
  }
  
  console.log("Regex match not found, trying fallback");
  // Fallback: get the first parts of the slug
  const parts = slug.split('-');
  if (parts.length >= 2) {
    console.log("Fallback returning:", parts[0] + '-' + parts[1]);
    return parts[0] + '-' + parts[1];
  }
  
  console.log("All extraction methods failed, returning original slug");
  return slug; // Return original slug if parsing fails
}

/**
 * Extract episode ID from a slug
 * @param slug The URL slug
 * @returns The extracted episode ID
 */
export function getEpisodeIdFromSlug(slug: string): string {
  // Format of slug: episode-2-1-tap-1
  // We need to extract episode-2-1
  const regex = /^(episode-[\d-]+)/;
  const match = slug.match(regex);
  
  if (match && match[1]) {
    // Handle case with multiple hyphens in ID (episode-2-1)
    // Find position of "tap" in slug and get the part before it
    const tapIndex = slug.indexOf('-tap-');
    if (tapIndex > 0) {
      console.log("Episode ID by tap index:", slug.substring(0, tapIndex));
      return slug.substring(0, tapIndex);
    }
    
    console.log("Episode regex match found:", match[1]);
    return match[1];
  }
  
  console.log("Episode regex match not found, trying fallback");
  // Fallback: get the first parts of the slug
  const parts = slug.split('-');
  if (parts.length >= 2) {
    console.log("Episode fallback returning:", parts[0] + '-' + parts[1]);
    return parts[0] + '-' + parts[1];
  }
  
  console.log("All episode extraction methods failed, returning original slug");
  return slug;
}