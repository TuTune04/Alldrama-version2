import { Category } from '@/types/category';

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Action',
    slug: 'action',
    description: 'Action movies and series',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Comedy',
    slug: 'comedy',
    description: 'Comedy movies and series',
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Drama',
    slug: 'drama',
    description: 'Drama movies and series',
    status: 'inactive',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }
];