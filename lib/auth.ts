import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
// API URL from environment variable or fallback to localhost
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface JWTPayload {
  userId: string
  email: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

// Functions to interact with the backend API

export async function login(email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> {
  try {
    // For development: Allow a demo account to bypass the backend
    if (email === "demo@example.com" && password === "demo123") {
      console.log("Using demo account login");
      const demoUser = {
        id: "demo-user-id",
        email: "demo@example.com",
        firstName: "Demo",
        lastName: "User",
        role: "Admin"
      };
      
      const demoAuthResponse = {
        user: demoUser,
        accessToken: "demo-access-token-" + Date.now(),
        refreshToken: "demo-refresh-token-" + Date.now()
      };
      
      // Store tokens in localStorage
      localStorage.setItem('authToken', demoAuthResponse.accessToken);
      localStorage.setItem('refreshToken', demoAuthResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(demoAuthResponse.user));
      
      // Set remember me flag
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        // Set long expiration - 30 days
        const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
      } else {
        localStorage.removeItem('rememberMe');
        // Set shorter expiration - 1 day
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
      }
      
      return demoAuthResponse;
    }
    
    // Normal backend authentication flow
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Promise.reject({ 
        code: 'login_failed', 
        message: errorData.message || 'Login failed' 
      });
    }

    const data = await response.json();
    
    // Store tokens in localStorage - adjust based on your API response structure
    if (data.success) {
      const authData = data.data || data;
      
      // Validate that we received the necessary data
      if (!authData.accessToken && !authData.token) {
        return Promise.reject({ 
          code: 'missing_access_token', 
          message: 'No access token received from server' 
        });
      }
      
      // Save tokens
      localStorage.setItem('authToken', authData.accessToken || authData.token);
      
      // Ensure we have a refresh token
      if (authData.refreshToken) {
        localStorage.setItem('refreshToken', authData.refreshToken);
      } else {
        console.warn('No refresh token received from server during login');
      }
      
      localStorage.setItem('user', JSON.stringify(authData.user));
      
      // Set remember me flag and token expiry
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        // Set long expiration - 30 days
        const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
      } else {
        localStorage.removeItem('rememberMe');
        // Set shorter expiration - 1 day
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
      }
      
      return {
        user: authData.user,
        accessToken: authData.accessToken || authData.token,
        refreshToken: authData.refreshToken || ''
      };
    } else {
      return Promise.reject({ 
        code: 'invalid_response', 
        message: data.message || 'Login failed' 
      });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    
    // If error already has a code, just pass it through
    if (error.code) {
    throw error;
    }
    
    // Otherwise wrap in a standard format
    throw { code: 'unknown_error', message: error.message || 'An unknown error occurred during login' };
  }
}

export async function register(userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}): Promise<AuthResponse> {
  try {
    // Format the data to match your backend API structure
    const requestData = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'User'
    };
    
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Promise.reject({ 
        code: 'registration_failed', 
        message: errorData.message || 'Registration failed' 
      });
    }

    const data = await response.json();
    
    // Store tokens in localStorage - adjust based on your API response structure
    if (data.success) {
      const authData = data.data || data;
      
      // Validate that we received the necessary data
      if (!authData.accessToken && !authData.token) {
        return Promise.reject({ 
          code: 'missing_access_token', 
          message: 'No access token received from server' 
        });
      }
      
      // Save tokens
      localStorage.setItem('authToken', authData.accessToken || authData.token);
      
      // Ensure we have a refresh token
      if (authData.refreshToken) {
        localStorage.setItem('refreshToken', authData.refreshToken);
      } else {
        console.warn('No refresh token received from server during registration');
      }
      
      localStorage.setItem('user', JSON.stringify(authData.user));
      
      return {
        user: authData.user,
        accessToken: authData.accessToken || authData.token,
        refreshToken: authData.refreshToken || ''
      };
    } else {
      return Promise.reject({ 
        code: 'invalid_response', 
        message: data.message || 'Registration failed' 
      });
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // If error already has a code, just pass it through
    if (error.code) {
    throw error;
    }
    
    // Otherwise wrap in a standard format
    throw { code: 'unknown_error', message: error.message || 'An unknown error occurred during registration' };
  }
}

export async function logout(): Promise<void> {
  try {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      // Only call backend if we have a token
      try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.warn('Logout error from server:', errorData.message);
        }
      } catch (e) {
        console.warn('Failed to contact server for logout:', e);
      }
    }
    
    // Always clear local storage regardless of server response
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('rememberMe');
    
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear local storage even if there's an error
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('rememberMe');
    throw error;
  }
}

export async function refreshAccessToken(): Promise<{ accessToken: string; refreshToken?: string }> {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      // Log for debugging but handle gracefully
      console.warn('No refresh token found - user needs to re-authenticate');
      return Promise.reject({ code: 'no_token', message: 'Session expired, please login again' });
    }
    
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Promise.reject({ 
        code: 'refresh_failed', 
        message: errorData.message || 'Failed to refresh token' 
      });
    }

    const data = await response.json();
    
    if (data.success) {
      // Adjust based on your API response structure
      const authData = data.data || data;
      const newAccessToken = authData.accessToken || authData.token;
      const newRefreshToken = authData.refreshToken || refreshToken;
      
      // Update stored tokens
      localStorage.setItem('authToken', newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      // Update token expiry based on rememberMe preference
      const isRemembered = localStorage.getItem('rememberMe') === 'true';
      if (isRemembered) {
        // Long expiration - 30 days
        const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
      } else {
        // Shorter expiration - 1 day
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
      }
      
      return { 
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } else {
      return Promise.reject({ 
        code: 'invalid_response', 
        message: data.message || 'Invalid response format from server' 
      });
    }
  } catch (error: any) {
    console.error('Token refresh error:', error);
    // Clear authentication if refresh fails
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('rememberMe');
    
    // If error already has a code, just pass it through
    if (error.code) {
    throw error;
    }
    
    // Otherwise wrap in a standard format
    throw { code: 'unknown_error', message: error.message || 'An unknown error occurred' };
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

export function isTokenExpired(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }
  
  const expiryTimeStr = localStorage.getItem('tokenExpiry');
  if (!expiryTimeStr) {
    return true;
  }
  
  const expiryTime = parseInt(expiryTimeStr, 10);
  return Date.now() > expiryTime;
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const token = localStorage.getItem('authToken');
  if (!token) {
    return false;
  }
  
  // Check if token has expired
  if (isTokenExpired()) {
    // Clear expired tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    return false;
  }
  
  return true;
}

/**
 * Get authentication headers for API requests
 * @returns Headers object with Authorization header
 */
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

/**
 * Download a file with authentication
 * @param url URL to download from
 * @param filename Filename to save as
 * @returns Promise resolving to true if download was successful
 */
export async function downloadWithAuth(url: string, filename: string): Promise<boolean> {
  try {
    if (typeof window === 'undefined') {
      console.error("Cannot download in a non-browser environment.");
      return false;
    }
    
    // Get the authentication token
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error("No authentication token found—user probably isn't logged in.");
      return false;
    }
    
    // Make authenticated request to download the file
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv'
      },
    });
    
    if (!response.ok) {
      console.error(`Download failed: ${response.status}`, await response.text());
      return false;
    }
    
    // Convert to blob and trigger download
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up
    URL.revokeObjectURL(objectUrl);
    
    return true;
  } catch (error) {
    console.error('Error downloading file:', error);
    return false;
  }
}
