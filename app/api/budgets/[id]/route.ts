import { NextResponse } from 'next/server';
import { serverFetch, isServerAuthenticated } from '@/lib/server-api';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/budgets/:id
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
    const data = await serverFetch(`/budgets/${id}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching budget item:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch budget item',
      data: null 
    }, { status: 500 });
  }
}

// PUT /api/budgets/:id
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
    const budgetItemData = await request.json();

    // Call our backend API using the serverFetch utility
    const data = await serverFetch(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budgetItemData)
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating budget item:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update budget item',
      data: null 
    }, { status: 500 });
  }
}

// DELETE /api/budgets/:id
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
    const data = await serverFetch(`/budgets/${id}`, {
      method: 'DELETE'
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting budget item:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete budget item' 
    }, { status: 500 });
  }
} 