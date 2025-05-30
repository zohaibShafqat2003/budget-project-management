import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '../lib/auth';
import { useAuth } from './auth-context';

// This component can be used to handle auth errors and session expiration
export function AuthErrorHandler() {
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    // Listen for auth-related error events
    const handleAuthError = (event: CustomEvent) => {
      const error = event.detail?.error;
      
      if (error === 'Session expired. Please log in again.' || 
          error === 'Authentication required. Please log in.') {
        setShowSessionExpired(true);
        
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login?expired=true');
        }, 2000);
      }
    };

    // Create a typed event listener
    const listener = (e: Event) => {
      if (e instanceof CustomEvent) {
        handleAuthError(e);
      }
    };

    // Add event listener for auth errors
    window.addEventListener('auth-error', listener as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('auth-error', listener as EventListener);
    };
  }, [router]);

  // Check if the user is no longer authenticated but the app thinks they are
  useEffect(() => {
    if (!isLoading && isLoggedIn && !isAuthenticated()) {
      // Dispatch auth error event
      const event = new CustomEvent('auth-error', {
        detail: { error: 'Session expired. Please log in again.' }
      });
      window.dispatchEvent(event);
    }
  }, [isLoading, isLoggedIn]);

  if (!showSessionExpired) {
    return null;
  }

  // Show a notification when session expires
  return (
    <div className="fixed top-4 right-4 z-50 p-4 bg-red-500 text-white rounded shadow-lg animate-fade-in">
      <p className="font-medium">Session expired</p>
      <p className="text-sm">Redirecting to login...</p>
    </div>
  );
}

// Helper function to dispatch auth errors from anywhere in the app
export function reportAuthError(error: string) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('auth-error', { 
      detail: { error } 
    });
    window.dispatchEvent(event);
  }
} 