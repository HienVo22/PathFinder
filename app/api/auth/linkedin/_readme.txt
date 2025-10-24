Setup:

Set these environment variables in your .env.local:

LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
LINKEDIN_POPUP_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/popup-callback

Usage:
- Add <LinkedInButton /> to your login page to begin OAuth flow.
- After user authorizes on LinkedIn, they will be redirected to our callback which creates/links a user and redirects to /linkedin-callback?token=... which stores the token in localStorage and navigates to /dashboard.
- To allow existing logged-in users to link accounts, call POST /api/auth/linkedin/link with body { accessToken } and Authorization: Bearer <your-jwt>
 - To allow existing logged-in users to link accounts without losing session, use the popup flow.
	 - Add <LinkedInLinkPopup /> where users can link accounts. It opens a popup on /api/auth/linkedin/start?popup=1 which redirects back to /api/auth/linkedin/popup-callback.
	 - The popup callback exchanges code for an access token and postMessage's the token back to the opener which then calls POST /api/auth/linkedin/link.
