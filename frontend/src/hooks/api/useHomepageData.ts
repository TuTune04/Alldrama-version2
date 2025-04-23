import { useState, useEffect, useRef } from 'react';
import { Movie } from '@/types';
import { useMovies } from '@/hooks/api/useMovies';
import { toast } from 'react-hot-toast';
import { movieService } from '@/lib/api/services/movieService';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface HomepageData {
  newest: Movie[];
  popular: Movie[];
  featured: Movie[];
  trending: Movie[];
  genres: {
    [id: number]: Movie[];
  };
}

// Cache TTL in milliseconds (10 minutes)
const CACHE_TTL = 10 * 60 * 1000;

export const useHomepageData = () => {
  const [data, setData] = useState<HomepageData>({ 
    newest: [], 
    popular: [], 
    featured: [], 
    trending: [],
    genres: {} 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Lưu dữ liệu vào localStorage với TTL
  const [cachedData, setCachedData] = useLocalStorage<{data: HomepageData, timestamp: number} | null>(
    'homepage_data',
    null
  );
  
  // Sử dụng ref để theo dõi mounted state
  const isMounted = useRef(true);
  
  // AbortController để hủy requests khi component unmount
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    getNewestMovies,
    getPopularMovies,
    getFeaturedMovies,
    getTrendingMovies,
  } = useMovies();

  // Kiểm tra xem cache có hết hạn chưa
  const isCacheValid = () => {
    if (!cachedData) return false;
    const now = Date.now();
    return now - cachedData.timestamp < CACHE_TTL;
  };

  useEffect(() => {
    // Cleanup function để đảm bảo set isMounted = false khi component unmount
    return () => {
      isMounted.current = false;
      // Hủy tất cả API requests đang chạy khi component unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Nếu cache còn hạn, sử dụng cache data
      if (isCacheValid()) {
        setData(cachedData!.data);
        setIsLoading(false);
        
        // Vẫn fetch data mới ngầm để cập nhật cache
        fetchLatestData(false);
        return;
      }
      
      // Không có cache hoặc cache hết hạn, fetch data mới
      fetchLatestData(true);
    };

    fetchData();
  }, []);

  const fetchLatestData = async (showLoading = true) => {
      try {
      if (showLoading) {
        setIsLoading(true);
      }
        setError(null);
        
      // Tạo AbortController mới cho request này
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      // 1. Gọi các API riêng lẻ song song với Promise.allSettled để tránh lỗi nếu 1 API không thành công
      const [newestResult, popularResult, featuredResult, trendingResult] = await Promise.allSettled([
        getNewestMovies(),
        getPopularMovies(),
        getFeaturedMovies(),
        getTrendingMovies()
      ]);

      // Lấy dữ liệu hoặc mảng rỗng nếu API thất bại
      const newest = newestResult.status === 'fulfilled' ? newestResult.value : [];
      const popular = popularResult.status === 'fulfilled' ? popularResult.value : [];
      const featured = featuredResult.status === 'fulfilled' ? featuredResult.value : [];
      const trending = trendingResult.status === 'fulfilled' ? trendingResult.value : [];
        
      // 2. Fetch genres song song - sử dụng Promise.allSettled để không bị lỗi nếu 1 request thất bại
      const genrePromises = [
        movieService.getMoviesByGenre(1, 10),
        movieService.getMoviesByGenre(3, 10)
      ];
      
      const [actionResult, dramaResult] = await Promise.allSettled(genrePromises);
      
      // Khởi tạo đối tượng genres
      const genres: {[id: number]: Movie[]} = {};
      
      // Xử lý kết quả genres
      if (actionResult.status === 'fulfilled' && actionResult.value && actionResult.value.movies) {
        genres[1] = actionResult.value.movies;
      } else {
        genres[1] = [];
      }
      
      if (dramaResult.status === 'fulfilled' && dramaResult.value && dramaResult.value.movies) {
        genres[3] = dramaResult.value.movies;
      } else {
        genres[3] = [];
        }
        
      // Chỉ cập nhật state nếu component vẫn còn mounted
      if (isMounted.current) {
        const newData = {
          newest,
          popular,
          featured,
          trending,
          genres
        };
        
        setData(newData);
        
        // Lưu vào cache với timestamp
        setCachedData({
          data: newData,
          timestamp: Date.now()
        });
        
        if (showLoading) {
          setIsLoading(false);
        }
      }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      if (isMounted.current && showLoading) {
        setError(err as Error);
        setIsLoading(false);
        toast.error('Không thể tải dữ liệu trang chủ');
      }
      }
    };

  // Thêm hàm refresh để có thể gọi lại API khi cần
  const refreshData = () => {
    fetchLatestData(true);
  };

  return {
    ...data,
    isLoading,
    error,
    refreshData
  };
};
