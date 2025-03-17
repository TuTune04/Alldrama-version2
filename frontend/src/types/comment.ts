export interface Comment {
  id: string;
  content: string;
  userId: string;
  user?: {
    id: string;
    name: string;
  };
  movieId: string;
  parentId: string | null;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentListResponse {
  comments: Comment[];
  totalPages: number;
  currentPage: number;
  totalComments: number;
}

export interface AddCommentDto {
  content: string;
  movieId: string;
  parentId?: string | null;
}

export interface UpdateCommentDto {
  content: string;
} 