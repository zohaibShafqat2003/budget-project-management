import { cookies } from 'next/headers';
import { BACKEND_API_URL } from './api-config';

/**
 * Make an API request to our backend from a server component or API route
 */
export async function serverFetch(endpoint: string, options: RequestInit = {}) {
  try {
    // Get auth token from cookies
    const cookieStore = cookies();
    const authToken = cookieStore.get('authToken')?.value;
    
    // Set up headers with auth token if available
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    
    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }
    
    const url = `${BACKEND_API_URL}${endpoint}`;
    console.log(`[Server API] Fetching: ${url}`);
    
    // Make the API request
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    console.log(`[Server API] Response status: ${response.status} for ${url}`);
    
    // Handle response
    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `API request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If JSON parsing fails, try to get text content
        try {
          const textContent = await response.text();
          if (textContent) {
            errorMessage += `: ${textContent.substring(0, 100)}...`;
          }
        } catch (textError) {
          // Ignore text parsing errors
        }
      }
      
      throw new Error(errorMessage);
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
export function isServerAuthenticated(): boolean {
  const cookieStore = cookies();
  const authToken = cookieStore.get('authToken')?.value;
  return !!authToken;
} 