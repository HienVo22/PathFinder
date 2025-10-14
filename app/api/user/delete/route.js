import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import User from '../../../../models/User'
import connectDB from '../../../../lib/mongodb'
import fs from 'fs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function DELETE(request) {
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

    // Find the user
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete resume file if it exists
    if (user.resumePath && fs.existsSync(user.resumePath)) {
      try {
        fs.unlinkSync(user.resumePath)
      } catch (error) {
        console.error('Could not delete resume file:', error)
      }
    }

    // Delete user from database
    await User.findByIdAndDelete(decoded.userId)

    return NextResponse.json({ 
      message: 'Account deleted successfully' 
    })

  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ 
      error: 'Could not delete account' 
    }, { status: 500 })
  }
}