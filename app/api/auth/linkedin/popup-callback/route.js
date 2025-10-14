import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

// This route exchanges the code for an access token and returns a small HTML page
// which posts the access token back to the opener window and closes the popup.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.LINKEDIN_POPUP_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/popup-callback',
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

    // Return HTML that posts token to opener and closes
    const html = `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>LinkedIn Link</title></head>
  <body>
    <script>
      try {
        window.opener.postMessage({ linkedinAccessToken: '${accessToken}' }, window.location.origin);
      } catch (e) {
        console.error('postMessage failed', e);
      }
      window.close();
    </script>
    <p>Linking LinkedIn account... If this window does not close, you may close it manually.</p>
  </body>
</html>`;

    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  } catch (err) {
    console.error('Popup callback error:', err);
    return NextResponse.json({ error: 'Popup callback failed' }, { status: 500 });
  }
}
