import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import type { Movie, Episode } from '@/types'
import { useLocalStorage } from '@/hooks/useLocalStorage'

/**
 * Cache TTL in milliseconds (5 minutes)
 */
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Custom hook for fetching movie details and episodes
 * Với caching để giảm tải cho backend và tăng tốc độ load
 */
export const useMovieDetail = (movieId: string | number) => {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Sử dụng ref để theo dõi mounted state
  const isMounted = useRef(true)
  
  // AbortController để hủy requests khi component unmount
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // Cache cho movie details
  const [cachedMovies, setCachedMovies] = useLocalStorage<{
    [key: string]: {
      movie: Movie;
      episodes: Episode[];
      timestamp: number;
    }
  }>('movie_detail_cache', {})
  
  // Cache TTL check
  const isCacheValid = (key: string) => {
    if (!cachedMovies[key]) return false
    const now = Date.now()
    return now - cachedMovies[key].timestamp < CACHE_TTL
  }

  useEffect(() => {
    // Cleanup function
    return () => {
      isMounted.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!movieId) return
      
      setIsLoading(true)
      setError(null)
      
      const cacheKey = String(movieId)
      
      // Nếu có cache hợp lệ, sử dụng cache
      if (isCacheValid(cacheKey)) {
        const cachedData = cachedMovies[cacheKey]
        setMovie(cachedData.movie)
        setEpisodes(cachedData.episodes)
        setIsLoading(false)
        
        // Nếu đang dùng cache, gọi ngầm API để cập nhật cache mới
        refreshMovieData(false)
        return
      }
      
      // Không có cache hoặc cache hết hạn, gọi API
      refreshMovieData(true)
    }
    
    fetchMovieData()
  }, [movieId])
  
  // Tách hàm gọi API ra để tái sử dụng
  const refreshMovieData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true)
        setError(null)
      }
      
      // Tạo AbortController mới cho request này
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal
      
      // Fetch movie details và episodes song song
      const [movieResponse, episodesResponse] = await Promise.allSettled([
        axios.get(API_ENDPOINTS.MOVIES.DETAIL(movieId), { signal }),
        axios.get(API_ENDPOINTS.EPISODES.LIST_BY_MOVIE(movieId), { signal })
      ])
      
      // Chỉ update state và cache nếu component vẫn mounted
      if (isMounted.current) {
        let currentMovie: Movie | null = null
        let currentEpisodes: Episode[] = []
        
        if (movieResponse.status === 'fulfilled') {
          currentMovie = movieResponse.value.data
          setMovie(currentMovie)
        } else {
          setError('Không thể tải thông tin phim')
        }
        
        if (episodesResponse.status === 'fulfilled') {
          currentEpisodes = episodesResponse.value.data || []
          setEpisodes(currentEpisodes)
        }
        
        // Lưu vào cache nếu có dữ liệu movie
        if (currentMovie) {
          setCachedMovies(prev => ({
            ...prev,
            [String(movieId)]: {
              movie: currentMovie,
              episodes: currentEpisodes,
              timestamp: Date.now()
            }
          }))
        }
        
        if (showLoading) {
          setIsLoading(false)
        }
        
        // Gọi API view count riêng biệt và không cần đợi kết quả
        incrementViewCount(currentMovie)
      }
    } catch (err) {
      console.error('Error fetching movie details:', err)
      if (isMounted.current && showLoading) {
        setError('Không thể tải thông tin phim. Vui lòng thử lại sau.')
        setIsLoading(false)
      }
    }
  }
  
  // Tách riêng hàm increment view count để không ảnh hưởng đến UX chính
  const incrementViewCount = async (movie: Movie | null) => {
    if (!movie) return
    
    try {
      // Không cần đợi kết quả từ API này
      axios.post(API_ENDPOINTS.VIEWS.INCREMENT_MOVIE(movieId), {
        progress: 0,
        duration: movie.duration || 0
      }).catch(err => {
        console.error('Error incrementing view count:', err)
      })
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }
  }

  return { 
    movie, 
    episodes, 
    isLoading, 
    error,
    refresh: () => refreshMovieData(true)
  }
} 