'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Star, Calendar, Clock, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Movie } from '@/types'
import { generateMovieUrl } from '@/utils/url'

export interface FeaturedContentSwitcherProps {
  items: Movie[]
  title?: string
  variant?: 'default' | 'indigo' | 'amber' | 'dark'
  aspectRatio?: 'video' | 'poster' | 'banner' | 'landscape' | 'portrait'
  itemsPerView?: number
  showThumbnails?: boolean
  initialIndex?: number
  renderDetailContent?: (item: Movie, index: number) => React.ReactNode
  onItemChange?: (item: Movie, index: number) => void
  className?: string
  showProgress?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
  defaultIndex?: number
  wrapContainer?: boolean
}

const FeaturedContentSwitcher = ({
  items,
  title = 'Nổi bật',
  variant = 'default',
  aspectRatio = 'video',
  itemsPerView = 5,
  showThumbnails = true,
  initialIndex = 0,
  renderDetailContent,
  onItemChange,
  className,
  showProgress = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  defaultIndex = 0,
  wrapContainer = true
}: FeaturedContentSwitcherProps) => {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex)
  const selectedItem = items[selectedIndex]
  
  const totalItems = items.length
  
  // Get appropriate styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'indigo':
        return {
          gradient: 'from-indigo-900 via-purple-900 to-indigo-900',
          accent: 'bg-indigo-600',
          accentHover: 'hover:bg-indigo-700',
          titleGradient: 'from-indigo-400 to-purple-400',
          border: 'border-indigo-500/20',
          badgeBg: 'bg-indigo-600/10',
          badgeText: 'text-indigo-400',
          highlight: 'text-indigo-400'
        }
      case 'amber':
        return {
          gradient: 'from-amber-900 via-orange-900 to-amber-900',
          accent: 'bg-amber-600',
          accentHover: 'hover:bg-amber-700',
          titleGradient: 'from-amber-400 to-red-400',
          border: 'border-amber-500/20',
          badgeBg: 'bg-amber-600/10',
          badgeText: 'text-amber-400',
          highlight: 'text-amber-400'
        }
      case 'dark':
        return {
          gradient: 'from-gray-900 via-gray-800 to-gray-900',
          accent: 'bg-gray-700',
          accentHover: 'hover:bg-gray-600',
          titleGradient: 'from-gray-200 to-gray-400',
          border: 'border-gray-700',
          badgeBg: 'bg-gray-700',
          badgeText: 'text-gray-300',
          highlight: 'text-gray-300'
        }
      default:
        return {
          gradient: 'from-gray-900 via-gray-800 to-gray-900',
          accent: 'bg-gray-700',
          accentHover: 'hover:bg-gray-600',
          titleGradient: 'from-gray-200 to-gray-400',
          border: 'border-gray-700',
          badgeBg: 'bg-gray-700',
          badgeText: 'text-gray-300',
          highlight: 'text-gray-300'
        }
    }
  }
  
  const styles = getVariantStyles()
  
  // Get aspect ratio style
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'poster': return 'aspect-[2/3]'
      case 'banner': return 'aspect-[21/9]'
      case 'landscape': return 'aspect-[16/9]'
      case 'portrait': return 'aspect-[9/16]'
      default: return 'aspect-video'
    }
  }
  
  // Handle item selection
  const handleItemSelect = useCallback((index: number) => {
    setSelectedIndex(index)
    if (onItemChange) {
      onItemChange(items[index], index)
    }
  }, [items, onItemChange])
  
  // Auto play functionality
  useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % totalItems)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, totalItems])
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems)
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev + 1) % totalItems)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [totalItems])
  
  // Default render function for detail content if none provided
  const defaultRenderDetailContent = (movie: Movie, index: number) => {
    return (
      <div className="flex flex-col md:flex-row gap-6">
        <div className="aspect-[2/3] w-full max-w-[200px] rounded-lg overflow-hidden shadow-lg">
          <img 
            src={movie.posterUrl} 
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1">
          <h3 className={`text-2xl font-bold mb-2 bg-gradient-to-r ${styles.titleGradient} bg-clip-text text-transparent`}>
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 mb-4">
            <Badge>{movie.releaseYear}</Badge>
            {movie.rating && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5" />
                {movie.rating.toFixed(1)}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {movie.description}
          </p>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href={`/watch/${movie.id}`}>
                <Play className="mr-2 h-4 w-4" />
                Xem ngay
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={generateMovieUrl(movie.id, movie.title)}>
                <Info className="mr-2 h-4 w-4" />
                Chi tiết
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  if (!items || items.length === 0) return null
  
  // Calculate the number of thumbnails to show based on viewport size
  const visibleThumbs = Math.min(items.length, 8)
  
  const content = (
    <div className={cn('space-y-4 py-12', className)}>
      {title && (
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <span className={`bg-gradient-to-r ${styles.titleGradient} bg-clip-text text-transparent`}>
            {title}
          </span>
        </h2>
      )}
      
      <div className="relative">
        {/* Featured Item Display */}
        <Card className={cn(
          'overflow-hidden',
          variant === 'dark' ? 'bg-black/60 text-white' : 'bg-card'
        )}>
          <CardContent className="p-0">
            <div className="relative w-full aspect-[21/9]">
              <Image
                src={selectedItem.posterUrl}
                alt={selectedItem.title}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-6 w-full pb-16">
                <div className="flex flex-col gap-2 max-w-2xl">
                  <h3 className={`text-3xl font-bold bg-gradient-to-r ${styles.titleGradient} bg-clip-text text-transparent`}>
                    {selectedItem.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-white/10 text-white">
                      {selectedItem.releaseYear}
                    </Badge>
                    {selectedItem.rating && (
                      <Badge variant="outline" className="flex items-center gap-1 text-xs bg-white/10 text-white">
                        <Star className="h-3 w-3" />
                        {selectedItem.rating}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-white/80 line-clamp-2 md:line-clamp-3">
                    {selectedItem.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-1"
                      asChild
                    >
                      <Link href={`/watch/${selectedItem.id}`}>
                        <Play className="h-4 w-4" />
                        Xem ngay
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 bg-white/10 hover:bg-white/20 text-white"
                      asChild
                    >
                      <Link href={generateMovieUrl(selectedItem.id, selectedItem.title)}>
                        <Info className="h-4 w-4" />
                        Chi tiết
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Thumbnail Navigation - Desktop only */}
        {showThumbnails && (
          <>
            {/* Desktop thumbnails */}
            <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 px-8 hidden md:block">
              <div className="flex justify-center">
                <div className="inline-flex bg-black/70 backdrop-blur-md p-2 rounded-xl space-x-4 shadow-xl">
                  {items.slice(0, visibleThumbs).map((item, index) => (
                    <div
                      key={item.id}
                      className={cn(
                        'relative rounded-md overflow-hidden transition-all duration-200 cursor-pointer h-16 w-24',
                        index === selectedIndex 
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-black z-10 scale-110' 
                          : 'opacity-70 hover:opacity-100'
                      )}
                      onClick={() => handleItemSelect(index)}
                    >
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className={cn(
                        "absolute bottom-0 left-0 right-0 py-1 px-1.5 text-[10px] font-medium truncate",
                        index === selectedIndex 
                          ? `bg-gradient-to-r ${styles.gradient} text-white`
                          : 'bg-black/60 text-gray-300'
                      )}>
                        {item.title}
                      </div>
                      {index === selectedIndex && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="rounded-full bg-primary/80 p-1">
                            <Play className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Mobile dots navigation */}
            <div className="md:hidden flex items-center justify-center mt-8">
              <div className="inline-flex bg-black/70 backdrop-blur-md px-3 py-2 rounded-full space-x-2">
                {items.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleItemSelect(index)}
                    className={cn(
                      'rounded-full transition-all',
                      index === selectedIndex 
                        ? 'bg-primary w-3 h-3' 
                        : 'bg-white/30 w-2 h-2 hover:bg-white/60'
                    )}
                    aria-label={`Go to item ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Progress Indicator for non-thumbnail mode */}
        {showProgress && !showThumbnails && (
          <div className="flex items-center justify-center mt-8 gap-1">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => handleItemSelect(index)}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  index === selectedIndex ? 'bg-primary w-3' : 'bg-muted hover:bg-muted-foreground/50'
                )}
                aria-label={`Go to item ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
  
  // Wrap in container if needed
  if (wrapContainer) {
    return (
      <section className="bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {content}
        </div>
      </section>
    )
  }
  
  return content
}

export default FeaturedContentSwitcher