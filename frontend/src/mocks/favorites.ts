import { Favorite, FavoriteListResponse } from '@/types';
import { mockMovies } from './movies';
import { mockUsers } from './users';

export const mockFavorites: Favorite[] = [
  // Phim yêu thích của admin user
  {
    id: 'favorite-admin-1',
    userId: mockUsers[0].id,
    movieId: mockMovies[0].id,
    movie: mockMovies[0],
    createdAt: '2023-03-20T10:30:00Z'
  },
  {
    id: 'favorite-admin-2',
    userId: mockUsers[0].id,
    movieId: mockMovies[1].id,
    movie: mockMovies[1],
    createdAt: '2023-03-22T14:45:00Z'
  },
  {
    id: 'favorite-admin-3',
    userId: mockUsers[0].id,
    movieId: mockMovies[3].id,
    movie: mockMovies[3],
    createdAt: '2023-03-25T19:20:00Z'
  },
  // Phim yêu thích của người dùng thường
  {
    id: 'favorite-1',
    userId: mockUsers[1].id,
    movieId: mockMovies[0].id,
    movie: mockMovies[0],
    createdAt: '2023-03-10T10:30:00Z'
  },
  {
    id: 'favorite-2',
    userId: mockUsers[1].id,
    movieId: mockMovies[2].id,
    movie: mockMovies[2],
    createdAt: '2023-03-12T14:45:00Z'
  },
  {
    id: 'favorite-3',
    userId: mockUsers[2].id,
    movieId: mockMovies[1].id,
    movie: mockMovies[1],
    createdAt: '2023-03-15T09:20:00Z'
  },
  {
    id: 'favorite-4',
    userId: mockUsers[2].id,
    movieId: mockMovies[4].id,
    movie: mockMovies[4],
    createdAt: '2023-03-16T16:10:00Z'
  },
  {
    id: 'favorite-5',
    userId: mockUsers[3].id,
    movieId: mockMovies[3].id,
    movie: mockMovies[3],
    createdAt: '2023-03-17T20:30:00Z'
  }
];

/**
 * Lấy danh sách phim yêu thích của người dùng
 * @param userId ID của người dùng
 * @returns Danh sách phim yêu thích của người dùng
 */
export const getUserFavorites = (userId: string): FavoriteListResponse => {
  const favorites = mockFavorites.filter(item => item.userId === userId);
  return {
    favorites,
    totalPages: 1,
    currentPage: 1,
    totalFavorites: favorites.length
  };
}; 