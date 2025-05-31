import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000/api';

// GET handler template
export async function GET(
  request: Request,
  { params }: { params: Record<string, string> } = { params: {} }
) {
  const token = cookies().get('authToken')?.value;
  const url = `${BACKEND}${request.url.split('/api')[1]}`;

  const res = await fetch(url, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    }
  });

  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}

// POST handler template
export async function POST(
  request: Request,
  { params }: { params: Record<string, string> } = { params: {} }
) {
  const token = cookies().get('authToken')?.value;
  const url = `${BACKEND}${request.url.split('/api')[1]}`;
  const payload = await request.json();

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}

// PUT handler template
export async function PUT(
  request: Request,
  { params }: { params: Record<string, string> } = { params: {} }
) {
  const token = cookies().get('authToken')?.value;
  const url = `${BACKEND}${request.url.split('/api')[1]}`;
  const payload = await request.json();

  const res = await fetch(url, {
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

// DELETE handler template
export async function DELETE(
  request: Request,
  { params }: { params: Record<string, string> } = { params: {} }
) {
  const token = cookies().get('authToken')?.value;
  const url = `${BACKEND}${request.url.split('/api')[1]}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    }
  });

  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
} 