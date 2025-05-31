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

export async function login(email: string, password: string): Promise<AuthResponse> {
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
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    
    // Store tokens in localStorage - adjust based on your API response structure
    if (data.success) {
      const authData = data.data || data;
      localStorage.setItem('authToken', authData.accessToken || authData.token);
      localStorage.setItem('refreshToken', authData.refreshToken || '');
      localStorage.setItem('user', JSON.stringify(authData.user));
      
      return {
        user: authData.user,
        accessToken: authData.accessToken || authData.token,
        refreshToken: authData.refreshToken || ''
      };
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
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
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();
    
    // Store tokens in localStorage - adjust based on your API response structure
    if (data.success) {
      const authData = data.data || data;
      localStorage.setItem('authToken', authData.accessToken || authData.token);
      localStorage.setItem('refreshToken', authData.refreshToken || '');
      localStorage.setItem('user', JSON.stringify(authData.user));
      
      return {
        user: authData.user,
        accessToken: authData.accessToken || authData.token,
        refreshToken: authData.refreshToken || ''
      };
    } else {
      throw new Error(data.message || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
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
    
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear local storage even if there's an error
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    throw error;
  }
}

export async function refreshAccessToken(): Promise<{ accessToken: string; refreshToken?: string }> {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }
    
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
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
      
      return { 
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } else {
      throw new Error(data.message || 'Invalid response format from server');
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    // Clear authentication if refresh fails
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    throw error;
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

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const token = localStorage.getItem('authToken');
  return !!token;
}
