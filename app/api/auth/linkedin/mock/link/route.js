import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../../../lib/mongodb';
import User from '../../../../../../models/User';

// Dev-only mock link route: accepts { linkedinId, name, email, profileUrl, picture }
export async function POST(request) {
  try {
    // Only allow on localhost/dev - basic guard
    const host = request.headers.get('host') || '';
    if (!host.includes('localhost') && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Mock linking not allowed in production' }, { status: 403 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { linkedinId, name, email, profileUrl, picture } = body;
    if (!linkedinId) return NextResponse.json({ error: 'linkedinId required' }, { status: 400 });

    await connectDB();
    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.linkedinId = linkedinId;
    if (name) user.name = name;
    if (email) user.email = email;
    if (profileUrl) user.linkedinProfileUrl = profileUrl;
    if (picture) user.linkedinProfilePicture = picture;
    await user.save();

    return NextResponse.json({ message: 'Mock LinkedIn linked', linkedinId });
  } catch (err) {
    console.error('Mock link error:', err);
    return NextResponse.json({ error: 'Mock link failed' }, { status: 500 });
  }
}
