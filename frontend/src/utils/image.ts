/**
 * Utility functions for handling image URLs
 */

// Supported image formats
const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];

/**
 * Get the best available image format for a given URL
 * @param baseUrl - Base URL without extension
 * @param preferredFormats - Array of preferred formats in order
 * @returns Promise that resolves to the best available format
 */
export async function getBestImageFormat(
  baseUrl: string, 
  preferredFormats: string[] = ['webp', 'jpg', 'png']
): Promise<string> {
  for (const format of preferredFormats) {
    const testUrl = `${baseUrl}.${format}`;
    try {
      const response = await fetch(testUrl, { method: 'HEAD' });
      if (response.ok) {
        return testUrl;
      }
    } catch (error) {
      // Continue to next format
      continue;
    }
  }
  
  // Fallback to first preferred format if none work
  return `${baseUrl}.${preferredFormats[0]}`;
}

/**
 * Extract file extension from URL
 * @param url - Image URL
 * @returns File extension or null
 */
function getImageExtension(url: string): string | null {
  const match = url.match(/\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?|$)/i);
  return match ? match[1].toLowerCase() : null;
}

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
    // Check if posterUrl already has an extension
    const extension = getImageExtension(posterUrl);
    if (extension) {
      return `https://media.alldrama.tech/movies/${movieId}/poster.${extension}`;
    }
    
    // Try different formats - prefer webp for better compression
    const formats = ['webp', 'jpg', 'jpeg', 'png'];
    for (const format of formats) {
      const testUrl = `https://media.alldrama.tech/movies/${movieId}/poster.${format}`;
      // Return the first format (webp) as default, actual format detection would need async
      return testUrl;
    }
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
      // Check if backdropUrl already has an extension
      const extension = getImageExtension(backdropUrl);
      if (extension) {
        return `https://media.alldrama.tech/movies/${movieId}/backdrop.${extension}`;
      }
      
      // Try different formats for backdrop
      const formats = ['webp', 'jpg', 'jpeg', 'png'];
      return `https://media.alldrama.tech/movies/${movieId}/backdrop.${formats[0]}`;
    }
  }

  // Fallback to poster
  return getSafePosterUrl(posterUrl, movieId, fallback);
}

/**
 * Get image URL with proper error handling and format support
 * @param imageUrl - The image URL
 * @param movieId - Movie ID for constructing URL if needed
 * @param type - Type of image ('poster' | 'backdrop' | 'thumbnail')
 * @param fallback - Fallback image path
 * @param preferredFormat - Preferred image format
 * @returns A safe URL
 */
export function getImageUrl(
  imageUrl: string | null | undefined,
  movieId?: number | string,
  type: 'poster' | 'backdrop' | 'thumbnail' = 'poster',
  fallback: string = "/placeholder.svg",
  preferredFormat: string = 'webp'
): string {
  if (!imageUrl || imageUrl.trim() === '') {
    return fallback;
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  if (movieId) {
    // Check if imageUrl already has an extension
    const extension = getImageExtension(imageUrl);
    if (extension) {
      return `https://media.alldrama.tech/movies/${movieId}/${type}.${extension}`;
    }
    
    // Use preferred format or default to webp
    const format = SUPPORTED_FORMATS.includes(preferredFormat) ? preferredFormat : 'webp';
    return `https://media.alldrama.tech/movies/${movieId}/${type}.${format}`;
  }

  return imageUrl.startsWith('/') ? imageUrl : fallback;
}

/**
 * Get multiple image URLs with different formats for fallback
 * @param movieId - Movie ID
 * @param type - Type of image
 * @param formats - Array of formats to try
 * @returns Array of URLs to try in order
 */
export function getImageUrlsWithFallback(
  movieId: number | string,
  type: 'poster' | 'backdrop' | 'thumbnail' = 'poster',
  formats: string[] = ['webp', 'jpg', 'jpeg', 'png']
): string[] {
  return formats.map(format => 
    `https://media.alldrama.tech/movies/${movieId}/${type}.${format}`
  );
}

/**
 * Create a picture element source set for responsive images
 * @param movieId - Movie ID
 * @param type - Type of image
 * @param sizes - Object with size breakpoints
 * @returns Object with srcSet and sizes for picture element
 */
export function createResponsiveImageSources(
  movieId: number | string,
  type: 'poster' | 'backdrop' | 'thumbnail' = 'poster',
  sizes: { [key: string]: string } = {
    '(max-width: 640px)': 'sm',
    '(max-width: 1024px)': 'md',
    '(min-width: 1025px)': 'lg'
  }
) {
  const baseUrl = `https://media.alldrama.tech/movies/${movieId}`;
  
  return {
    webp: {
      srcSet: Object.entries(sizes).map(([media, size]) => 
        `${baseUrl}/${type}-${size}.webp`
      ).join(', '),
      type: 'image/webp'
    },
    jpg: {
      srcSet: Object.entries(sizes).map(([media, size]) => 
        `${baseUrl}/${type}-${size}.jpg`
      ).join(', '),
      type: 'image/jpeg'
    },
    fallback: `${baseUrl}/${type}.jpg`
  };
} 