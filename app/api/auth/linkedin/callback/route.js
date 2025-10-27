import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json({ error: 'No code from LinkedIn' }, { status: 400 });
    }

    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback',
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET
      })
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error('LinkedIn token error:', text);
      return NextResponse.json({ error: 'Failed to exchange code for token' }, { status: 500 });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Fetch basic profile and email
    const profileRes = await fetch('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const profileJson = await profileRes.json();

    const emailRes = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const emailJson = await emailRes.json();

    const linkedinId = profileJson.id;
    const firstName = profileJson.localizedFirstName || profileJson.firstName?.localized?.en_US || '';
    const lastName = profileJson.localizedLastName || profileJson.lastName?.localized?.en_US || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const email = (emailJson?.elements?.[0]?.['handle~']?.emailAddress) || null;

    await connectDB();

    // Find or create user
    let user = null;
    if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      // Create a new user with OAuth flag
      user = new User({
        name: fullName || 'LinkedIn User',
        email: email || `linkedin_${linkedinId}@noemail.local`,
        isOAuthUser: true,
        linkedinId,
        linkedinAccessToken: accessToken
      });
      await user.save();
    } else {
      // Link LinkedIn to existing user
      user.linkedinId = linkedinId;
      user.linkedinAccessToken = accessToken;
      await user.save();
    }

    // Issue our JWT and redirect to a client page that will set localStorage
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    // Redirect to a lightweight client page that stores token and redirects to dashboard
    const redirectUrl = `/linkedin-callback?token=${token}`;
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error('LinkedIn callback error:', err);
    return NextResponse.json({ error: 'LinkedIn callback failed' }, { status: 500 });
  }
}
