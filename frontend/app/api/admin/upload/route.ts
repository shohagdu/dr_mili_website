import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const COOKIE_NAME = 'admin_token';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Read incoming multipart and forward to backend with auth.
  const incoming = await req.formData();
  const file = incoming.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const fwd = new FormData();
  fwd.append('file', file, file.name);

  const backendRes = await fetch(`${API_URL}/admin/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fwd,
  });

  const body = await backendRes.json().catch(() => ({}));
  return NextResponse.json(body, { status: backendRes.status });
}
