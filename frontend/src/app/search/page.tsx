"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, X } from "lucide-react";
import MovieCard from "@/components/movie-card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMovie } from "@/app/providers/MovieContext"; // Đảm bảo context cung cấp fetchMovies
import { Movie } from "@/app/providers/MovieContext";

const mockSuggestions = [
  "Presidente ejecutivo",
  "Renacimiento",
  "Histórico",
  "Viaje en el tiempo",
  "Comedia",
  "Juventud",
  "Drama",
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  // Dùng searchParams.toString() để re-render khi URL thay đổi
  const queryString = searchParams.toString();
  const initialQuery = searchParams.get("query") || "";
  const initialGenre = searchParams.get("genre") || "";
  const initialCategory = searchParams.get("category") || "relevance";

  const { movies, fetchMovies } = useMovie();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);
  const [sortBy, setSortBy] = useState(initialCategory);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const router = useRouter();

  // Gọi fetchMovies một lần khi component mount
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Cập nhật state từ URL mỗi khi query string thay đổi
  useEffect(() => {
    setSearchQuery(searchParams.get("query") || "");
    setSelectedGenre(searchParams.get("genre") || "");
    setSortBy(searchParams.get("category") || "relevance");
  }, [queryString, searchParams]);

  // Lọc kết quả theo searchQuery và selectedGenre, sau đó sắp xếp theo sortBy
  useEffect(() => {
    const filteredResults = movies.filter((movie) => {
      const matchesTitle = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre =
        selectedGenre === "" || movie.genre.toLowerCase() === selectedGenre.toLowerCase();
      return matchesTitle && matchesGenre;
    });
  
    const sortedResults = [...filteredResults];
    switch (sortBy) {
      case "year-desc":
        sortedResults.sort((a, b) => b.releaseYear - a.releaseYear);
        break;
      case "year-asc":
        sortedResults.sort((a, b) => a.releaseYear - b.releaseYear);
        break;
      case "new":
        // Sắp xếp theo phim mới cập nhật nhất (updatedAt giảm dần)
        sortedResults.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
      case "hot":
        // Sắp xếp theo phim có view nhiều nhất (views giảm dần)
        sortedResults.sort((a, b) => Number(b.views) - Number(a.views));
        break;
      case "recommended":
        // Sắp xếp theo phim có rating cao nhất (rating giảm dần)
        sortedResults.sort((a, b) => Number(b.rating) - Number(a.rating));
        break;
      default:
        // "relevance": giữ nguyên thứ tự lọc
        break;
    }
    setSearchResults(sortedResults);
  
    const filteredSuggestions = mockSuggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  }, [searchQuery, movies, selectedGenre, sortBy]);

  // Hàm xử lý thay đổi lựa chọn sắp xếp từ dropdown
  const handleSort = (value: string) => {
    setSortBy(value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Phần chính với thanh tìm kiếm */}
      <section className="bg-gradient-to-b from-primary/20 to-background py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Descubre tu próxima película favorita
          </h1>
          <div className="relative max-w-2xl mx-auto">
            <Input
              type="search"
              placeholder="Buscar películas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 text-lg py-6"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-12 top-1/2 transform -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
            <Button
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <SearchIcon className="h-5 w-5" />
            </Button>
          </div>
          {/* Gợi ý tự động cho tiêu đề tìm kiếm */}
          {suggestions.length > 0 && searchQuery && (
            <div className="max-w-2xl mx-auto mt-2 bg-background border rounded-md shadow-lg">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-accent cursor-pointer"
                  onClick={() => setSearchQuery(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
          {/* Bộ lọc theo thể loại */}
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Filtrar por género:</h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                key="All"
                variant={selectedGenre === "" ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setSelectedGenre("")}
              >
                Todos
              </Badge>
              {mockSuggestions.map((genre) => (
                <Badge
                  key={genre}
                  variant={
                    selectedGenre.toLowerCase() === genre.toLowerCase()
                      ? "default"
                      : "secondary"
                  }
                  className="cursor-pointer"
                  onClick={() => setSelectedGenre(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Kết quả tìm kiếm */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">
              🔍 {searchResults.length} resultados encontrados para &quot;{searchQuery}&quot;
              {selectedGenre && <span> en {selectedGenre}</span>}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Ordenar por:</span>
              <Select value={sortBy} onValueChange={handleSort}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Relevancia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevancia</SelectItem>
                  <SelectItem value="new">Novedades</SelectItem>
                  <SelectItem value="hot">Lo más visto</SelectItem>
                  <SelectItem value="recommended">Recomendados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {searchResults.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-2xl font-semibold mb-4">No se encontraron resultados</h3>
              <p className="text-muted-foreground mb-8">
                No pudimos encontrar ninguna película que coincida con tu búsqueda. Intenta con otras palabras clave o explora nuestras recomendaciones a continuación.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {mockSuggestions.map((genre) => (
                  <Badge
                    key={genre}
                    variant="secondary"
                    className="text-lg py-2 px-4 cursor-pointer"
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Gợi ý phim liên quan */}
      <section className="py-12 bg-accent/5">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6">También te puede gustar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {movies.slice(0, 6).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
