c4acdc90 (Ziad 2025-09-30 08:40:07 -0400  1) import { NextResponse } from 'next/server';
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400  2) import { OAuth2Client } from 'google-auth-library';
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400  3) import jwt from 'jsonwebtoken';
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400  4) import User from '../../../../models/User';
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400  5) import connectDB from '../../../../lib/mongodb';
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400  6) 
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400  7) const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400  8) const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400  9) 
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 10) export async function POST(request) {
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 11)   try {
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 12)     await connectDB();
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 13)   const body = await request.json();
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 14)   console.log('Google /auth/google incoming body:', JSON.stringify(body).slice(0, 1000));
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 15)   const { credential } = body;
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 16)     if (!credential) {
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 17)       return NextResponse.json({ error: 'Missing Google credential' }, { status: 400 });
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 18)     }
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 19) 
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 20)   // Verify Google ID token using google-auth-library
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 21)   const client = new OAuth2Client(GOOGLE_CLIENT_ID);
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 22)   const ticket = await client.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 23)   const payload = ticket.getPayload();
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 24)     if (!payload) {
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 25)       return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 26)     }
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 27) 
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 28)     // Find or create user
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 29)     console.log('Looking for user with email:', payload.email);
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 30)     let user = await User.findOne({ email: payload.email });
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 31)     console.log('Existing user found?', !!user);
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 32)     
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 33)     if (!user) {
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 34)       console.log('Creating new user with data:', {
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 35)         email: payload.email,
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 36)         name: payload.name,
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 37)         isOAuthUser: true
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 38)       });
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 39)       try {
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 40)         user = await User.create({
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 41)           email: payload.email,
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 42)           name: payload.name,
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 43)           isOAuthUser: true, // Mark as OAuth user
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 44)           resumePath: null
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 45)         });
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 46)         console.log('New user created successfully:', user);
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 47)       } catch (createError) {
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 48)         console.error('Error creating user:', createError);
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 49)         throw createError;
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 50)       }
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 51)     }
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 52) 
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 53)     // Create JWT token
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 54)     const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 55)     return NextResponse.json({
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 56)       message: 'Google login successful',
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 57)       token,
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 58)       user: {
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 59)         id: user._id,
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 60)         email: user.email,
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 61)         name: user.name,
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 62)         resumeUrl: user.resumeUrl
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 63)       }
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 64)     });
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 65)   } catch (error) {
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 66)     console.error('Google login error:', error?.toString(), error);
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 67)     // return more detailed message in dev only
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 68)     return NextResponse.json({ error: 'Internal server error', detail: error?.message || String(error) }, { status: 500 });
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 69)   }
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 70) }
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400  1) import { NextResponse } from 'next/server';
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400  2) import connectDB from '../../../../lib/mongodb';
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400  3) import User from '../../../../models/User';
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400  4) 
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400  5) export async function GET() {
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400  6)     try {
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400  7)         await connectDB();
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400  8)         const users = await User.find({}).select('-password');  // Exclude password field
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400  9)         console.log('Found users:', users);
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 10)         return NextResponse.json({ users });
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 11)     } catch (error) {
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 12)         console.error('Error fetching users:', error);
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 13)         return NextResponse.json({ error: error.message }, { status: 500 });
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 14)     }
c4acdc90 (Ziad 2025-09-30 08:40:07 -0400 15) }
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400   7) // Google One Tap
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400   8) import Script from 'next/script'
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  19)     const [googleLoading, setGoogleLoading] = useState(false)
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  21)     // Google login handler
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  22)     const handleGoogleLogin = async (credential) => {
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  23)       setGoogleLoading(true)
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  24)       try {
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  25)         console.log('Sending credential to backend (first 20 chars):', credential?.slice(0, 20) + '...');
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  26)         const response = await fetch('/api/auth/google', {
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  27)           method: 'POST',
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  28)           headers: { 'Content-Type': 'application/json' },
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  29)           body: JSON.stringify({ credential })
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  30)         });
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  31)         
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  32)         const data = await response.json();
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  33)         console.log('Backend response:', data);
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  34)         
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  35)         if (response.ok && data.token) {
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  36)           console.log('Login successful, setting token and redirecting');
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  37)           localStorage.setItem('token', data.token);
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  38)           window.location.href = '/dashboard';  // Using window.location for hard reload
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  39)         } else {
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  40)           console.error('Login failed:', data.error || 'Unknown error');
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  41)           alert(data.error || 'Google login failed. Please try again.');
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  42)         }
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  43)       } catch (error) {
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  44)         console.error('Login error:', error);
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  45)         alert('Google login failed. Please try again.');
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  46)       } finally {
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  47)         setGoogleLoading(false)
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  48)       }
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  49)     }
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 112)             {/* Google Login Button */}
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 113)             <div className="mb-4 flex flex-col items-center">
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 114)               <style jsx global>{`
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 115)                 #google-login-btn {
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 116)                   width: 100% !important;
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 117)                 }
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 118)                 #google-login-btn > div {
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 119)                   width: 100% !important;
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 120)                   border-radius: 0.5rem !important;
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 121)                   background-color: rgb(243 244 246) !important;
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 122)                   transition: background-color 0.2s !important;
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 123)                 }
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 124)                 #google-login-btn > div:hover {
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 125)                   background-color: rgb(229 231 235) !important;
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 126)                 }
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 127)                 #google-login-btn > div > iframe {
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 128)                   width: 100% !important;
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 129)                 }
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 130)                 #google-login-btn > div > div {
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 131)                   padding: 8px !important;
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 132)                 }
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 133)               `}</style>
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 134)               <div id="google-login-btn" className="w-full flex justify-center mb-2"></div>
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 135)             </div>
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 136)             <Script
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 137)               src="https://accounts.google.com/gsi/client"
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 138)               strategy="afterInteractive"
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 139)               onLoad={() => {
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 140)                 console.log('Initializing Google Sign-In with client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 141)                 window.google?.accounts.id.initialize({
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 142)                   client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 143)                   callback: (response) => {
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 144)                     console.log('Google Sign-In response:', { ...response, credential: response.credential?.slice(0, 20) + '...' });
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 145)                     handleGoogleLogin(response.credential);
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 146)                   }
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 147)                 })
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 148)                 window.google?.accounts.id.renderButton(
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 149)                   document.getElementById('google-login-btn'),
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 150)                   {
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 151)                     theme: 'outline',
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 152)                     size: 'large',
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 153)                     width: '100%',
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 154)                     type: 'standard',
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 155)                     text: 'signin_with',
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 156)                     shape: 'rectangular'
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 157)                   }
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 158)                 )
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 159)               }}
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 160)             />
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 110)     // Google login method
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 111)     const googleLogin = async (credential) => {
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 112)       try {
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 113)         const response = await fetch('/api/auth/google', {
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 114)           method: 'POST',
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 115)           headers: { 'Content-Type': 'application/json' },
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 116)           body: JSON.stringify({ credential })
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 117)         })
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 118)         if (response.ok) {
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 119)           const data = await response.json()
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 120)           localStorage.setItem('token', data.token)
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 121)           setUser(data.user)
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 122)           return true
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 123)         } else {
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 124)           const error = await response.json()
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 125)           alert(error.error || 'Google login failed')
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 126)           return false
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 127)         }
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 128)       } catch (error) {
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 129)         console.error('Google login error:', error)
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 130)         alert('Google login failed. Please try again.')
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 131)         return false
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 132)       }
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 133)     }
c4acdc90 (Ziad          2025-09-30 08:40:07 -0400 134) 
adcf45fe (Ziad Abdelati 2025-09-30 07:47:20 -0500 136) 
adcf45fe (Ziad Abdelati 2025-09-30 07:47:20 -0500 137)     <AuthContext.Provider value={{ user, login, register, logout, loading, googleLogin }}>
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400  3) const MONGODB_URI = process.env.MONGODB_URI;
c4acdc90 (Ziad    2025-09-30 08:40:07 -0400 23)       dbName: 'pathfinder_test'
c4acdc90 (Ziad           2025-09-30 08:40:07 -0400  18)     required: function() {
c4acdc90 (Ziad           2025-09-30 08:40:07 -0400  19)       return !this.isOAuthUser; // Password only required for non-OAuth users
c4acdc90 (Ziad           2025-09-30 08:40:07 -0400  20)     }
c4acdc90 (Ziad           2025-09-30 08:40:07 -0400  21)   },
c4acdc90 (Ziad           2025-09-30 08:40:07 -0400  22)   isOAuthUser: {
c4acdc90 (Ziad           2025-09-30 08:40:07 -0400  23)     type: Boolean,
c4acdc90 (Ziad           2025-09-30 08:40:07 -0400  24)     default: false
