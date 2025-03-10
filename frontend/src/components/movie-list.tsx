"use client"
import { useEffect, useMemo } from "react"
import Link from "next/link"
import MovieCard from "./movie-card"
import MovieCardSkeleton from "./movie-card-skeleton"
import { useMovie } from "@/app/providers/MovieContext"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "lucide-react"

interface Movie {
  id: number
  title: string
  rating: string
  views: number
  genre: string
  posterUrl: string
  releaseYear: number
  updatedAt: string
}

interface MovieListProps {
  title: string
  category: "new" | "hot" | "recommended"
}

export default function MovieList({ title, category }: MovieListProps) {
  const { movies, loading, selectedMovie, setSelectedMovie, fetchMovies } = useMovie()

  useEffect(() => {
    if (movies.length === 0) {
      fetchMovies()
    }
  }, [movies, fetchMovies])

  // Sắp xếp lại danh sách phim dựa trên category truyền vào
  const sortedMovies = useMemo(() => {
    const sorted = [...movies]
    switch (category) {
      case "new":
        sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        break
      case "hot":
        sorted.sort((a, b) => b.views - a.views)
        break
      case "recommended":
        sorted.sort((a, b) => Number.parseFloat(b.rating) - Number.parseFloat(a.rating))
        break
      default:
        console.log("Không có case nào khớp, category là:", category)
    }
    return sorted
  }, [movies, category])

  // Lấy 10 phim đầu tiên của danh sách đã sắp xếp
  const displayedMovies = sortedMovies.slice(0, 10)

  const handleSelectMovie = (movieId: number) => {
    setSelectedMovie(movieId)
  }

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link
          href={`/search?category=${category}`}
          className="flex items-center gap-1 text-primary hover:underline transition-all group"
        >
          <span>Ver más</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {loading
          ? Array.from({ length: 10 }).map((_, index) => <MovieCardSkeleton key={index} />)
          : displayedMovies.map((movie) => (
              <AnimatePresence key={movie.id}>
                <motion.div
                  onClick={() => handleSelectMovie(movie.id)}
                  className="relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <MovieCard movie={movie} />
                  {selectedMovie === movie.id && (
                    <motion.div
                      className="absolute inset-0 z-10 pointer-events-none"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            ))}
      </div>
      <div className="mt-6 text-center md:hidden">
        <Link
          href={`/search?category=${category}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Ver todo
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}

