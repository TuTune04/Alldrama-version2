import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';
import { ErrorResponse } from '@/types';

// Cấu hình môi trường
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;

  private constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000, // 15 giây timeout
    });

    // Thêm interceptors
    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor - thêm token cho mỗi request
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - xử lý lỗi chung
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErrorResponse>) => {
        const errorResponse = error.response?.data;
        const status = error.response?.status;

        // Xử lý refresh token hoặc logout nếu token hết hạn
        if (status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }

        // Hiển thị thông báo lỗi
        const errorMessage = errorResponse?.message || 'Đã xảy ra lỗi không xác định';
        toast.error(errorMessage);

        return Promise.reject(error);
      }
    );
  }

  // Phương thức get generic
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  // Phương thức post generic
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  // Phương thức put generic
  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  // Phương thức delete generic
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Hỗ trợ hủy request với AbortController
  public createAbortController(): AbortController {
    return new AbortController();
  }
}

// Export API client
export const apiClient = ApiClient.getInstance(); 