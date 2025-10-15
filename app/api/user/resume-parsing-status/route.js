import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ResumeProcessingService } from '../../../../services/resumeProcessingService.js';

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

    // Get parsing status using service
    const statusData = await ResumeProcessingService.getParsingStatus(decoded.userId);
    return NextResponse.json(statusData);

  } catch (error) {
    console.error('Resume parsing status error:', error);
    
    if (error.message === 'User not found') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to get resume parsing status' 
    }, { status: 500 });
  }
}

// Allow users to manually trigger re-parsing
export async function POST(request) {
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

    // Get current status to find resume info
    const statusData = await ResumeProcessingService.getParsingStatus(decoded.userId);
    
    if (!statusData.hasResume) {
      return NextResponse.json({ 
        error: 'No resume found to reparse' 
      }, { status: 400 });
    }

    // Trigger re-parsing (this will need to be implemented in the service)
    // For now, we'll return a message that it's not implemented
    return NextResponse.json({
      message: 'Manual re-parsing not yet implemented',
      status: 'not_implemented'
    });

  } catch (error) {
    console.error('Manual reparse trigger error:', error);
    return NextResponse.json({ 
      error: 'Failed to trigger re-parsing' 
    }, { status: 500 });
  }
}
