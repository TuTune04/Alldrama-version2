import { useCallback, useState, useEffect } from 'react';
import { LoginCredentials, RegisterCredentials, User, UpdateUserDto } from '@/types';
import { authService } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import { mutate } from 'swr';
import { cacheManager } from '@/lib/cache/cacheManager';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Sử dụng Zustand store 
  const auth = useAuthStore();
  const { user, isAuthenticated, token } = auth;

  // Tự động kiểm tra người dùng hiện tại nếu có token
  useEffect(() => {
    const checkCurrentUser = async () => {
      if (token && !user) {
        await fetchCurrentUser();
      }
    };
    
    checkCurrentUser();
  }, [token]);

  /**
   * Đăng ký người dùng mới
   */
  const register = useCallback(async (credentials: RegisterCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(credentials);
      // Lưu access token và cập nhật store
      authService.saveToken(response.accessToken);
      auth.setUser(response.user);
      auth.setAuthenticated(true);
      toast.success('Đăng ký thành công!');
      router.push('/');
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Đăng ký thất bại';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [router, auth]);

  /**
   * Đăng nhập người dùng
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      // Sử dụng login tích hợp của auth store
      const result = await auth.login(credentials);
      if (!result || (typeof result === 'object' && !result.success)) {
        const message = typeof result === 'object' && result.message ? result.message : 'Đăng nhập thất bại';
        setError(message);
        return null;
      }
      
      toast.success('Đăng nhập thành công!');
      router.push('/');
      return { user: auth.user, accessToken: auth.token };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Đăng nhập thất bại';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [router, auth]);

  /**
   * Đăng xuất người dùng
   * Sử dụng auth store để thực hiện logout - tất cả cache clearing đã được xử lý trong store
   */
  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      console.log("Bắt đầu đăng xuất từ useAuth...");
      
      // Đặt cờ đang đăng xuất để ngăn các API request mới
      if (typeof window !== 'undefined') {
        // @ts-ignore: Property 'isLoggingOut' does not exist on type 'Window & typeof globalThis'
        window.isLoggingOut = true;
      }
      
      // Auth store sẽ xử lý toàn bộ cache clearing và API calls
      await auth.logout();
      
      // Đợi một chút để đảm bảo mọi thứ được xóa
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Chuyển hướng đến trang đăng nhập
      router.push('/login');
      
      console.log("Đăng xuất thành công từ useAuth.");
    } catch (err) {
      console.error("Lỗi khi đăng xuất từ useAuth:", err);
      
      // Fallback: vẫn chuyển hướng đến login page ngay cả khi có lỗi
      router.push('/login');
      
      // Hiển thị thông báo lỗi
      toast.error('Đã có lỗi xảy ra khi đăng xuất, nhưng bạn đã được đăng xuất.');
    } finally {
      setLoading(false);
      
      // Xóa cờ đăng xuất sau một khoảng thời gian
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          // @ts-ignore: Property 'isLoggingOut' does not exist on type 'Window & typeof globalThis'
          window.isLoggingOut = false;
        }
      }, 3000); // Tăng thời gian lên 3s để đảm bảo data refresh có thể hoàn tất
    }
  }, [auth, router]);

  /**
   * Lấy thông tin người dùng hiện tại
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      // Nếu đã có user, trả về luôn
      if (user) {
        return user;
      }
      
      // Nếu không có token trong store, thử đọc từ cookie
      if (!token) {
        // Kiểm tra xem có token trong cookie không
        if (typeof document !== 'undefined') {
          // Nếu không có token trong store nhưng có trong cookie, 
          // chờ một chút để các hệ thống khác cập nhật
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Nếu token đã được cập nhật vào store bởi một quá trình khác
          if (auth.token) {
            setLoading(true);
            try {
              const currentUser = await authService.getCurrentUser();
              if (currentUser) {
                auth.setUser(currentUser);
                auth.setAuthenticated(true);
                return currentUser;
              }
            } catch (err) {
              console.error("Lỗi khi tự động fetch user từ token cookie:", err);
            } finally {
              setLoading(false);
            }
          }
        }
        return null;
      }
      
      // Nếu có token, thực hiện gọi API
      setLoading(true);
      try {
        const currentUser = await authService.getCurrentUser();
        auth.setUser(currentUser);
        auth.setAuthenticated(true);
        return currentUser;
      } catch (err) {
        console.error("Error fetching current user:", err);
        return null;
      } finally {
        setLoading(false);
      }
    } catch (err) {
      console.error("Unexpected error in fetchCurrentUser:", err);
      return null;
    }
  }, [token, user, auth]);

  /**
   * Đổi mật khẩu người dùng
   */
  const changePassword = useCallback(async (
    userId: string | number, 
    full_name: string,
    email: string,
    password: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.changePassword(userId, { 
        full_name,
        email,
        password
      });
      toast.success('Đổi mật khẩu thành công!');
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Không thể đổi mật khẩu';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Kiểm tra nếu người dùng có vai trò admin
  const isAdmin = !!user && user.role === 'admin';

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    register,
    login,
    logout,
    fetchCurrentUser,
    changePassword
  };
};