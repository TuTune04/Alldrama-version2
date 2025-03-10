// app/watch/[id]/[episode]/page.tsx
import Head from "next/head";
import MetaTags from "@/components/MetaTags";
import WatchPageClient from "./WatchPageClient";

interface Episode {
  episodeNumber: number;
  videoUrl: string;
  // include other properties as needed
}

export async function generateMetadata(context: {
  params: Promise<{ id: string; episode: string }>;
}) {
  const { id, episode } = await context.params;
  const res = await fetch(`https://alldramaz.com/api/movies/${id}`);
  const movie = res.ok ? await res.json() : null;

  return {
    title: movie?.title || "Tên phim mặc định",
    description: movie?.summary || "Mô tả phim mặc định",
    openGraph: {
      title: movie?.title || "Tên phim mặc định",
      description: movie?.summary || "Mô tả phim mặc định",
      images: movie?.posterUrl
        ? [movie.posterUrl]
        : ["/placeholder.svg?height=1080&width=1920"],
      url: `https://alldrama.net/watch/${id}/${episode}`,
      type: "video.movie",
    },
  };
}

export default async function WatchPage(context: {
  params: Promise<{ id: string; episode: string }>;
}) {
  const { id, episode } = await context.params;
  const currentUrl = `https://alldrama.net/watch/${id}/${episode}`;

  // Fetch dữ liệu phim từ API
  const res = await fetch(`https://alldramaz.com/api/movies/${id}`);
  const movie = res.ok ? await res.json() : null;

  // Xác định initialVideoSrc: ban đầu lấy từ trailerUrl,
  // nếu có danh sách episodes thì lấy videoUrl của tập được chọn
  let initialVideoSrc = movie?.trailerUrl || null;
  if (movie) {
    try {
      const episodesRes = await fetch(`https://alldramaz.com/api/episodes/movie/${movie.id}`);
      if (episodesRes.ok) {
        const episodes: Episode[] = await episodesRes.json();
        const selectedEpisode = episodes.find(
          (ep: Episode) => ep.episodeNumber === Number(episode)
        );
        if (selectedEpisode) {
          initialVideoSrc = selectedEpisode.videoUrl;
        }
      }
    } catch (error) {
      console.error("Error fetching episodes", error);
    }
  }

  return (
    <>
      <Head>
        {/* Meta tags được render từ server */}
        <MetaTags movie={movie} currentUrl={currentUrl} />
        {/* Thêm preload cho video chính nếu có */}
        {initialVideoSrc && (
          <link rel="preload" as="video" href={initialVideoSrc} type="video/mp4" />
        )}
      </Head>
      {/* Truyền movieId, episodeNumber, initialVideoSrc và initialMovie sang WatchPageClient */}
      <WatchPageClient
        movieId={Number(id)}
        episodeNumber={Number(episode)}
        initialVideoSrc={initialVideoSrc}
        initialMovie={movie}
      />
    </>
  );
}
