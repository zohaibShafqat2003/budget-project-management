import { NextResponse } from 'next/server';
import { serverFetch, isServerAuthenticated } from '@/lib/server-api';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/expenses/:id
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

    const { id } = params;

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/expenses/${id}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch expense',
      data: null 
    }, { status: 500 });
  }
}

// PUT /api/expenses/:id
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

    const { id } = params;
    const expenseData = await request.json();

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData)
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update expense',
      data: null 
    }, { status: 500 });
  }
}

// DELETE /api/expenses/:id
export async function DELETE(request: Request, { params }: Params) {
  try {
    // Check if user is authenticated
    if (!isServerAuthenticated()) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { id } = params;

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/expenses/${id}`, {
      method: 'DELETE'
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete expense' 
    }, { status: 500 });
  }
} 