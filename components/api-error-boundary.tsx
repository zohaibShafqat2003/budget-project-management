'use client';

import React, { ReactNode, useEffect, useState } from 'react';

interface ApiErrorBoundaryProps {
  children: ReactNode;
}

interface ApiError {
  id: string;
  message: string;
  timestamp: number;
}

export function ApiErrorBoundary({ children }: ApiErrorBoundaryProps) {
  const [errors, setErrors] = useState<ApiError[]>([]);

  useEffect(() => {
    // Listen for API error events
    const handleApiError = (event: CustomEvent) => {
      const message = event.detail?.error || 'An unknown error occurred';
      
      // Add the error with a unique ID
      const newError: ApiError = {
        id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        message,
        timestamp: Date.now(),
      };
      
      setErrors(prev => [...prev, newError]);
      
      // Auto-remove errors after 5 seconds
      setTimeout(() => {
        setErrors(prev => prev.filter(error => error.id !== newError.id));
      }, 5000);
    };

    // Create a typed event listener
    const listener = (e: Event) => {
      if (e instanceof CustomEvent) {
        handleApiError(e);
      }
    };

    // Add event listener for API errors
    window.addEventListener('api-error', listener as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('api-error', listener as EventListener);
    };
  }, []);

  // Dismiss an error manually
  const dismissError = (id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  return (
    <>
      {children}
      
      {/* Error toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {errors.map(error => (
          <div 
            key={error.id}
            className="bg-red-500 text-white p-4 rounded shadow-lg animate-fade-in max-w-md"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Error</h3>
                <p>{error.message}</p>
              </div>
              <button 
                onClick={() => dismissError(error.id)}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// Helper function to dispatch API errors from anywhere in the app
export function reportApiError(error: string) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('api-error', { 
      detail: { error } 
    });
    window.dispatchEvent(event);
  }
} 