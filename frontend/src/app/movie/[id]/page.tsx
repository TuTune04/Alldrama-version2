"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Heart, PlayCircle, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useMovie } from "@/app/providers/MovieContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";

interface MovieDetailData {
  id: number;
  title: string;
  rating: string;
  views: number;
  genre: string;
  summary: string;
  duration: number;
  totalEpisodes: number;
  releaseYear: number;
  posterUrl: string;
  trailerUrl: string;
  status: string;
}

export default function MovieDetail() {
  const { data: session, status } = useSession();
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<MovieDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [openTrailer, setOpenTrailer] = useState(false);
  const { movies, fetchMovies } = useMovie();
  const [isCollected, setIsCollected] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const { toast } = useToast();

  // Obtener la lista de películas desde el contexto
  useEffect(() => {
    fetchMovies();
  }, []);

  // Obtener la información de la película basada en el id de la URL
  useEffect(() => {
    if (!id) return;
    const fetchMovie = async () => {
      try {
        const response = await axios.get<MovieDetailData>(`https://alldramaz.com/api/movies/${id}`);
        setMovie(response.data);
      } catch (error) {
        console.error("Error al obtener la película:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  // Verificar la altura de la descripción para mostrar "Leer más/Colapsar"
  useEffect(() => {
    if (descriptionRef.current) {
      const lineHeight = Number.parseInt(window.getComputedStyle(descriptionRef.current).lineHeight);
      const maxHeight = lineHeight * 6;
      setIsDescriptionExpanded(descriptionRef.current.scrollHeight > maxHeight);
    }
  }, []);

  // Verificar si la película ya está en favoritos mediante la lista de favoritos del usuario
  useEffect(() => {
    // Ejecutar solo cuando el estado no sea "loading"
    if (status !== "loading") {
      // Si el usuario no ha iniciado sesión, por defecto la película no está en favoritos
      if (status !== "authenticated") {
        setIsCollected(false);
        return;
      }
      if (movie) {
        // Obtener el token de la sesión
        const token = session?.token;
        if (!token) {
          console.warn("Falta el token en la sesión");
          return;
        }
        axios
          .get("https://alldramaz.com/api/user-favorites", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            const favorites = response.data; // Este es el arreglo de elementos en favoritos
            const found = favorites.some((fav: { movieId: number }) => fav.movieId === movie.id);
            setIsCollected(found);
          })
          .catch((error) => {
            console.error("Error al obtener los favoritos del usuario:", error);
          });
      }
    }
  }, [status, session, movie]);

  const handlePlayVideo = () => {
    if (movie?.id) {
      router.push(`/watch/${movie.id}/${selectedEpisode}`);
    }
  };

  // Manejar el botón de Favoritos: si no está guardada, se llama a POST para añadir; si ya está, se llama a DELETE para eliminar
  const handleCollectToggle = async () => {
    if (status !== "authenticated") {
      toast({
        title: "No autorizado",
        description: "Por favor, inicia sesión para agregar a favoritos.",
        variant: "destructive",
      });
      return;
    }
    const token = session?.token;
    if (!token) {
      toast({
        title: "Error",
        description: "Falta el token.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!isCollected) {
        await axios.post(
          "https://alldramaz.com/api/user-favorites",
          { movieId: movie?.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsCollected(true);
        toast({
          title: "Añadido a favoritos",
          description: "Película agregada a tus favoritos.",
          variant: "default",
        });
      } else {
        await axios.delete(`https://alldramaz.com/api/user-favorites/movie/${movie?.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsCollected(false);
        toast({
          title: "Eliminado de favoritos",
          description: "Película eliminada de tus favoritos.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error al actualizar favoritos:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar los favoritos.",
        variant: "destructive",
      });
    }
  };

  if (loading || !movie) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Cargando...Si tarda mucho tiempo, haga clic en recargar</p>
      </div>
    );
  }

  const topMovies = movies
    .filter((m) => m.id !== movie.id)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const recommendedMovies = movies
    .filter((m) => m.id !== movie.id && m.genre.toLowerCase() === movie.genre.toLowerCase())
    .slice(0, 8);

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
        <Toaster />
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Lado izquierdo - Póster */}
            <div className="xl:w-[560px] flex-shrink-0">
              <div className="relative w-full xl:w-[560px] aspect-[4/5]">
                <Image
                  src={movie.posterUrl || "/placeholder.svg?height=560&width=800"}
                  alt={movie.title}
                  fill
                  className="rounded-lg object-cover"
                  priority
                />
              </div>
            </div>

            {/* Contenido central y derecho */}
            <div className="flex-1 flex flex-col xl:flex-row gap-8">
              {/* Contenido central */}
              <div className="flex-1 space-y-6">
                <h1 className="text-2xl sm:text-3xl font-bold">{movie.title}</h1>

                {/* Etiquetas de estado */}
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">VIP</Badge>
                  <Badge className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">{movie.genre}</Badge>
                  <Badge variant="outline">{movie.releaseYear}</Badge>
                  <Badge variant="outline">{movie.duration} min</Badge>
                </div>

                {/* Estadísticas de la película */}
                <div className="text-gray-400 space-y-2 text-sm sm:text-base">
                  <p>Total de episodios: {movie.totalEpisodes}</p>
                  <p>Estado: {movie.status || "Finalizada"}</p>
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-400 w-5 h-5" />
                    <span>{Number(movie.rating).toFixed(1)}</span>
                    <span>({movie.views} visualizaciones)</span>
                  </div>
                </div>

                {/* Descripción */}
                <div className="relative">
                  <p
                    ref={descriptionRef}
                    className={`text-gray-300 leading-relaxed text-sm lg:text-base ${
                      !isDescriptionExpanded ? "line-clamp-6" : ""
                    }`}
                  >
                    {movie.summary}
                  </p>
                  {isDescriptionExpanded && (
                    <Button
                      variant="link"
                      className="text-purple-400 mt-2"
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    >
                      {isDescriptionExpanded ? (
                        <>
                          Colapsar <ChevronUp className="ml-1 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Leer más <ChevronDown className="ml-1 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 lg:px-8" onClick={handlePlayVideo}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Ver ahora
                  </Button>
                  <Dialog open={openTrailer} onOpenChange={setOpenTrailer}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
                        Ver tráiler
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>{movie.title} - Tráiler</DialogTitle>
                        <DialogDescription>¡Disfruta del tráiler!</DialogDescription>
                      </DialogHeader>
                      <div className="aspect-video">
                        <video controls src={movie.trailerUrl} className="w-full h-full" />
                      </div>
                      <DialogClose asChild>
                        <Button className="mt-4">Cerrar</Button>
                      </DialogClose>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    className={`border-purple-500 text-purple-400 hover:bg-purple-500/10 ${isCollected ? "bg-purple-500/20" : ""}`}
                    onClick={handleCollectToggle}
                  >
                    <Heart className={`mr-2 h-4 w-4 ${isCollected ? "fill-purple-400" : ""}`} />
                    {isCollected ? "Guardado" : "Guardar"}
                  </Button>
                </div>

                {/* Lista de episodios */}
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Lista de episodios</h2>
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                      {Array.from({ length: movie.totalEpisodes || 63 }, (_, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className={`w-full justify-center px-2 ${
                            selectedEpisode === i + 1
                              ? "bg-purple-500/20 border-purple-500 text-purple-400"
                              : "hover:bg-purple-500/10"
                          }`}
                          onClick={() => {
                            setSelectedEpisode(i + 1);
                            router.push(`/watch/${movie.id}/${i + 1}`);
                          }}
                        >
                          <span className="sm:hidden">{i + 1}</span>
                          <span className="hidden sm:inline">Ep {i + 1}</span>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Barra lateral derecha - Rankings */}
              <div className="hidden xl:block xl:w-[300px] flex-shrink-0">
                <Card className="bg-gray-800 border-none sticky top-6">
                  <CardContent className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Top 10 en visualizaciones</h2>
                    <div className="space-y-4">
                      {topMovies.map((m, index) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 p-2 rounded-lg"
                          onClick={() => router.push(`/movie/${m.id}`)}
                        >
                          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                          <div className="flex-1">
                            <p className="font-medium truncate">{m.title.split(" ").slice(0, 4).join(" ")}{m.title.split(" ").length > 4 ? "..." : ""}</p>
                            <p className="text-sm text-gray-400">{m.views} visualizaciones</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Películas recomendadas */}
          {recommendedMovies.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Películas recomendadas</h2>
              <Carousel className="w-full">
                <CarouselContent className="-ml-2 md:-ml-4">
                  {recommendedMovies.map((recMovie) => (
                    <CarouselItem key={recMovie.id} className="pl-2 md:pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/6">
                      <div className="cursor-pointer" onClick={() => router.push(`/movie/${recMovie.id}`)}>
                        <Image
                          src={recMovie.posterUrl || "/placeholder.svg"}
                          alt={recMovie.title}
                          width={150}
                          height={225}
                          className="rounded-lg object-cover w-full h-[325px]"
                        />
                        <p className="text-sm mt-2 truncate">{recMovie.title}</p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          )}

          {/* Sección de reseñas */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Reseñas de la película</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer ${star <= userRating ? "text-yellow-400" : "text-gray-400"}`}
                    onClick={() => setUserRating(star)}
                  />
                ))}
              </div>
              <Textarea
                placeholder="Comparte tus opiniones sobre la película..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px] bg-gray-800 border-gray-700"
              />
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  toast({
                    title: "Reseña enviada",
                    description: "¡Gracias por tus comentarios!",
                    duration: 3000,
                  });
                  setUserRating(0);
                  setComment("");
                }}
              >
                Enviar reseña
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
