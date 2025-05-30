import { NextResponse } from 'next/server';
import { serverFetch, isServerAuthenticated } from '@/lib/server-api';

interface Params {
  params: {
    storyId: string;
  };
}

export async function PUT(request: Request, { params }: Params) {
  try {
    // Check if user is authenticated
    if (!isServerAuthenticated()) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized',
        data: null
      }, { status: 401 });
    }

    const { storyId } = params;
    const { sprintId } = await request.json();

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/stories/${storyId}/sprint`, {
      method: 'PUT',
      body: JSON.stringify({ sprintId })
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error assigning story to sprint:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to assign story to sprint',
      data: null
    }, { status: 500 });
  }
} 