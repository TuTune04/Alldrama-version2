'use client'

import Link from "next/link"
import Image from "next/image"
import type { Movie } from "@/types"
import { generateMovieUrl } from "@/utils/url"
import { Star, Play, Heart, Info, Calendar, Clock, Film, User } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
}

const MoviePopover = ({ 
  movie, 
  trigger, 
  size = 'md',
  variant = 'default'
}: MoviePopoverProps) => {
  const [open, setOpen] = useState(false)
  const isMobile = useMobile(1024)
  const isDesktop = !isMobile
  const triggerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const movieDetailUrl = generateMovieUrl(movie.id, movie.title)
  
  // Create watch URL - check if we have episode information
  let watchUrl = '';
  if (movie.episodes && movie.episodes.length > 0) {
    const firstEpisode = movie.episodes[0];
    watchUrl = generateMovieUrl(movie.id, movie.title);
  } else {
    // Fallback to direct movie URL if no episodes
    watchUrl = generateMovieUrl(movie.id, movie.title);
  }
  
  const imageUrl = movie.posterUrl || "/images/placeholder-poster.jpg"

  // Cấu hình kích thước dựa trên prop size
  const sizeConfig = {
    sm: {
      width: 'w-72',
      imageHeight: 'aspect-[16/7]',
      titleSize: 'text-base',
      descriptionLines: 'line-clamp-2',
      showActors: false,
      showVersions: false
    },
    md: {
      width: 'w-80',
      imageHeight: 'aspect-video',
      titleSize: 'text-lg',
      descriptionLines: 'line-clamp-3',
      showActors: true,
      showVersions: true
    },
    lg: {
      width: 'w-96',
      imageHeight: 'aspect-video',
      titleSize: 'text-xl',
      descriptionLines: 'line-clamp-4',
      showActors: true,
      showVersions: true
    }
  }[size]
  
  // Nếu không phải desktop, không hiển thị popup
  if (!isDesktop) {
    return <>{trigger}</>;
  }
  
  return (
    <div className="relative">
      <div 
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        ref={triggerRef}
      >
        <div className={`${open ? 'opacity-90' : 'opacity-100'} transition-opacity duration-300`}>
          {trigger}
        </div>
        
        {open && (
          <div 
            ref={popoverRef}
            className={`${sizeConfig.width} absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 p-0 bg-gray-900/95 backdrop-blur-md border border-amber-500/30 shadow-xl z-50 rounded-md`}
            style={{
              opacity: open ? 1 : 0,
              transform: `translateX(-50%) translateY(-102%)`,
              transition: 'all 0.3s ease',
            }}
          >
            {/* Thumbnail at the top */}
            <div className={`w-full ${sizeConfig.imageHeight} relative rounded-t-md overflow-hidden flex-shrink-0 border-b border-gray-800/50`}>
              <Image
                src={imageUrl}
                alt={movie.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              
              {/* Play button overlay */}
              <Link href={generateMovieUrl(movie.id, movie.title)} className="absolute inset-0 flex items-center justify-center">
                <div className="p-3 rounded-full bg-amber-600/80 text-white hover:bg-amber-600 transform hover:scale-110 transition-all duration-300 cursor-pointer">
                  <Play fill="white" size={24} />
                </div>
              </Link>
              
              {/* Rating badge */}
              <Badge className="absolute top-2 left-2 bg-amber-600/90 text-white">
                <Star size={12} className="mr-1 fill-white" />
                {movie.rating || "N/A"}
              </Badge>
            </div>
            
            <div className="p-4">
              {/* Title */}
              <h3 className={`text-white font-bold ${sizeConfig.titleSize} line-clamp-2 mb-2`}>
                {movie.title}
              </h3>
              
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-300">
                  <Calendar size={14} className="text-amber-500" />
                  <span>{movie.releaseYear}</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-gray-300">
                  <Clock size={14} className="text-amber-500" />
                  <span>120 phút</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-gray-300">
                  <Star size={14} className="text-amber-500" />
                  <span>{movie.rating || "N/A"} / 10</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-gray-300">
                  <User size={14} className="text-amber-500" />
                  <span>{(movie.actors?.length || 0) > 0 ? `${movie.actors?.length} diễn viên` : 'Chưa cập nhật'}</span>
                </div>
              </div>
              
              {/* Description */}
              <p className={`text-xs text-gray-300 ${sizeConfig.descriptionLines} mb-3`}>
                {movie.description || "Chưa có mô tả cho phim này."}
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
                  
                  {/* Actors Section */}
                  {sizeConfig.showActors && (
                    <div className="mb-2">
                      <h4 className="text-xs text-gray-400 mb-1.5 flex items-center">
                        <User size={12} className="mr-1 text-amber-500" />
                        Diễn viên
                      </h4>
                      <div className="text-xs text-gray-300 line-clamp-1">
                        {movie.actors && movie.actors.length > 0 ? movie.actors.join(', ') : 'Đang cập nhật'}
                      </div>
                    </div>
                  )}
                  
                  {/* Movie Versions */}
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
                  
                  {/* Actions buttons */}
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
            
            {/* Triangle pointer at bottom */}
            <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-gray-900/95 -translate-x-1/2 translate-y-1/2 rotate-45 border-r border-b border-amber-500/30"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MoviePopover 