import { NextResponse } from 'next/server';
import { serverFetch, isServerAuthenticated } from '@/lib/server-api';

interface Params {
  params: {
    taskId: string;
  };
}

export async function GET(request: Request, { params }: Params) {
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

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/tasks/${taskId}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch task',
      data: null
    }, { status: 500 });
  }
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

    const { taskId } = params;
    const taskData = await request.json();

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update task',
      data: null
    }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    // Check if user is authenticated
    if (!isServerAuthenticated()) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { taskId } = params;

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/tasks/${taskId}`, {
      method: 'DELETE'
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete task'
    }, { status: 500 });
  }
} 