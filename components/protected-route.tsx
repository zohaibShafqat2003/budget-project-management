'use client';

import React, { ReactNode } from 'react';
import { useAuthGuard } from '@/hooks';

interface ProtectedRouteProps {
  children: ReactNode;
  loadingComponent?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  loadingComponent = <div className="flex items-center justify-center min-h-screen">Loading...</div> 
}: ProtectedRouteProps) {
  const { isAuthorized, isLoading } = useAuthGuard();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return <>{loadingComponent}</>;
  }
  
  // Only render children if authorized
  return isAuthorized ? <>{children}</> : null;
} 