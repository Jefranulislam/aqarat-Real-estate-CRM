// Auth utilities for client-side authentication
import { apiClient } from './api-client';

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const logout = () => {
  console.log('Logging out user...');
  apiClient.logout();
  if (typeof window !== 'undefined') {
    console.log('Redirecting to login page');
    window.location.href = '/auth/login';
  }
};

export const getCurrentUser = () => {
  return apiClient.getCurrentUser();
};

export const getUser = async () => {
  try {
    // First try to get user from localStorage (faster)
    const localUser = getCurrentUser();
    if (localUser) {
      return localUser;
    }
    
    // If not available locally, fetch from API
    return await apiClient.getProfile();
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};