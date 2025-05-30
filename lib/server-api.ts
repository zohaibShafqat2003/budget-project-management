import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Make an API request to our backend from a server component or API route
 */
export async function serverFetch(endpoint: string, options: RequestInit = {}) {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken')?.value;
    
    // Set up headers with auth token if available
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    
    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }
    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    // Handle response
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // Check content type before parsing as JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    } else if (contentType && contentType.includes('text/html')) {
      // Handle HTML responses by returning a simplified error object
      const text = await response.text();
      console.error('Received HTML response instead of JSON:', text.substring(0, 200) + '...');
      return {
        success: false,
        error: 'Received HTML response instead of JSON',
        data: null
      };
    } else {
      // For other content types, try JSON first and fall back to text
      try {
        const data = await response.json();
        return data;
      } catch (err) {
        const text = await response.text();
        console.error('Failed to parse response as JSON:', text.substring(0, 200) + '...');
        return {
          success: false,
          error: 'Failed to parse response',
          data: null
        };
      }
    }
  } catch (error) {
    console.error('Server API request failed:', error);
    throw error;
  }
}

/**
 * Check if the user is authenticated based on cookies
 */
export async function isServerAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken')?.value;
  return !!authToken;
} 