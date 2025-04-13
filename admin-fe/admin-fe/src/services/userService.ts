import { User } from '@/types/user';
import { mockUsers } from '@/data/mockUsers';

export const userService = {
  getUsers: async (search?: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!search) return mockUsers;
    
    const searchLower = search.toLowerCase();
    return mockUsers.filter(user => 
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.fullName.toLowerCase().includes(searchLower)
    );
  },

  createUser: async (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser = {
      ...user,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return newUser;
  },

  updateUser: async (id: string, userData: Partial<User>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockUsers.findIndex(user => user.id === id);
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], ...userData };
      return mockUsers[index];
    }
    throw new Error('User not found');
  },

  deleteUser: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockUsers.findIndex(user => user.id === id);
    if (index !== -1) {
      mockUsers.splice(index, 1);
    }
  }
};