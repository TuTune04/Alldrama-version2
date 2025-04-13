import { User } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    fullName: 'System Admin',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-04-12T15:30:00Z'
  },
  {
    id: '2',
    username: 'john.doe',
    email: 'john@example.com',
    fullName: 'John Doe',
    role: 'user',
    status: 'active',
    createdAt: '2024-02-15T00:00:00Z',
    lastLogin: '2024-04-11T10:20:00Z'
  },
  {
    id: '3',
    username: 'jane.smith',
    email: 'jane@example.com',
    fullName: 'Jane Smith',
    role: 'user',
    status: 'inactive',
    createdAt: '2024-03-01T00:00:00Z',
    lastLogin: '2024-03-20T08:15:00Z'
  }
];