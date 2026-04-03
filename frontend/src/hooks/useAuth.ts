import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { authAPI } from '@api/auth';

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, accessToken, isLoading, error, setAuthenticatedState, logout, setError, setIsLoading } =
    useAuthStore();

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const tokenResponse = await authAPI.login(username, password);
      localStorage.setItem('accessToken', tokenResponse.access_token);
      useAuthStore.getState().setAccessToken(tokenResponse.access_token);

      // Fetch user info
      const userData = await authAPI.me();
      setAuthenticatedState(userData, tokenResponse.access_token);

      navigate('/chat');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Login failed';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authAPI.register(username, password);
      // Auto-login after registration
      await login(username, password);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Registration failed';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return false;
    }

    useAuthStore.getState().setAccessToken(token);

    try {
      const userData = await authAPI.me();
      setAuthenticatedState(userData, token);
      return true;
    } catch (err) {
      logout();
      localStorage.removeItem('accessToken');
      return false;
    }
  };

  return {
    user,
    accessToken,
    isLoading,
    error,
    isAuthenticated: !!user && !!accessToken,
    login,
    register,
    logout: handleLogout,
    checkAuth,
  };
};
