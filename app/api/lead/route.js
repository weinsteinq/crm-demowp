import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const WP_BASE = process.env.WP_BASE;
  const WP_USER = process.env.WP_USER;
  const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

  if (!WP_BASE || !WP_USER || !WP_APP_PASSWORD) {
    return NextResponse.json(
      { error: 'Server not configured' },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { name, email, phone, note, source_url } = body || {};

  if (!email && !phone) {
    return NextResponse.json(
      { error: 'email or phone required' },
      { status: 400 }
    );
  }

  const authHeader =
    'Basic ' + Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');

  const wpRes = await fetch(`${WP_BASE}/wp-json/demo/v1/lead`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      phone,
      note,
      source_url,
    }),
  });

  const data = await wpRes.json();

  if (!wpRes.ok) {
    return NextResponse.json(
      { error: 'WP error', details: data },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: 'ok',
    lead_id: data.id,
  });
}
