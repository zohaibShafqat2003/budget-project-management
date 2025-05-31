import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000/api';

export async function GET(
  request: Request,
  { params }: { params: { id: string; boardId: string } }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  const res = await fetch(`${BACKEND}/projects/${params.id}/boards/${params.boardId}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    }
  });

  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; boardId: string } }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  const payload = await request.json();
  const res = await fetch(`${BACKEND}/projects/${params.id}/boards/${params.boardId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; boardId: string } }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  const res = await fetch(`${BACKEND}/projects/${params.id}/boards/${params.boardId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    }
  });

  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
} 