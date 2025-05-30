import { NextResponse } from 'next/server';
import { serverFetch, isServerAuthenticated } from '@/lib/server-api';

interface Params {
  params: {
    projectId: string;
  };
}

// GET /api/projects/:projectId/budgets/summary
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

    const { projectId } = params;

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/projects/${projectId}/budgets/summary`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching budget summary:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch budget summary',
      data: null 
    }, { status: 500 });
  }
} 