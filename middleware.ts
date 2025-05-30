import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Match the CORS origin in the backend config
const CORS_ORIGIN = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function middleware(request: NextRequest) {
  // Clone the request headers to add custom headers
  const requestHeaders = new Headers(request.headers);
  
  // Add CORS headers
  // IMPORTANT: This should be properly configured for production
  requestHeaders.set('Access-Control-Allow-Credentials', 'true');
  requestHeaders.set('Access-Control-Allow-Origin', CORS_ORIGIN); // Match backend's allowed origin
  requestHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  requestHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Respond to OPTIONS requests (pre-flight)
  if (request.method === 'OPTIONS') {
    return NextResponse.json({}, { status: 200, headers: requestHeaders });
  }

  // Forward the modified request
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Add CORS headers to the response
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', CORS_ORIGIN); // Match backend's allowed origin
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

// Only apply this middleware to API routes
export const config = {
  matcher: '/api/:path*',
}; 