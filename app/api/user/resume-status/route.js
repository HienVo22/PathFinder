import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../../../../models/User';
import connectDB from '../../../../lib/mongodb';
import fs from 'fs';

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Find user and return resume status
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      hasResume: !!(user.resumePath || user.resumeData),
      resumeInfo: {
        resumePath: user.resumePath,
        resumeFilename: user.resumeFilename || null,
        resumeOriginalName: user.resumeOriginalName,
        resumeUploadedAt: user.resumeUploadedAt,
        // Prefer building URL from resumeFilename if present (served by /api/upload/resume)
        resumeUrl: user.resumeFilename ? `/api/upload/resume?file=${user.resumeFilename}` : user.resumeUrl || null
      },
      userInfo: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Resume status check error:', error);
    return NextResponse.json({ 
      error: 'Could not check resume status' 
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has a resume
    if (!user.resumePath) {
      return NextResponse.json({ error: 'No resume to delete' }, { status: 400 });
    }

    // Delete the resume file
    if (fs.existsSync(user.resumePath)) {
      try {
        fs.unlinkSync(user.resumePath);
      } catch (error) {
        console.error('Could not delete resume file:', error);
        return NextResponse.json({ error: 'Failed to delete resume file' }, { status: 500 });
      }
    }

  // Update user record (clear disk and DB-stored fields)
  user.resumePath = null;
  user.resumeOriginalName = null;
  user.resumeUploadedAt = null;
  user.resumeFilename = null;
  user.resumeContentType = null;
  user.resumeData = null;
  await user.save();

    return NextResponse.json({ message: 'Resume deleted successfully' });

  } catch (error) {
    console.error('Resume delete error:', error);
    return NextResponse.json({ 
      error: 'Could not delete resume' 
    }, { status: 500 });
  }
}
