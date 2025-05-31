import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000/api';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Validate required fields
    if (!payload.email || !payload.password || !payload.firstName || !payload.lastName || !payload.role) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['Admin', 'Developer'].includes(payload.role)) {
      return NextResponse.json(
        { message: 'Invalid role. Must be either Admin or Developer' },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || 'Registration failed' },
        { status: res.status }
      );
    }

    // Create response with data
    const response = NextResponse.json(data);

    // Store tokens in cookies if provided
    if (data.accessToken) {
      response.cookies.set('authToken', data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    if (data.refreshToken) {
      response.cookies.set('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 