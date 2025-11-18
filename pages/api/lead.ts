import type { NextApiRequest, NextApiResponse } from 'next';

type LeadBody = {
  name?: string;
  email?: string;
  phone?: string;
  note?: string;
  source_url?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const WP_BASE = process.env.WP_BASE;
  const WP_USER = process.env.WP_USER;
  const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

  if (!WP_BASE || !WP_USER || !WP_APP_PASSWORD) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  const body: LeadBody = req.body || {};
  const { name, email, phone, note, source_url } = body;

  if (!email && !phone) {
    return res.status(400).json({ error: 'email or phone required' });
  }

  const authHeader =
    'Basic ' + Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');

  try {
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

    const data = await wpRes.json().catch(() => null);

    if (!wpRes.ok) {
      return res.status(500).json({ error: 'WP error', details: data });
    }

    return res.status(200).json({
      status: 'ok',
      lead_id: data?.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: 'upstream_error' });
  }
}
