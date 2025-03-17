export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export interface MessageResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
} 