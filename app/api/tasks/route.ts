import { NextResponse } from 'next/server';
import { serverFetch, isServerAuthenticated } from '@/lib/server-api';

export async function GET(request: Request) {
  try {
    // Check if user is authenticated
    if (!isServerAuthenticated()) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized',
        data: [] 
      }, { status: 401 });
    }

    // Get query parameters from URL
    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const assigneeId = url.searchParams.get('assigneeId');
    const type = url.searchParams.get('type');
    const searchTerm = url.searchParams.get('searchTerm');

    // Build query string
    const queryParams = new URLSearchParams();
    if (projectId) queryParams.append('projectId', projectId);
    if (status) queryParams.append('status', status);
    if (priority) queryParams.append('priority', priority);
    if (assigneeId) queryParams.append('assigneeId', assigneeId);
    if (type) queryParams.append('type', type);
    if (searchTerm) queryParams.append('searchTerm', searchTerm);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/tasks${queryString}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch tasks',
      data: [] 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    if (!isServerAuthenticated()) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized',
        data: null 
      }, { status: 401 });
    }

    // Parse the request body
    const taskData = await request.json();

    // Call our backend API using the serverFetch utility
    const data = await serverFetch('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create task',
      data: null
    }, { status: 500 });
  }
}
