import { NextResponse } from 'next/server';
import { serverFetch, isServerAuthenticated } from '@/lib/server-api';

interface Params {
  params: {
    projectId: string;
  };
}

// GET /api/projects/:projectId/expenses
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
    const category = url.searchParams.get('category');
    const paymentStatus = url.searchParams.get('paymentStatus');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Build query string
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    if (paymentStatus) queryParams.append('paymentStatus', paymentStatus);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/projects/${projectId}/expenses${queryString}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch expenses',
      data: [] 
    }, { status: 500 });
  }
}

// POST /api/projects/:projectId/expenses
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
    const expenseData = await request.json();

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/projects/${projectId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expenseData)
    });
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create expense',
      data: null
    }, { status: 500 });
  }
} 