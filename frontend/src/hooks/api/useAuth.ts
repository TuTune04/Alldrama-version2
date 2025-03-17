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
      authService.saveToken(response.token);
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
      authService.saveToken(response.token);
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
   */
  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      await authService.logout();
      authService.clearToken();
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
      authService.clearToken();
      logoutStore();
      return null;
    } finally {
      setLoading(false);
    }
  }, [logoutStore, setAuthenticated, setUser]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    fetchCurrentUser
  };
}; 