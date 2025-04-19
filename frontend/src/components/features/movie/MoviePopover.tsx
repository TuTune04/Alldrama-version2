'use client'

import Link from "next/link"
import Image from "next/image"
import type { Movie } from "@/types"
import { generateMovieUrl } from "@/utils/url"
import { Star, Play, Heart, Info, Calendar, Clock, Film, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useState, useRef } from "react"
import { useMobile } from '@/hooks/use-mobile'

interface MoviePopoverProps {
  movie: Movie
  trigger: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'simple'
  showPopover?: boolean
}

const MoviePopover = ({ 
  movie, 
  trigger, 
  size = 'md',
  variant = 'default',
  showPopover = true
}: MoviePopoverProps) => {
  const [open, setOpen] = useState(false)
  const isMobile = useMobile(1024)
  const isDesktop = !isMobile
  const triggerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const movieDetailUrl = generateMovieUrl(movie.id, movie.title)
  const watchUrl = generateMovieUrl(movie.id, movie.title)
  const imageUrl = movie.posterUrl || "/images/test.jpg"

  const sizeConfig = {
    sm: {
      width: 'w-72',
      titleSize: 'text-base',
      topClass: 'top-[-30px]',
      descriptionLines: 'line-clamp-2',
      showActors: false,
      showVersions: false
    },
    md: {
      width: 'w-68',
      titleSize: 'text-lg',
      topClass: 'top-[-20px]',
      descriptionLines: 'line-clamp-3',
      showActors: true,
      showVersions: true
    },
    lg: {
      width: 'w-96',
      titleSize: 'text-xl',
      topClass: 'top-[-10px]',
      descriptionLines: 'line-clamp-4',
      showActors: true,
      showVersions: true
    }
  }[size]

  if (!isDesktop || !showPopover) {
    return <>{trigger}</>
  }

  return (
    <div className="relative group">
      <div 
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        ref={triggerRef}
      >
        <div className={`${open ? 'opacity-90 scale-[1.05]' : 'opacity-100'} transition-all duration-300`}>
          {trigger}
        </div>

        {open && (
          <div 
            ref={popoverRef}
            className={`${sizeConfig.width} ${sizeConfig.topClass} absolute transform scale-[1.10] p-0 border border-amber-500/30 shadow-2xl rounded-md overflow-hidden transition-all duration-300 z-[9]`}
            style={{
              opacity: open ? 1 : 0,
              left: '55%',
              transform: 'translateX(-50%)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Overlay */}
            <div className="w-full h-full bg-black/80">
              <div className="p-4">
                {/* Rating badge */}
                <Badge className="bg-amber-600/90 text-white mb-3 inline-flex items-center">
                  <Star size={12} className="mr-1 fill-white" />
                  {movie.rating || "N/A"}
                </Badge>

                {/* Title */}
                <h3 className={`text-white font-bold ${sizeConfig.titleSize} line-clamp-2 mb-2`}>
                  {movie.title}
                </h3>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-300">
                    <Calendar size={14} className="text-amber-500" />
                    <span>{movie.releaseYear}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-300">
                    <Clock size={14} className="text-amber-500" />
                    <span>{movie.duration || "N/A"} Phút</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-300">
                    <Star size={14} className="text-amber-500" />
                    <span>{movie.rating || "N/A"} / 10</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-300">
                    <User size={14} className="text-amber-500" />
                    <span>Chưa cập nhật</span>
                  </div>
                </div>

                {/* Description */}
                <p className={`text-xs text-gray-300 ${sizeConfig.descriptionLines} mb-3`}>
                  {movie.summary || "Chưa có mô tả cho phim này."}
                </p>

                {variant === 'simple' ? (
                  <div className="flex items-center gap-2 mt-3">
                    <Button 
                      asChild 
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white h-9"
                    >
                      <Link href={watchUrl}>
                        <Play size={16} className="mr-1" />
                        Xem phim
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    {(sizeConfig.showActors || sizeConfig.showVersions) && (
                      <Separator className="my-3 bg-gray-800/60" />
                    )}

                    {sizeConfig.showVersions && (
                      <div className="mb-4">
                        <h4 className="text-xs text-gray-400 mb-1.5 flex items-center">
                          <Film size={12} className="mr-1 text-amber-500" />
                          Phiên bản
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {["Vietsub", "Thuyết minh", "Lồng tiếng"].map((version) => (
                            <Badge key={version} variant="outline" className="bg-gray-800/80 text-xs text-white border-gray-700">
                              {version}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <Button 
                        asChild 
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white h-9"
                      >
                        <Link href={watchUrl}>
                          <Play size={16} className="mr-1" />
                          Xem ngay
                        </Link>
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="h-9 w-9 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-amber-500"
                      >
                        <Heart size={16} />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="h-9 w-9 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-amber-500"
                        asChild
                      >
                        <Link href={movieDetailUrl}>
                          <Info size={16} />
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MoviePopover
