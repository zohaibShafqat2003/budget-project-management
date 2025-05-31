import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000/api';

export async function POST(
  request: Request,
  { params }: { params: { sprintId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken');

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const res = await fetch(`${BACKEND}/sprints/${params.sprintId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to complete sprint' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Sprint completion error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 