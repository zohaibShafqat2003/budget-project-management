import { apiRequest, retryRequestWithNewToken } from './core';
import { User } from '../types';

// User API functions
export const usersApi = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    return retryRequestWithNewToken(() => 
      apiRequest('/users')
    );
  },
  
  // Get a user by ID
  getById: async (userId: string): Promise<User> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/users/${userId}`)
    );
  },
  
  // Get the current user's profile
  getProfile: async (): Promise<User> => {
    return retryRequestWithNewToken(() => 
      apiRequest('/users/me')
    );
  },
  
  // Update a user
  update: async (userId: string, userData: Partial<User>): Promise<User> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/users/${userId}`, 'PUT', userData)
    );
  },
  
  // Update the current user's profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    return retryRequestWithNewToken(() => 
      apiRequest('/users/me', 'PUT', userData)
    );
  }
}; 