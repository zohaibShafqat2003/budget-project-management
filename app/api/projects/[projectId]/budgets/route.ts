import { NextResponse } from 'next/server';
import { serverFetch, isServerAuthenticated } from '@/lib/server-api';

interface Params {
  params: {
    projectId: string;
  };
}

// GET /api/projects/:projectId/budgets
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
    const data = await serverFetch(`/projects/${projectId}/budgets`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching budget items:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch budget items',
      data: [] 
    }, { status: 500 });
  }
}

// POST /api/projects/:projectId/budgets
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
    const budgetItemData = await request.json();

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/projects/${projectId}/budgets`, {
      method: 'POST',
      body: JSON.stringify(budgetItemData)
    });
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating budget item:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create budget item',
      data: null
    }, { status: 500 });
  }
} 