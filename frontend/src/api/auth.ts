import { apiClient } from './client';
import { LoginRequest, RegisterRequest, TokenResponse, User } from '@types/auth';

export const authAPI = {
  /**
   * Register a new user
   */
  register: async (username: string, password: string): Promise<User> => {
    const response = await apiClient.post<User>('/api/auth/register', {
      username,
      password,
    });
    return response.data;
  },

  /**
   * Login with username and password
   */
  login: async (username: string, password: string): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/api/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  /**
   * Refresh access token using refresh_token cookie
   */
  refresh: async (): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>(
      '/api/auth/refresh',
      {},
      { withCredentials: true }
    );
    return response.data;
  },

  /**
   * Get current authenticated user info
   */
  me: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  },
};
