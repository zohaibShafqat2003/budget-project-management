import { NextResponse } from 'next/server';
import { serverFetch, isServerAuthenticated } from '@/lib/server-api';

interface Params {
  params: {
    taskId: string;
  };
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    // Check if user is authenticated
    if (!isServerAuthenticated()) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized',
        data: null
      }, { status: 401 });
    }

    const { taskId } = params;
    const { status } = await request.json();

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update task status',
      data: null
    }, { status: 500 });
  }
} 