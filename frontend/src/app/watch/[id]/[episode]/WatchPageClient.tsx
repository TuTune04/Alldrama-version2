// app/watch/[id]/[episode]/WatchPageClient.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { VideoPlayer } from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useMovie, type Movie } from "@/app/providers/MovieContext";
import { VerticalCarousel } from "@/components/vertical-carousel";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface EpisodeAPI {
  id: number;
  movieId: number;
  episodeNumber: number;
  videoUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface CommentAPI {
  id: number;
  movieId: number;
  userId: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

interface WatchPageClientProps {
  movieId: number;
  episodeNumber: number;
  initialVideoSrc?: string;
  initialMovie?: Movie | null;
}

export default function WatchPageClient({
  movieId,
  episodeNumber,
  initialVideoSrc,
  initialMovie = null,
}: WatchPageClientProps) {
  const { movies, fetchMovies } = useMovie();
  const { data: session } = useSession();

  // Khởi tạo movie từ props nếu có, nếu không sẽ được lấy từ MovieContext
  const [movie, setMovie] = useState<Movie | null>(initialMovie);
  const [apiEpisodes, setApiEpisodes] = useState<EpisodeAPI[]>([]);
  const [apiComments, setApiComments] = useState<CommentAPI[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(episodeNumber);
  const [comment, setComment] = useState("");
  const [videoSize, setVideoSize] = useState<"normal" | "fullscreen">("normal");
  const [showCursor, setShowCursor] = useState(true);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportIssue, setReportIssue] = useState("");
  const [isFullTitleVisible, setIsFullTitleVisible] = useState(false);
  const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // State giữ URL video chính, khởi tạo từ initialVideoSrc
  const [currentVideoSrc, setCurrentVideoSrc] = useState<string | null>(
    initialVideoSrc || null
  );

  // Ref giữ các movieId đã cập nhật vào watch history
  const updatedMovieIdsRef = useRef<Set<number>>(new Set());

  // Hàm cập nhật watch history
  const updateWatchHistory = useCallback(
    async (movieId: number) => {
      if (!session) return;
      try {
        await axios.post(
          "https://alldramaz.com/api/user-watch-histories",
          { movieId },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.token}`,
            },
          }
        );
        console.log("Watch history updated for movieId:", movieId);
      } catch (error) {
        console.error("Error updating watch history:", error);
      }
    },
    [session]
  );

  // Cập nhật watch history khi có movie và session
  useEffect(() => {
    if (movie && session && !updatedMovieIdsRef.current.has(movie.id)) {
      updateWatchHistory(movie.id);
      updatedMovieIdsRef.current.add(movie.id);
    }
  }, [movie, session, updateWatchHistory]);

  // Hiển thị/ẩn con trỏ khi di chuyển chuột
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowCursor(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowCursor(false), 3000);
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  // Lấy dữ liệu phim từ MovieContext hoặc fetch nếu cần
  useEffect(() => {
    if (!movie) {
      const found = movies.find((m) => m.id === movieId);
      if (found) {
        setMovie(found);
      }
    }
    if (movies.length === 0) {
      fetchMovies();
    }
  }, [movieId, movie, movies, fetchMovies]);

  // Fetch danh sách các tập của phim
  useEffect(() => {
    if (!movie) return;
    axios
      .get(`https://alldramaz.com/api/episodes/movie/${movie.id}`)
      .then((response) => {
        setApiEpisodes(response.data);
      })
      .catch((error) => {
        console.error("Error fetching episodes:", error);
      });
  }, [movie]);

  // Fetch danh sách bình luận của phim
  useEffect(() => {
    if (!movie) return;
    axios
      .get(`https://alldramaz.com/api/movie-comments/movie/${movie.id}`)
      .then((response) => {
        setApiComments(response.data);
      })
      .catch((error) => {
        console.error("Error fetching comments:", error);
      });
  }, [movie]);

  // Cập nhật currentVideoSrc khi danh sách episodes hoặc tập được chọn thay đổi
  useEffect(() => {
    const selectedEpisodeData = apiEpisodes.find(
      (ep) => ep.episodeNumber === selectedEpisode
    );
    if (selectedEpisodeData) {
      setCurrentVideoSrc(selectedEpisodeData.videoUrl);
      console.log("Selected episode updated:", selectedEpisodeData);
    }
  }, [apiEpisodes, selectedEpisode]);

  // Kiểm tra xem tiêu đề có bị tràn không
  useEffect(() => {
    const checkTitleOverflow = () => {
      if (titleRef.current) {
        setIsTitleOverflowing(
          titleRef.current.scrollHeight > titleRef.current.clientHeight
        );
      }
    };
    checkTitleOverflow();
    window.addEventListener("resize", checkTitleOverflow);
    return () => {
      window.removeEventListener("resize", checkTitleOverflow);
    };
  }, []);

  const handleNextEpisode = () => {
    if (movie && selectedEpisode < movie.totalEpisodes) {
      setSelectedEpisode(selectedEpisode + 1);
    }
  };

  const handlePostComment = async () => {
    if (!session) {
      console.error("User is not logged in");
      return;
    }
    if (!movie) return;
    try {
      const response = await axios.post(
        "https://alldramaz.com/api/movie-comments",
        {
          movieId: movie.id,
          comment: comment,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
        }
      );
      console.log("Comment posted successfully:", response.data);
      setApiComments((prev) => [...prev, response.data]);
      setComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const similarMovies = movie
    ? movies.filter(
        (m) =>
          m.id !== movie.id &&
          m.genre.toLowerCase() === movie.genre.toLowerCase()
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div
        className={`${
          videoSize === "normal"
            ? "flex justify-center items-center w-full my-4"
            : "fixed inset-0 z-50 bg-black flex items-center justify-center"
        }`}
        style={{ cursor: showCursor ? "auto" : "none" }}
      >
        {/* Sử dụng VideoPlayer dựa trên Video.js */}
        <VideoPlayer
          src={currentVideoSrc || "/placeholder.svg?height=1080&width=1920"}
          poster={movie?.posterUrl || "/placeholder.svg?height=1080&width=1920"}
          onNext={handleNextEpisode}
          hasNextEpisode={movie ? selectedEpisode < movie.totalEpisodes : false}
          videoSize={videoSize}
          setVideoSize={setVideoSize}
        />
      </div>

      {videoSize !== "fullscreen" && (
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-gray-800 border-gray-700 mb-8">
                <CardContent className="p-6">
                  <h1
                    ref={titleRef}
                    className={`text-3xl font-bold mb-2 ${
                      isFullTitleVisible ? "" : "line-clamp-3"
                    }`}
                  >
                    {movie?.title}
                  </h1>
                  {isTitleOverflowing && (
                    <Button
                      variant="link"
                      onClick={() => setIsFullTitleVisible(!isFullTitleVisible)}
                      className="p-0 h-auto font-normal text-blue-400"
                    >
                      {isFullTitleVisible ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Colapsar
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          Leer más
                        </>
                      )}
                    </Button>
                  )}
                  <h2 className="text-xl text-gray-300 mb-4">
                    Episodio {selectedEpisode}
                  </h2>
                  <p className="text-gray-400">{movie?.summary}</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 mb-8">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Episodios</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie &&
                      Array.from({ length: movie.totalEpisodes }, (_, i) => i + 1).map(
                        (num) => (
                          <Button
                            key={num}
                            variant={selectedEpisode === num ? "default" : "outline"}
                            onClick={() => setSelectedEpisode(num)}
                            className={`min-w-[48px] ${
                              selectedEpisode === num
                                ? "bg-red-600 hover:bg-red-700"
                                : ""
                            }`}
                          >
                            {num}
                          </Button>
                        )
                      )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Comentarios</h3>
                    <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Reportar problema
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Reportar un problema</DialogTitle>
                          <DialogDescription>
                            Describe el problema que estás experimentando. Lo revisaremos lo antes posible.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <Textarea
                            placeholder="Describe el problema..."
                            value={reportIssue}
                            onChange={(e) => setReportIssue(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            onClick={() => {
                              console.log("Reporte enviado:", reportIssue);
                              setIsReportDialogOpen(false);
                              setReportIssue("");
                            }}
                          >
                            Enviar reporte
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="flex gap-2 mb-6">
                    <Input
                      placeholder="Añadir un comentario..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === " ") e.stopPropagation();
                      }}
                      className="bg-gray-700 border-gray-600"
                    />
                    <Button className="bg-red-600 hover:bg-red-700" onClick={handlePostComment}>
                      Comentar
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {apiComments.map((c) => (
                      <div key={c.id} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold">Usuario anónimo</span>
                          <span className="text-sm text-gray-400">
                            {new Date(c.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p>{c.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="hidden lg:block">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">También te puede gustar</h3>
                  <VerticalCarousel movies={similarMovies} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
