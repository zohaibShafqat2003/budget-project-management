import { NextResponse } from 'next/server';
import { serverFetch, isServerAuthenticated } from '@/lib/server-api';

interface Params {
  params: {
    boardId: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    // Check if user is authenticated
    if (!isServerAuthenticated()) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized',
        data: [] 
      }, { status: 401 });
    }

    const { boardId } = params;

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/boards/${boardId}/sprints`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sprints:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch sprints',
      data: [] 
    }, { status: 500 });
  }
} 