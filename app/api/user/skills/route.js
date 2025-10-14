import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request) {
  try {
    // Debug logging: preview auth header and body
    try {
      const previewAuth = request.headers.get('authorization') || 'none';
      const bodyText = await request.clone().text();
      console.log('[user/skills] auth header present:', previewAuth !== 'none');
      console.log('[user/skills] body preview:', bodyText.slice(0, 1000));
    } catch (e) {
      console.log('[user/skills] failed to preview request body', e);
    }
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const newSkills = Array.isArray(body.skills) ? body.skills.map(s => String(s).trim()).filter(Boolean) : [];

    await connectDB();
    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Replace old skills with the new ones
    user.skills = Array.from(new Set(newSkills));

    const saved = await user.save();
    return NextResponse.json({ skills: Array.isArray(saved.skills) ? saved.skills : [] });
  } catch (err) {
    console.error('Save skills error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
