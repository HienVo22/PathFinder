import { NextResponse } from 'next/server';

// Redirects the user to LinkedIn's OAuth authorization page
export async function GET(request) {
  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    // If popup param present, use popup redirect URI so callback can postMessage to opener
    const url = new URL(request.url);
    const isPopup = url.searchParams.get('popup');
    const redirectUri = isPopup
      ? (process.env.LINKEDIN_POPUP_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/popup-callback')
      : (process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback');
    const scope = encodeURIComponent('r_liteprofile r_emailaddress');
    const state = Math.random().toString(36).substring(2, 15);

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;

    return NextResponse.redirect(authUrl);
  } catch (err) {
    console.error('LinkedIn start error:', err);
    return NextResponse.json({ error: 'Could not start LinkedIn OAuth' }, { status: 500 });
  }
}
