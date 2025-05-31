/**
 * Utility functions for handling image URLs
 */

/**
 * Get a safe poster URL that won't cause ReactDOM.preload errors
 * @param posterUrl - The original poster URL from the movie data
 * @param movieId - The movie ID for constructing the URL
 * @param fallback - Fallback image path (default: "/placeholder.svg")
 * @returns A safe URL that can be used with next/image
 */
export function getSafePosterUrl(
  posterUrl: string | null | undefined, 
  movieId?: number | string,
  fallback: string = "/placeholder.svg"
): string {
  // Check if posterUrl is valid and not empty
  if (!posterUrl || posterUrl.trim() === '') {
    return fallback;
  }

  // If it's already a full URL, return it
  if (posterUrl.startsWith('http://') || posterUrl.startsWith('https://')) {
    return posterUrl;
  }

  // If we have a movieId, construct the full URL
  if (movieId) {
    return `https://media.alldrama.tech/movies/${movieId}/poster.png`;
  }

  // If it's a relative path, return it as is
  if (posterUrl.startsWith('/')) {
    return posterUrl;
  }

  // Default fallback
  return fallback;
}

/**
 * Get a safe backdrop URL
 * @param backdropUrl - The original backdrop URL
 * @param posterUrl - Fallback to poster URL if backdrop is not available
 * @param movieId - The movie ID for constructing URLs
 * @param fallback - Final fallback image path
 * @returns A safe URL that can be used with next/image
 */
export function getSafeBackdropUrl(
  backdropUrl: string | null | undefined,
  posterUrl: string | null | undefined,
  movieId?: number | string,
  fallback: string = "/placeholder.svg"
): string {
  // Try backdrop first
  if (backdropUrl && backdropUrl.trim() !== '') {
    if (backdropUrl.startsWith('http://') || backdropUrl.startsWith('https://')) {
      return backdropUrl;
    }
    if (movieId) {
      return `https://media.alldrama.tech/movies/${movieId}/backdrop.png`;
    }
  }

  // Fallback to poster
  return getSafePosterUrl(posterUrl, movieId, fallback);
}

/**
 * Get image URL with proper error handling
 * @param imageUrl - The image URL
 * @param movieId - Movie ID for constructing URL if needed
 * @param type - Type of image ('poster' | 'backdrop' | 'thumbnail')
 * @param fallback - Fallback image path
 * @returns A safe URL
 */
export function getImageUrl(
  imageUrl: string | null | undefined,
  movieId?: number | string,
  type: 'poster' | 'backdrop' | 'thumbnail' = 'poster',
  fallback: string = "/placeholder.svg"
): string {
  if (!imageUrl || imageUrl.trim() === '') {
    return fallback;
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  if (movieId) {
    return `https://media.alldrama.tech/movies/${movieId}/${type}.png`;
  }

  return imageUrl.startsWith('/') ? imageUrl : fallback;
} 