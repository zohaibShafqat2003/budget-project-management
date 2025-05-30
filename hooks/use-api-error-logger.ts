'use client';

import { useCallback } from 'react';
import { reportApiError } from '@/components/api-error-boundary';

/**
 * A hook for logging API errors with detailed information
 * that can be used for debugging
 */
export function useApiErrorLogger() {
  const logApiError = useCallback((error: unknown, context?: string) => {
    // Create a detailed error message
    let errorMessage = 'API Error';
    
    if (context) {
      errorMessage = `${errorMessage} in ${context}`;
    }
    
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
      console.error(`${errorMessage}\n`, error.stack);
    } else {
      errorMessage = `${errorMessage}: ${String(error)}`;
      console.error(errorMessage);
    }
    
    // Report the error to the ApiErrorBoundary component
    reportApiError(errorMessage);
    
    // In development, also log the error to the console
    if (process.env.NODE_ENV === 'development') {
      console.group('API Error Details');
      console.error('Error:', error);
      console.error('Context:', context);
      console.error('Time:', new Date().toISOString());
      console.error('User Agent:', navigator.userAgent);
      console.groupEnd();
    }
    
    // Optionally, you could send the error to a logging service here
    
    return errorMessage;
  }, []);
  
  return { logApiError };
} 