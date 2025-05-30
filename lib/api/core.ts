import { refreshAccessToken, isAccessTokenExpired, isRefreshTokenExpired } from "../auth";

// Base API URL from environment variable or fallback to localhost with correct port
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// JWT expiration settings to match backend
export const JWT_EXPIRES_DAYS = 1; // Matches JWT_EXPIRES_IN=1d in backend
export const JWT_REFRESH_EXPIRES_DAYS = 7; // Matches JWT_REFRESH_EXPIRES_IN=7d in backend

// Function to dispatch auth errors to be caught by AuthErrorHandler
function dispatchAuthError(message: string) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('auth-error', { 
      detail: { error: message } 
    });
    window.dispatchEvent(event);
  }
}

// Function to dispatch API errors to be caught by ApiErrorBoundary
function dispatchApiError(message: string) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('api-error', { 
      detail: { error: message } 
    });
    window.dispatchEvent(event);
  }
}

// Generic API request function with authentication and token refresh handling
export const apiRequest = async (
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET', 
  body?: any,
  customHeaders: Record<string, string> = {}
) => {
  // Get auth token from local storage (browser only)
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('authToken') || '';
    
    // If token is likely expired but we have a valid refresh token, try to refresh before making the request
    if (token && isAccessTokenExpired() && !isRefreshTokenExpired()) {
      try {
        console.log('Token appears expired, attempting to refresh before request');
        const refreshResult = await refreshAccessToken();
        token = refreshResult.accessToken;
      } catch (refreshError) {
        console.error('Failed to refresh token before request:', refreshError);
        // Continue with the original token and let the 401 handler deal with it
      }
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return await handleResponse(response);
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    
    // Notify auth error handler if it's an auth-related error
    if (error instanceof Error) {
      if (error.message === 'Session expired. Please log in again.' || 
          error.message === 'Authentication required. Please log in.') {
        dispatchAuthError(error.message);
      } else {
        // For non-auth errors, dispatch to ApiErrorBoundary
        dispatchApiError(error.message);
      }
    }
    
    throw error;
  }
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  // For DELETE or 204 No Content responses
  if (response.status === 204) {
    return null;
  }

  // Check content type before parsing as JSON
  const contentType = response.headers.get('content-type');
  
  // Handle non-JSON responses
  if (contentType && !contentType.includes('application/json')) {
    console.error('Received non-JSON response:', contentType);
    const text = await response.text();
    const previewText = text.substring(0, 100) + (text.length > 100 ? '...' : '');
    const errorMessage = `Received non-JSON response: ${previewText}`;
    dispatchApiError(errorMessage);
    throw new Error(errorMessage);
  }
  
  let data;
  try {
    data = await response.json();
  } catch (e) {
    console.error('Failed to parse response as JSON', e);
    const errorMessage = 'Failed to parse server response';
    dispatchApiError(errorMessage);
    throw new Error(errorMessage);
  }
  
  if (!response.ok) {
    // Handle specific error status codes
    if (response.status === 401) {
      // Check if we have a refresh token before attempting refresh
      const hasRefreshToken = typeof window !== 'undefined' && !!localStorage.getItem('refreshToken');
      
      if (hasRefreshToken) {
        try {
          // Attempt to refresh the token if unauthorized
          await refreshAccessToken();
          // Let the caller retry with the new token
          throw new Error('TOKEN_REFRESHED');
        } catch (refreshError) {
          if (refreshError instanceof Error && refreshError.message === 'TOKEN_REFRESHED') {
            throw refreshError; // Propagate the token refreshed signal
          }
          
          // If token refresh fails, clear auth and require re-login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
          
          // Throw a consistent error message for auth failures
          const authErrorMessage = 'Session expired. Please log in again.';
          dispatchAuthError(authErrorMessage);
          throw new Error(authErrorMessage);
        }
      } else {
        // No refresh token available, clear auth and require re-login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
        const authErrorMessage = 'Authentication required. Please log in.';
        dispatchAuthError(authErrorMessage);
        throw new Error(authErrorMessage);
      }
    }
    
    // For other errors, use the error message from the API or a fallback
    const errorMessage = data?.message || data?.error || 'An error occurred while fetching data';
    dispatchApiError(errorMessage);
    throw new Error(errorMessage);
  }
  
  // Backend typically wraps responses in a success flag and data field
  if (data.success === false) {
    const errorMessage = data.message || 'API returned a failure response';
    dispatchApiError(errorMessage);
    throw new Error(errorMessage);
  }
  
  // Handle API responses that wrap data in a 'data' field
  return data.data !== undefined ? data.data : data;
};

// Helper function to retry a request after token refresh
export const retryRequestWithNewToken = async <T>(
  requestFn: () => Promise<T>,
  maxRetries = 1
): Promise<T> => {
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      return await requestFn();
    } catch (error) {
      if (error instanceof Error && error.message === 'TOKEN_REFRESHED' && retries < maxRetries) {
        // Retry the request with the new token
        retries++;
        continue;
      }
      
      // Either we've hit max retries or it's not a token refresh error
      throw error;
    }
  }
  
  // This should never be reached due to the throw in the catch block
  throw new Error('Maximum retry attempts exceeded');
};

// Helper to build query string from filters object
export const buildQueryString = (filters: Record<string, any> = {}): string => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        // Handle array values (e.g., multiple statuses like "status=In Progress,Review")
        queryParams.append(key, value.join(','));
      } else if (value instanceof Date) {
        // Handle Date objects
        queryParams.append(key, value.toISOString());
      } else {
        // Handle regular values with proper encoding
        queryParams.append(key, String(value));
      }
    }
  });
  
  return queryParams.toString() ? `?${queryParams.toString()}` : '';
}; 