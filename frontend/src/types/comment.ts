export interface Comment {
  id: string;
  comment: string;
  userId: string;
  userName?: string;
  user?: {
    id: string;
    full_name: string;
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
  comment: string;
  movieId: string;
  parentId?: string | null;
}

export interface UpdateCommentDto {
  comment: string;
}