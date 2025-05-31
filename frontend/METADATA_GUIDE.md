# Hướng dẫn Metadata và Social Sharing cho AllDrama

## Tổng quan

Hệ thống metadata của AllDrama được thiết kế để tối ưu hóa SEO và social media sharing. Khi người dùng chia sẻ link website trên các nền tảng như Facebook, Twitter, Discord, v.v., sẽ hiển thị preview đẹp mắt với thông tin phù hợp.

## Cấu trúc Files

```
frontend/
├── src/
│   ├── lib/
│   │   └── metadata.ts          # Utility functions cho metadata
│   └── app/
│       ├── layout.tsx           # Global metadata và structured data
│       ├── page.tsx             # Homepage metadata
│       ├── movie/
│       │   ├── page.tsx         # Movie list metadata
│       │   └── [slug]/
│       │       └── page.tsx     # Dynamic movie detail metadata
│       ├── watch/
│       │   └── [slug]/
│       │       └── page.tsx     # Watch page metadata
│       └── search/
│           └── page.tsx         # Search page metadata
└── public/
    └── images/
        └── og-default.jpg       # Default Open Graph image
```

## Các loại Metadata được hỗ trợ

### 1. Open Graph (Facebook, Discord, LinkedIn)
- **og:title**: Tiêu đề hiển thị khi chia sẻ
- **og:description**: Mô tả ngắn gọn
- **og:image**: Ảnh preview (1200x630px)
- **og:type**: Loại nội dung (website, video.movie, video.episode)
- **og:url**: URL canonical
- **og:site_name**: Tên website

### 2. Twitter Cards
- **twitter:card**: Loại card (summary_large_image)
- **twitter:title**: Tiêu đề
- **twitter:description**: Mô tả
- **twitter:image**: Ảnh preview
- **twitter:site**: Handle Twitter của website

### 3. SEO Meta Tags
- **title**: Tiêu đề trang
- **description**: Meta description
- **keywords**: Từ khóa SEO
- **canonical**: URL chính thức
- **robots**: Hướng dẫn cho search engines

### 4. Structured Data (JSON-LD)
- **Website**: Thông tin website và search action
- **Movie**: Thông tin chi tiết phim theo schema.org
- **AggregateRating**: Đánh giá và lượt xem

## Cách sử dụng

### 1. Global Metadata (layout.tsx)
```typescript
import { defaultMetadata } from '@/lib/metadata';

export const metadata: Metadata = defaultMetadata;
```

### 2. Dynamic Movie Metadata
```typescript
import { generateMovieMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const movie = await fetchMovieData(params.slug);
  return generateMovieMetadata(movie);
}
```

### 3. Episode Metadata
```typescript
import { generateEpisodeMetadata } from '@/lib/metadata';

const metadata = generateEpisodeMetadata(movie, episodeNumber, episodeTitle);
```

### 4. Search Metadata
```typescript
import { generateSearchMetadata } from '@/lib/metadata';

const metadata = generateSearchMetadata(query, genre);
```

## Cấu hình Environment Variables

Tạo file `.env.local`:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://alldrama.com
NEXT_PUBLIC_TWITTER_HANDLE=@alldrama

# SEO Verification
GOOGLE_VERIFICATION=your-google-verification-code
YANDEX_VERIFICATION=your-yandex-verification-code

# Optional
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_IMAGE_CDN=https://cdn.alldrama.com
```

## Tạo Open Graph Images

### Default Image
- **Kích thước**: 1200x630px
- **Format**: JPG hoặc PNG
- **Dung lượng**: Dưới 1MB
- **Nội dung**: Logo AllDrama, tagline, background hấp dẫn

### Movie Images
- Sử dụng `movie.backdropUrl` hoặc `movie.posterUrl`
- Fallback về default image nếu không có

### Công cụ tạo ảnh
- [Canva](https://canva.com) - Templates có sẵn
- [Figma](https://figma.com) - Design tự do
- [OG Image Generator](https://og-image.vercel.app/) - Tự động

## Testing Metadata

### 1. Facebook Debugger
- URL: https://developers.facebook.com/tools/debug/
- Paste URL và click "Debug"
- Xem preview và fix lỗi nếu có

### 2. Twitter Card Validator
- URL: https://cards-dev.twitter.com/validator
- Paste URL và xem preview

### 3. LinkedIn Post Inspector
- URL: https://www.linkedin.com/post-inspector/
- Kiểm tra preview trên LinkedIn

### 4. Discord
- Paste URL trực tiếp vào Discord channel
- Xem preview tự động

## Ví dụ Preview

### Homepage
```
🎬 AllDrama - Nền tảng xem phim trực tuyến hàng đầu
Khám phá hàng ngàn bộ phim và series chất lượng cao tại AllDrama...
[Default OG Image]
```

### Movie Detail
```
🎬 Tên Phim (2024) | AllDrama
Xem phim [Tên Phim] chất lượng HD với phụ đề tiếng Việt...
[Movie Poster/Backdrop]
```

### Episode
```
🎬 Tên Phim - Tập 5 | AllDrama
Xem tập 5 của [Tên Phim] chất lượng HD với phụ đề tiếng Việt...
[Movie Backdrop]
```

### Search Results
```
🔍 Kết quả tìm kiếm: "từ khóa" | AllDrama
Tìm kiếm phim "từ khóa" tại AllDrama. Khám phá các bộ phim...
[Default OG Image]
```

## Best Practices

### 1. Tiêu đề (Title)
- Độ dài: 50-60 ký tự
- Bao gồm từ khóa chính
- Có thương hiệu "AllDrama"
- Tránh duplicate

### 2. Mô tả (Description)
- Độ dài: 150-160 ký tự
- Mô tả rõ ràng, hấp dẫn
- Bao gồm call-to-action
- Unique cho mỗi trang

### 3. Hình ảnh
- Chất lượng cao, rõ nét
- Kích thước chuẩn 1200x630px
- Nội dung phù hợp với trang
- Có text overlay nếu cần

### 4. Keywords
- Liên quan đến nội dung
- Bao gồm từ khóa long-tail
- Không spam keywords
- Cập nhật theo trends

## Troubleshooting

### 1. Metadata không hiển thị
- Kiểm tra syntax HTML
- Verify Open Graph tags
- Clear cache của platform
- Sử dụng debugging tools

### 2. Ảnh không load
- Kiểm tra URL ảnh
- Verify CORS headers
- Đảm bảo ảnh accessible
- Fallback về default image

### 3. Title/Description bị cắt
- Kiểm tra độ dài
- Optimize cho mobile
- Test trên nhiều platform
- Adjust content length

## Monitoring và Analytics

### 1. Google Search Console
- Monitor search performance
- Track click-through rates
- Identify metadata issues

### 2. Social Media Analytics
- Facebook Insights
- Twitter Analytics
- Track social shares

### 3. Custom Tracking
- Implement share buttons
- Track social referrals
- Monitor engagement metrics

## Cập nhật và Bảo trì

### 1. Regular Updates
- Cập nhật metadata theo content mới
- Review và optimize titles/descriptions
- Update images khi cần

### 2. A/B Testing
- Test different titles
- Compare engagement rates
- Optimize based on data

### 3. Platform Changes
- Follow platform updates
- Adapt to new requirements
- Update implementation accordingly 