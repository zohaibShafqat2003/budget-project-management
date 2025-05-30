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
    
    // Get query parameters from URL
    const url = new URL(request.url);
    const epicId = url.searchParams.get('epicId');
    const sprintId = url.searchParams.get('sprintId');
    const status = url.searchParams.get('status');
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (epicId) queryParams.append('epicId', epicId);
    if (sprintId) queryParams.append('sprintId', sprintId);
    if (status) queryParams.append('status', status);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/projects/${projectId}/stories${queryString}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch stories',
      data: [] 
    }, { status: 500 });
  }
} 