import { Comment, CommentListResponse } from '@/types';
import { mockMovies } from './movies';
import { mockUsers } from './users';

// Comments cho phim 1 (Người Nhện)
export const movieOneComments: Comment[] = [
  {
    id: 'comment-1',
    content: 'Phim rất hay, diễn viên đóng quá xuất sắc!',
    userId: mockUsers[1].id,
    user: {
      id: mockUsers[1].id,
      name: mockUsers[1].full_name
    },
    movieId: mockMovies[0].id,
    parentId: null,
    createdAt: '2023-03-01T10:15:00Z',
    updatedAt: '2023-03-01T10:15:00Z',
    replies: [
      {
        id: 'comment-2',
        content: 'Đồng ý! Cảnh hành động quá đỉnh.',
        userId: mockUsers[2].id,
        user: {
          id: mockUsers[2].id,
          name: mockUsers[2].full_name
        },
        movieId: mockMovies[0].id,
        parentId: 'comment-1',
        createdAt: '2023-03-01T10:30:00Z',
        updatedAt: '2023-03-01T10:30:00Z'
      },
      {
        id: 'comment-3',
        content: 'Tôi thích nhất đoạn cuối phim.',
        userId: mockUsers[3].id,
        user: {
          id: mockUsers[3].id,
          name: mockUsers[3].full_name
        },
        movieId: mockMovies[0].id,
        parentId: 'comment-1',
        createdAt: '2023-03-01T11:00:00Z',
        updatedAt: '2023-03-01T11:00:00Z'
      }
    ]
  },
  {
    id: 'comment-4',
    content: 'Kỹ xảo quá đẹp, âm thanh cũng rất tốt.',
    userId: mockUsers[4].id,
    user: {
      id: mockUsers[4].id,
      name: mockUsers[4].full_name
    },
    movieId: mockMovies[0].id,
    parentId: null,
    createdAt: '2023-03-02T14:20:00Z',
    updatedAt: '2023-03-02T14:20:00Z',
    replies: []
  }
];

// Comments cho phim 2 (Tình Yêu và Tham Vọng)
export const movieTwoComments: Comment[] = [
  {
    id: 'comment-5',
    content: 'Phim tình cảm hay nhất năm!',
    userId: mockUsers[2].id,
    user: {
      id: mockUsers[2].id,
      name: mockUsers[2].full_name
    },
    movieId: mockMovies[1].id,
    parentId: null,
    createdAt: '2023-03-05T15:30:00Z',
    updatedAt: '2023-03-05T15:30:00Z',
    replies: [
      {
        id: 'comment-6',
        content: 'Diễn viên nữ chính diễn quá đạt.',
        userId: mockUsers[3].id,
        user: {
          id: mockUsers[3].id,
          name: mockUsers[3].full_name
        },
        movieId: mockMovies[1].id,
        parentId: 'comment-5',
        createdAt: '2023-03-05T16:15:00Z',
        updatedAt: '2023-03-05T16:15:00Z'
      }
    ]
  }
];

// Comments cho phim 3 (Vượt Ngục)
export const movieThreeComments: Comment[] = [
  {
    id: 'comment-7',
    content: 'Phim gay cấn đến phút cuối cùng!',
    userId: mockUsers[1].id,
    user: {
      id: mockUsers[1].id,
      name: mockUsers[1].full_name
    },
    movieId: mockMovies[2].id,
    parentId: null,
    createdAt: '2023-03-10T19:45:00Z',
    updatedAt: '2023-03-10T19:45:00Z',
    replies: []
  },
  {
    id: 'comment-8',
    content: 'Kịch bản quá hay, rất cuốn hút.',
    userId: mockUsers[4].id,
    user: {
      id: mockUsers[4].id,
      name: mockUsers[4].full_name
    },
    movieId: mockMovies[2].id,
    parentId: null,
    createdAt: '2023-03-11T08:30:00Z',
    updatedAt: '2023-03-11T08:30:00Z',
    replies: [
      {
        id: 'comment-9',
        content: 'Đúng vậy, không thể đoán được kết thúc.',
        userId: mockUsers[2].id,
        user: {
          id: mockUsers[2].id,
          name: mockUsers[2].full_name
        },
        movieId: mockMovies[2].id,
        parentId: 'comment-8',
        createdAt: '2023-03-11T09:15:00Z',
        updatedAt: '2023-03-11T09:15:00Z'
      }
    ]
  }
];

// Tất cả bình luận gốc (không bao gồm replies)
export const mockComments: Comment[] = [
  ...movieOneComments,
  ...movieTwoComments,
  ...movieThreeComments
];

// Hàm để lấy bình luận theo phim
export const getMovieComments = (movieId: string): CommentListResponse => {
  let comments: Comment[];
  
  switch(movieId) {
    case mockMovies[0].id:
      comments = movieOneComments;
      break;
    case mockMovies[1].id:
      comments = movieTwoComments;
      break;
    case mockMovies[2].id:
      comments = movieThreeComments;
      break;
    default:
      comments = [];
  }
  
  return {
    comments,
    totalPages: 1,
    currentPage: 1,
    totalComments: comments.length
  };
}; 