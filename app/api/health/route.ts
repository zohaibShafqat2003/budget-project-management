import { NextResponse } from 'next/server';
import { serverFetch } from '@/lib/server-api';
import { BACKEND_API_URL } from '@/lib/api-config';

// GET /api/health
export async function GET() {
  try {
    // Check connection to backend API
    const backendStatus = await fetch(`${BACKEND_API_URL}/health`).then(
      res => res.ok ? 'online' : 'offline'
    ).catch(() => 'offline');
    
    // Return status information
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      backend: backendStatus,
      environment: process.env.NODE_ENV || 'development',
      apiUrl: BACKEND_API_URL
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({ 
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 500 });
  }
} 