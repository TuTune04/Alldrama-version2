'use client'

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockUsers } from '@/mocks/users';
import { User } from '@/types';

// Định nghĩa kiểu dữ liệu cho AuthState
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

// Tạo auth store với Zustand
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      // Hàm login - giả lập API call
      login: async (email: string, password: string) => {
        // Giả lập delay để mô phỏng API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Trong môi trường thực tế, đây sẽ là API call đến server
        // Ở đây chúng ta sử dụng mock data để demo
        if (email && password) {
          // Tìm user trong mock data
          const foundUser = mockUsers.find((user) => user.email === email);
          
          if (foundUser) {
            // Giả định mật khẩu đúng nếu email tồn tại
            // Trong thực tế, cần kiểm tra mật khẩu từ server
            const mockToken = `mock-jwt-token-${Math.random().toString(36).substring(2)}`;
            
            set({
              user: foundUser,
              isAuthenticated: true,
              token: mockToken
            });
            
            return { success: true };
          }
        }
        
        return { 
          success: false, 
          message: 'Email hoặc mật khẩu không chính xác' 
        };
      },

      // Hàm logout
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          token: null
        });
      }
    }),
    {
      name: 'auth-storage', // Tên của storage item
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated, 
        token: state.token 
      }), // Lưu một phần của state
    }
  )
); 