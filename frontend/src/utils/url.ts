/**
 * URL generator utilities for the application
 */

/**
 * Generate a URL for a movie detail page
 * @param id The movie ID
 * @param title The movie title (will be slugified)
 * @returns The URL string
 */
export const generateMovieUrl = (id: string, title: string): string => {
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  return `/movie/${id}/${slug}`;
};

/**
 * Generate a URL for an episode detail page
 * @param movieId The parent movie/series ID
 * @param movieTitle The parent movie/series title (will be slugified)
 * @param episodeId The episode ID
 * @returns The URL string
 */
export const generateEpisodeUrl = (movieId: string, movieTitle: string, episodeId: string): string => {
  const slug = movieTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  return `/episode/${movieId}/${slug}/${episodeId}`;
};

export function createSlug(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
      .toLowerCase()
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }
  
  export function getIdFromSlug(slug: string): string {
    // Format của slug là: movie-4-ten-phim
    // Chúng ta cần lấy phần movie-4
    const regex = /^(movie-\d+)/;
    const match = slug.match(regex);
    
    if (match && match[1]) {
      console.log("Regex match found:", match[1]);
      return match[1];
    }
    
    console.log("Regex match not found, trying fallback");
    // Fallback: lấy các phần đầu tiên của chuỗi slug
    const parts = slug.split('-');
    if (parts.length >= 2) {
      console.log("Fallback returning:", parts[0] + '-' + parts[1]);
      return parts[0] + '-' + parts[1];
    }
    
    console.log("All extraction methods failed, returning original slug");
    return slug; // Trả về slug gốc nếu không phân tích được
  }
  
  export function getEpisodeIdFromSlug(slug: string): string {
    // Format của slug là: episode-2-1-tap-1
    // Chúng ta cần lấy phần episode-2-1
    const regex = /^(episode-[\d-]+)/;
    const match = slug.match(regex);
    
    if (match && match[1]) {
      // Xử lý trường hợp có nhiều dấu gạch ngang trong ID (episode-2-1)
      // Tìm vị trí của "tap" trong slug và lấy phần trước đó
      const tapIndex = slug.indexOf('-tap-');
      if (tapIndex > 0) {
        console.log("Episode ID by tap index:", slug.substring(0, tapIndex));
        return slug.substring(0, tapIndex);
      }
      
      console.log("Episode regex match found:", match[1]);
      return match[1];
    }
    
    console.log("Episode regex match not found, trying fallback");
    // Fallback: lấy các phần đầu tiên của slug
    const parts = slug.split('-');
    if (parts.length >= 2) {
      console.log("Episode fallback returning:", parts[0] + '-' + parts[1]);
      return parts[0] + '-' + parts[1];
    }
    
    console.log("All episode extraction methods failed, returning original slug");
    return slug;
  }
  
  export function generateWatchUrl(movieId: string, movieTitle: string, episodeId: string, episodeNumber: number): string {
    return `/watch/${movieId}-${createSlug(movieTitle)}/episode/${episodeId}-tap-${episodeNumber}`;
  }