import { NextResponse } from 'next/server';
import { serverFetch, isServerAuthenticated } from '@/lib/server-api';

interface Params {
  params: {
    projectId: string;
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

    const { projectId } = params;

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/projects/${projectId}/boards`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch boards',
      data: [] 
    }, { status: 500 });
  }
}

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

    const { projectId } = params;
    const boardData = await request.json();

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/projects/${projectId}/boards`, {
      method: 'POST',
      body: JSON.stringify(boardData)
    });
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create board',
      data: null
    }, { status: 500 });
  }
} 