import axios from 'axios';
import { API_ENDPOINTS } from './endpoints';

interface RefreshResponse {
  accessToken: string;
  message: string;
}

// Biến để theo dõi trạng thái refresh
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Endpoint refresh token - Backend sẽ tự lấy refresh token từ HTTP-Only cookie
 */
export const refreshTokenEndpoint = API_ENDPOINTS.AUTH.REFRESH;

/**
 * Thực hiện gọi API refresh token
 * Backend sẽ đọc refresh token từ HTTP-Only cookie và cấp access token mới
 */
export const refreshAccessToken = async (): Promise<string> => {
  try {
    // Gọi API refresh token, không cần gửi refresh token (vì backend đọc từ cookie)
    const response = await axios.post<RefreshResponse>(refreshTokenEndpoint, {}, {
      // Đảm bảo gửi cookies hiện tại
      withCredentials: true
    });
    
    // Trả về access token mới
    return response.data.accessToken;
  } catch (error) {
    console.error('Không thể refresh token:', error);
    throw error;
  }
};

/**
 * Đăng ký một callback để thực thi sau khi refresh token thành công
 * @param callback Function sẽ được gọi với access token mới
 */
export const onTokenRefreshed = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback);
};

/**
 * Thông báo cho tất cả subscribers về token mới
 * @param token Access token mới
 */
export const notifySubscribers = (token: string): void => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

/**
 * Lấy trạng thái refresh hiện tại
 */
export const getRefreshingStatus = (): boolean => {
  return isRefreshing;
};

/**
 * Cập nhật trạng thái refresh
 */
export const setRefreshingStatus = (status: boolean): void => {
  isRefreshing = status;
}; 