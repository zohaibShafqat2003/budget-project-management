import { NextResponse } from 'next/server';
import { serverFetch, isServerAuthenticated } from '@/lib/server-api';

interface Params {
  params: {
    storyId: string;
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

    const { storyId } = params;

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/stories/${storyId}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch story',
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

    const { storyId } = params;
    const storyData = await request.json();

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/stories/${storyId}`, {
      method: 'PUT',
      body: JSON.stringify(storyData)
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update story',
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

    const { storyId } = params;

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/stories/${storyId}`, {
      method: 'DELETE'
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete story'
    }, { status: 500 });
  }
} 