import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../../../../models/User';
import connectDB from '../../../../lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export async function POST(request) {
  try {
    await connectDB();
  const body = await request.json();
  console.log('Google /auth/google incoming body:', JSON.stringify(body).slice(0, 1000));
  const { credential } = body;
    if (!credential) {
      return NextResponse.json({ error: 'Missing Google credential' }, { status: 400 });
    }

  // Verify Google ID token using google-auth-library
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
    }

    // Find or create user
    console.log('Looking for user with email:', payload.email);
    let user = await User.findOne({ email: payload.email });
    console.log('Existing user found?', !!user);
    
    if (!user) {
      console.log('Creating new user with data:', {
        email: payload.email,
        name: payload.name,
        isOAuthUser: true
      });
      try {
        user = await User.create({
          email: payload.email,
          name: payload.name,
          isOAuthUser: true, // Mark as OAuth user
          resumePath: null
        });
        console.log('New user created successfully:', user);
      } catch (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return NextResponse.json({
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        resumeUrl: user.resumeUrl,
        theme: user.theme
      }
    });
  } catch (error) {
    console.error('Google login error:', error?.toString(), error);
    // return more detailed message in dev only
    return NextResponse.json({ error: 'Internal server error', detail: error?.message || String(error) }, { status: 500 });
  }
}
