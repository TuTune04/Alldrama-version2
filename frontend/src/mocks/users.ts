import { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@alldrama.tech',
    full_name: 'Admin User',
    role: 'admin',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'user-2',
    email: 'user1@example.com',
    full_name: 'Nguyễn Văn A',
    role: 'user',
    createdAt: '2023-01-05T00:00:00Z',
    updatedAt: '2023-01-05T00:00:00Z'
  },
  {
    id: 'user-3',
    email: 'user2@example.com',
    full_name: 'Trần Thị B',
    role: 'user',
    createdAt: '2023-01-10T00:00:00Z',
    updatedAt: '2023-01-10T00:00:00Z'
  },
  {
    id: 'user-4',
    email: 'user3@example.com',
    full_name: 'Lê Văn C',
    role: 'user',
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z'
  },
  {
    id: 'user-5',
    email: 'user4@example.com',
    full_name: 'Phạm Thị D',
    role: 'user',
    createdAt: '2023-01-20T00:00:00Z',
    updatedAt: '2023-01-20T00:00:00Z'
  }
];

export const mockCurrentUser = mockUsers[0]; 