'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from './auth-context';
import { AuthErrorHandler } from './auth-error-handler';
import { ApiErrorBoundary } from './api-error-boundary';

interface AuthWrapperProps {
  children: ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <AuthProvider>
      <ApiErrorBoundary>
        <AuthErrorHandler />
        {children}
      </ApiErrorBoundary>
    </AuthProvider>
  );
} 