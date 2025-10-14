import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';

// This route links a LinkedIn access token (obtained client-side via OAuth popup) to an existing logged-in user
export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    await connectDB();
    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { accessToken } = await request.json();
    if (!accessToken) return NextResponse.json({ error: 'No access token' }, { status: 400 });

    // Verify/access LinkedIn profile
    const profileRes = await fetch('https://api.linkedin.com/v2/me', { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!profileRes.ok) return NextResponse.json({ error: 'Invalid LinkedIn token' }, { status: 400 });
    const profileJson = await profileRes.json();

    user.linkedinId = profileJson.id;
    user.linkedinAccessToken = accessToken;
    await user.save();

    return NextResponse.json({ message: 'LinkedIn account linked' });
  } catch (err) {
    console.error('LinkedIn link error:', err);
    return NextResponse.json({ error: 'Link failed' }, { status: 500 });
  }
}
