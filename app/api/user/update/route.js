import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import User from '../../../../models/User'
import connectDB from '../../../../lib/mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Connect to database
    await connectDB()

    // Get request body
    const body = await request.json()
    const { name, theme } = body

    // Find and update user
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (name && typeof name === 'string' && name.trim()) {
      user.name = name.trim()
    }
    if (theme && (theme === 'light' || theme === 'dark')) {
      user.theme = theme
    }
    await user.save()

    return NextResponse.json({ 
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        theme: user.theme
      }
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ 
      error: 'Could not update user information' 
    }, { status: 500 })
  }
}