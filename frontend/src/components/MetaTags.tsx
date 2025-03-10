// components/MetaTags.tsx
interface MetaTagsProps {
    movie: {
      title: string;
      summary: string;
      posterUrl: string;
    } | null;
    currentUrl: string;
  }
  
  export default function MetaTags({ movie, currentUrl }: MetaTagsProps) {
    return (
      <>
        <meta property="og:title" content={movie?.title || "Tên phim mặc định"} />
        <meta
          property="og:description"
          content={movie?.summary || "Mô tả phim mặc định"}
        />
        <meta
          property="og:image"
          content={movie?.posterUrl || "/placeholder.svg?height=1080&width=1920"}
        />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="video.movie" />
      </>
    );
  }
  