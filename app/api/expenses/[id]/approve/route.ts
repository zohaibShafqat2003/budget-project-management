import { NextResponse } from 'next/server';
import { serverFetch, isServerAuthenticated } from '@/lib/server-api';

interface Params {
  params: {
    id: string;
  };
}

// POST /api/expenses/:id/approve
export async function POST(request: Request, { params }: Params) {
  try {
    // Check if user is authenticated
    if (!isServerAuthenticated()) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized',
        data: null 
      }, { status: 401 });
    }

    const { id } = params;

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/expenses/${id}/approve`, {
      method: 'POST'
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error approving expense:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to approve expense',
      data: null 
    }, { status: 500 });
  }
} 