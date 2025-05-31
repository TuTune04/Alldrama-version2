import { Metadata } from 'next';
import { Movie } from '@/types';

// Base configuration
const SITE_CONFIG = {
  name: 'AllDrama',
  title: 'AllDrama - Nền tảng xem phim trực tuyến hàng đầu',
  description: 'Khám phá hàng ngàn bộ phim và series chất lượng cao tại AllDrama. Xem phim miễn phí với phụ đề tiếng Việt, cập nhật liên tục các tác phẩm mới nhất.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://alldrama.com',
  ogImage: '/images/og-default.jpg',
  twitterHandle: '@alldrama',
  keywords: [
    'xem phim online',
    'phim hay',
    'series',
    'drama',
    'phim mới',
    'phim HD',
    'phụ đề việt',
    'AllDrama'
  ]
};

// Default metadata for the site
export const defaultMetadata: Metadata = {
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.name}`
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: 'AllDrama Team' }],
  creator: 'AllDrama',
  publisher: 'AllDrama',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_CONFIG.url),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} - Nền tảng xem phim trực tuyến`,
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    site: SITE_CONFIG.twitterHandle,
    creator: SITE_CONFIG.twitterHandle,
    images: [SITE_CONFIG.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
  },
};

// Generate metadata for movie pages
export function generateMovieMetadata(movie: Movie): Metadata {
  const title = `${movie.title} (${movie.releaseYear})`;
  const description = movie.summary || `Xem phim ${movie.title} chất lượng HD với phụ đề tiếng Việt tại AllDrama. ${movie.totalEpisodes} tập, thời lượng ${movie.duration} phút.`;
  const url = `${SITE_CONFIG.url}/movie/${movie.id}`;
  const imageUrl = movie.posterUrl || movie.backdropUrl || SITE_CONFIG.ogImage;
  
  // Generate keywords from movie data
  const movieKeywords = [
    movie.title,
    `phim ${movie.title}`,
    `xem ${movie.title}`,
    ...movie.genres?.map(genre => genre.name) || [],
    movie.releaseYear.toString(),
    'phim HD',
    'phụ đề việt'
  ];

  return {
    title,
    description,
    keywords: [...SITE_CONFIG.keywords, ...movieKeywords],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'video.movie',
      locale: 'vi_VN',
      url,
      title,
      description,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${movie.title} - Poster phim`,
        },
        ...(movie.backdropUrl && movie.backdropUrl !== imageUrl ? [{
          url: movie.backdropUrl,
          width: 1920,
          height: 1080,
          alt: `${movie.title} - Backdrop`,
        }] : [])
      ],
      videos: movie.trailerUrl ? [
        {
          url: movie.trailerUrl,
          width: 1280,
          height: 720,
          type: 'video/mp4',
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: SITE_CONFIG.twitterHandle,
      creator: SITE_CONFIG.twitterHandle,
      images: [imageUrl],
    },
    other: {
      // Movie-specific meta tags
      'movie:release_date': movie.releaseYear.toString(),
      'movie:duration': movie.duration?.toString() || '',
      'movie:rating': movie.rating?.toString() || '',
      'movie:genre': movie.genres?.map(g => g.name).join(', ') || '',
    },
  };
}

// Generate metadata for episode pages
export function generateEpisodeMetadata(movie: Movie, episodeNumber: number, episodeTitle?: string): Metadata {
  const title = `${movie.title} - Tập ${episodeNumber}${episodeTitle ? `: ${episodeTitle}` : ''}`;
  const description = `Xem tập ${episodeNumber} của ${movie.title} chất lượng HD với phụ đề tiếng Việt tại AllDrama.`;
  const url = `${SITE_CONFIG.url}/watch/${movie.id}?ep=${episodeNumber}`;
  const imageUrl = movie.backdropUrl || movie.posterUrl || SITE_CONFIG.ogImage;

  return {
    title,
    description,
    keywords: [
      ...SITE_CONFIG.keywords,
      movie.title,
      `${movie.title} tập ${episodeNumber}`,
      `xem ${movie.title}`,
      ...movie.genres?.map(genre => genre.name) || [],
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'video.episode',
      locale: 'vi_VN',
      url,
      title,
      description,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${movie.title} - Tập ${episodeNumber}`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: SITE_CONFIG.twitterHandle,
      creator: SITE_CONFIG.twitterHandle,
      images: [imageUrl],
    },
    other: {
      'video:series': movie.title,
      'video:episode': episodeNumber.toString(),
      'video:duration': movie.duration?.toString() || '',
    },
  };
}

// Generate metadata for search pages
export function generateSearchMetadata(query?: string, genre?: string): Metadata {
  let title = 'Tìm kiếm phim';
  let description = 'Tìm kiếm hàng ngàn bộ phim và series chất lượng cao tại AllDrama.';
  
  if (query) {
    title = `Kết quả tìm kiếm: "${query}"`;
    description = `Tìm kiếm phim "${query}" tại AllDrama. Khám phá các bộ phim và series liên quan.`;
  } else if (genre) {
    title = `Phim ${genre}`;
    description = `Xem các bộ phim ${genre} chất lượng cao tại AllDrama. Cập nhật liên tục các tác phẩm mới nhất.`;
  }

  const url = `${SITE_CONFIG.url}/search${query ? `?q=${encodeURIComponent(query)}` : ''}${genre ? `?genre=${encodeURIComponent(genre)}` : ''}`;

  return {
    title,
    description,
    keywords: [
      ...SITE_CONFIG.keywords,
      ...(query ? [query, `phim ${query}`, `xem ${query}`] : []),
      ...(genre ? [genre, `phim ${genre}`] : []),
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'vi_VN',
      url,
      title,
      description,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: SITE_CONFIG.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: SITE_CONFIG.twitterHandle,
      creator: SITE_CONFIG.twitterHandle,
      images: [SITE_CONFIG.ogImage],
    },
  };
}

// Generate JSON-LD structured data for movies
export function generateMovieJsonLd(movie: Movie) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    description: movie.summary,
    image: movie.posterUrl || movie.backdropUrl,
    datePublished: movie.releaseYear?.toString(),
    duration: movie.duration ? `PT${movie.duration}M` : undefined,
    aggregateRating: movie.rating ? {
      '@type': 'AggregateRating',
      ratingValue: movie.rating,
      ratingCount: movie.views || 1,
      bestRating: 10,
      worstRating: 1,
    } : undefined,
    genre: movie.genres?.map(g => g.name),
    url: `${SITE_CONFIG.url}/movie/${movie.id}`,
    potentialAction: {
      '@type': 'WatchAction',
      target: `${SITE_CONFIG.url}/watch/${movie.id}`,
    },
  };
}

// Generate JSON-LD structured data for website
export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    sameAs: [
      // Add social media links here
      // 'https://facebook.com/alldrama',
      // 'https://twitter.com/alldrama',
    ],
  };
} 