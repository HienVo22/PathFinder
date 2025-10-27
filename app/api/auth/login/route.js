import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../../../../models/User'
import connectDB from '../../../../lib/mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request) {
  try {
    await connectDB()
    
    const { email, password } = await request.json()

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        resumeUrl: user.resumeUrl,
        theme: user.theme
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
