import { AuthResponse } from '@/types/auth';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'admin@example.com' && password === 'password') {
      return {
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin'
        },
        token: 'mock-jwt-token'
      };
    }
    
    throw new Error('Invalid credentials');
  },

  logout: async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('auth_token');
  }
};