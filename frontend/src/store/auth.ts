'use client'

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import { authService } from '@/lib/api';

// Định nghĩa kiểu dữ liệu cho AuthState
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  sessionId: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

// Tạo auth store với Zustand
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      sessionId: null,

      // Hàm login sử dụng authService
      login: async (email: string, password: string) => {
        try {
          // Gọi API đăng nhập thật
          const response = await authService.login({ email, password });
          
          // Tạo session ID mới
          const sessionId = crypto.randomUUID();
          
          // Lưu token và cập nhật state
          authService.saveToken(response.accessToken);
          
          // Cập nhật state
          set({
            user: response.user,
            isAuthenticated: true,
            token: response.accessToken,
            sessionId
          });

          // Broadcast sự kiện đăng nhập thành công
          window.dispatchEvent(new CustomEvent('auth:login', {
            detail: { sessionId }
          }));
          
          return { success: true };
        } catch (error: any) {
          // Xử lý lỗi
          const errorMessage = error.response?.data?.message || 'Email hoặc mật khẩu không chính xác';
          return { 
            success: false, 
            message: errorMessage 
          };
        }
      },

      // Hàm logout sử dụng authService
      logout: async () => {
        try {
          // Gọi API đăng xuất
          await authService.logout();
        } catch (error) {
          console.error('Lỗi khi đăng xuất:', error);
        } finally {
          // Xóa token 
          authService.clearToken();
          
          // Cập nhật state
          set({
            user: null,
            isAuthenticated: false,
            token: null,
            sessionId: null
          });

          // Broadcast sự kiện đăng xuất
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated, 
        token: state.token,
        sessionId: state.sessionId
      }),
    }
  )
);

// Lắng nghe sự kiện storage để đồng bộ giữa các tab
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'auth-storage') {
      const newState = JSON.parse(event.newValue || '{}');
      const currentState = useAuthStore.getState();

      // Chỉ cập nhật nếu sessionId khác nhau
      if (newState.sessionId !== currentState.sessionId) {
        useAuthStore.setState(newState);
      }
    }
  });

  // Lắng nghe sự kiện đăng nhập/đăng xuất từ các tab khác
  window.addEventListener('auth:login', ((event: CustomEvent) => {
    const { sessionId } = event.detail;
    const currentState = useAuthStore.getState();
    
    // Nếu sessionId khác, cập nhật state
    if (sessionId !== currentState.sessionId) {
      useAuthStore.setState(currentState);
    }
  }) as EventListener);

  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().logout();
  });
} 