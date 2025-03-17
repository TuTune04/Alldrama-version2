import { useCallback, useState } from 'react';
import { LoginCredentials, RegisterCredentials, User } from '@/types';
import { authService } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Sử dụng Zustand store
  const { user, setUser, setAuthenticated, isAuthenticated, logout: logoutStore } = useAuthStore();

  /**
   * Đăng ký người dùng mới
   */
  const register = useCallback(async (credentials: RegisterCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(credentials);
      // Lưu access token vào localStorage
      authService.saveToken(response.accessToken);
      setUser(response.user);
      setAuthenticated(true);
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
  }, [router, setAuthenticated, setUser]);

  /**
   * Đăng nhập người dùng
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      // Lưu access token vào localStorage
      // Refresh token được xử lý tự động bởi backend trong HTTP-Only cookies
      authService.saveToken(response.accessToken);
      setUser(response.user);
      setAuthenticated(true);
      toast.success('Đăng nhập thành công!');
      router.push('/');
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Đăng nhập thất bại';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [router, setAuthenticated, setUser]);

  /**
   * Đăng xuất người dùng
   * Gọi API logout để xóa refresh token cookie
   */
  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      // Gọi API logout để xóa refresh token cookie
      await authService.logout();
      logoutStore();
      toast.success('Đăng xuất thành công!');
      router.push('/login');
    } catch (err) {
      // Ngay cả khi API lỗi, vẫn đăng xuất ở local
      authService.clearToken();
      logoutStore();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [logoutStore, router]);

  /**
   * Đăng xuất khỏi tất cả các thiết bị
   */
  const logoutAll = useCallback(async () => {
    setLoading(true);
    
    try {
      await authService.logoutAll();
      logoutStore();
      toast.success('Đã đăng xuất khỏi tất cả các thiết bị!');
      router.push('/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể đăng xuất khỏi tất cả thiết bị';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [logoutStore, router]);

  /**
   * Gửi email xác thực
   */
  const emailAuth = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.emailAuth({ email });
      toast.success('Email xác thực đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Không thể gửi email xác thực';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy CSRF token
   */
  const getCsrfToken = useCallback(async () => {
    try {
      const response = await authService.getCsrfToken();
      return response.csrfToken;
    } catch (err) {
      console.error('Không thể lấy CSRF token:', err);
      return null;
    }
  }, []);

  /**
   * Lấy thông tin người dùng hiện tại
   */
  const fetchCurrentUser = useCallback(async () => {
    // Nếu không có token, không cần gọi API
    if (!authService.isAuthenticated()) {
      return null;
    }
    
    setLoading(true);
    
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setAuthenticated(true);
      return currentUser;
    } catch (err) {
      // Xử lý lỗi và đăng xuất nếu có vấn đề
      // Token refresh được xử lý tự động bởi apiClient
      return null;
    } finally {
      setLoading(false);
    }
  }, [setAuthenticated, setUser]);

  /**
   * Refresh token thủ công (hiếm khi cần thiết vì đã có xử lý tự động)
   */
  const refreshToken = useCallback(async () => {
    setLoading(true);
    
    try {
      const newToken = await authService.refreshToken();
      setAuthenticated(true);
      return newToken;
    } catch (err) {
      authService.clearToken();
      logoutStore();
      router.push('/login');
      return null;
    } finally {
      setLoading(false);
    }
  }, [logoutStore, router, setAuthenticated]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    logoutAll,
    emailAuth,
    getCsrfToken,
    fetchCurrentUser,
    refreshToken
  };
}; 