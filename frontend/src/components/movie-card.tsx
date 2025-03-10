"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

interface MovieCardProps {
  movie: {
    id: number
    title: string
    rating: string
    posterUrl: string
    releaseYear: number
    genre: string
  }
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const handleClick = () => {
    router.push(`/movie/${movie.id}`)
  }
  return (
    <Card
      className="relative overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer w-full sm:w-[200px] md:w-[220px] lg:w-[260px] xl:w-[300px] aspect-[2/3]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <CardContent className="p-0 w-full h-full">
        <div className="relative w-full h-full">
          <Image
            src={movie.posterUrl || "/placeholder.svg"}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 200px, (max-width: 1024px) 220px, (max-width: 1280px) 260px, 300px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-100">
            <div className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ease-in-out">
              <h3 className="text-lg font-semibold mb-1 line-clamp-2">{movie.title}</h3>
              <div className="flex items-center mb-2">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span>{movie.rating}</span>
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isHovered ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-sm mb-2">
                  {movie.releaseYear} • {movie.genre}
                </p>
                <Link href={`/movie/${movie.id}`}>
                  <Button size="sm" className="w-full">
                    Ver ahora
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

