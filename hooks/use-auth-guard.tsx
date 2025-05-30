'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth-context';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export function useAuthGuard() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Skip during server-side rendering or while auth is still loading
    if (typeof window === 'undefined' || isLoading) {
      return;
    }

    // Check if the current route is public
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    if (!isLoggedIn && !isPublicRoute) {
      // Redirect to login if trying to access protected route while not logged in
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      setIsAuthorized(false);
    } else if (isLoggedIn && isPublicRoute && pathname !== '/logout') {
      // Redirect to dashboard if already logged in and trying to access auth pages
      router.push('/dashboard');
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, [isLoggedIn, isLoading, pathname, router]);

  return { isAuthorized, isLoading: isLoading || !isAuthorized };
} 