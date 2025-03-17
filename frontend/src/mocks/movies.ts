import { Movie, MovieListResponse } from '@/types';
import { mockGenres } from './genres';

export const mockMovies: Movie[] = [
  {
    id: 'movie-1',
    title: 'Người Nhện: Không Còn Nhà',
    description: 'Sau khi danh tính của Spider-Man được tiết lộ, Peter Parker tìm kiếm sự giúp đỡ từ Doctor Strange để khôi phục bí mật của mình.',
    releaseYear: 2021,
    posterUrl: 'https://via.placeholder.com/350x500?text=Spider-Man',
    trailerUrl: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
    genres: [mockGenres[0], mockGenres[4]], // Hành động, Viễn tưởng
    rating: 8.5,
    views: 145000,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'movie-2',
    title: 'Tình Yêu và Tham Vọng',
    description: 'Câu chuyện về một nữ doanh nhân thành đạt phải lựa chọn giữa tình yêu và sự nghiệp.',
    releaseYear: 2020,
    posterUrl: 'https://via.placeholder.com/350x500?text=Love+and+Ambition',
    trailerUrl: 'https://www.youtube.com/watch?v=example1',
    genres: [mockGenres[1], mockGenres[6]], // Tình cảm, Tâm lý
    rating: 7.8,
    views: 98000,
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z'
  },
  {
    id: 'movie-3',
    title: 'Vượt Ngục',
    description: 'Một người đàn ông bị kết án oan cố gắng vượt ngục để minh oan cho mình.',
    releaseYear: 2019,
    posterUrl: 'https://via.placeholder.com/350x500?text=Prison+Break',
    trailerUrl: 'https://www.youtube.com/watch?v=example2',
    genres: [mockGenres[0], mockGenres[5], mockGenres[6]], // Hành động, Phiêu lưu, Tâm lý
    rating: 8.9,
    views: 210000,
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2023-02-01T00:00:00Z'
  },
  {
    id: 'movie-4',
    title: 'Gia Đình Hạnh Phúc',
    description: 'Câu chuyện về một gia đình nhỏ vượt qua những khó khăn trong cuộc sống để tìm thấy hạnh phúc.',
    releaseYear: 2022,
    posterUrl: 'https://via.placeholder.com/350x500?text=Happy+Family',
    trailerUrl: 'https://www.youtube.com/watch?v=example3',
    genres: [mockGenres[2], mockGenres[7]], // Hài hước, Gia đình
    rating: 7.5,
    views: 65000,
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2023-03-01T00:00:00Z'
  },
  {
    id: 'movie-5',
    title: 'Lời Nguyền',
    description: 'Một nhóm bạn trẻ vô tình giải phóng một lời nguyền cổ xưa và phải tìm cách sống sót.',
    releaseYear: 2020,
    posterUrl: 'https://via.placeholder.com/350x500?text=The+Curse',
    trailerUrl: 'https://www.youtube.com/watch?v=example4',
    genres: [mockGenres[3], mockGenres[6]], // Kinh dị, Tâm lý
    rating: 6.9,
    views: 78000,
    createdAt: '2023-04-01T00:00:00Z',
    updatedAt: '2023-04-01T00:00:00Z'
  },
  {
    id: 'movie-6',
    title: 'Siêu Nhân',
    description: 'Câu chuyện về một người đàn ông bình thường phát hiện ra mình có khả năng siêu nhiên.',
    releaseYear: 2021,
    posterUrl: 'https://via.placeholder.com/350x500?text=Superhuman',
    trailerUrl: 'https://www.youtube.com/watch?v=example5',
    genres: [mockGenres[0], mockGenres[4]], // Hành động, Viễn tưởng
    rating: 7.2,
    views: 91000,
    createdAt: '2023-05-01T00:00:00Z',
    updatedAt: '2023-05-01T00:00:00Z'
  }
];

export const mockMovieListResponse: MovieListResponse = {
  movies: mockMovies,
  totalPages: 1,
  currentPage: 1,
  totalMovies: mockMovies.length
}; 