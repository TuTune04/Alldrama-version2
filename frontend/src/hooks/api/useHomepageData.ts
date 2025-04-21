import { useState, useEffect } from 'react';
import { Movie } from '@/types';
import { useMovies } from '@/hooks/api/useMovies';
import { toast } from 'react-hot-toast';

interface HomepageData {
  newest: Movie[];
  popular: Movie[];
  featured: Movie[];
  trending: Movie[];
  genres: {
    [id: number]: Movie[];
  };
}

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

  const {
    getNewestMovies,
    getPopularMovies,
    getFeaturedMovies,
    getTrendingMovies,
    getSimilarMovies
  } = useMovies();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch tất cả dữ liệu cùng lúc (song song), nhưng không bắt buộc phải chờ tất cả
        // Nếu một phần dữ liệu load chậm, phần còn lại vẫn có thể hiển thị
        
        // Yêu cầu phim mới nhất, phim phổ biến, phim đánh giá cao, xu hướng
        const newestResult = await getNewestMovies().catch(() => []);
        const popularResult = await getPopularMovies().catch(() => []);
        const featuredResult = await getFeaturedMovies().catch(() => []);
        const trendingResult = await getTrendingMovies().catch(() => []);
        
        // Chỉ yêu cầu phim mới nhất và xu hướng cho UX
        // chính thức các phần còn lại
        
        // Thử lấy thêm phim theo thể loại
        // Cứ giả sử lấy không được
        
        const actionMovies = []
        const dramaMovies = []
        
        try {
          const actionResult = await getSimilarMovies('1');
          if (actionResult && actionResult.length > 0) {
            actionMovies.push(...actionResult);
          }
        } catch (error) {
          console.error('Failed to fetch action movies:', error);
        }
        
        try {
          const dramaResult = await getSimilarMovies('3');
          if (dramaResult && dramaResult.length > 0) {
            dramaMovies.push(...dramaResult);
          }
        } catch (error) {
          console.error('Failed to fetch drama movies:', error);
        }
        
        // Xuất dữ liệu
        const newest = newestResult || [];
        const popular = popularResult || [];
        const featured = featuredResult || [];
        const trending = trendingResult || [];

        setData({
          newest,
          popular,
          featured,
          trending,
          genres: {
            1: actionMovies,
            3: dramaMovies
          }
        });
      } catch (err) {
        console.error('Error fetching homepage data:', err);
        setError(err as Error);
        toast.error('Không thể tải dữ liệu trang chủ');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getNewestMovies, getPopularMovies, getFeaturedMovies, getTrendingMovies, getSimilarMovies]);

  return {
    ...data,
    isLoading,
    error
  };
};
