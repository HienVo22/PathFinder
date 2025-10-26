import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import User from '../../../../models/User';
import connectDB from '../../../../lib/mongodb';
import { ResumeProcessingService } from '../../../../services/pdfParser';

// Configure upload directory
const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');

// Ensure upload directory exists with proper permissions
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
  } else {
    // Update permissions if directory exists
    fs.chmodSync(uploadDir, 0o755);
  }
} catch (error) {
  console.error('Error setting up upload directory:', error);
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    return null;
  }
}


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

    // Connect to database
    await connectDB();

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('resume');
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' 
      }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum size is 10MB.' 
      }, { status: 400 });
    }

    // Generate unique filename
    const uniqueId = uuidv4();
    const extension = path.extname(file.name);
    const filename = `${uniqueId}${extension}`;
    const filePath = path.join(uploadDir, filename);

  // Save file to disk with proper error handling
  let buffer;
  try {
    const bytes = await file.arrayBuffer();
    buffer = Buffer.from(bytes);
    
    // Write file with proper permissions
    await fs.promises.writeFile(filePath, buffer, { mode: 0o644 });
    
    // Double-check file was written
    if (!fs.existsSync(filePath)) {
      throw new Error('File was not written successfully');
    }
  } catch (writeError) {
    console.error('Error writing file:', writeError);
    throw new Error('Failed to save file to disk');
  }

    // Update user record with resume path and DB-stored copy
    const user = await User.findById(decoded.userId);
    if (!user) {
      // Clean up uploaded file if user not found
      fs.unlinkSync(filePath);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove old resume file if it exists
    if (user.resumePath && fs.existsSync(user.resumePath)) {
      try {
        fs.unlinkSync(user.resumePath);
      } catch (error) {
        console.log('Could not delete old resume file:', error);
      }
    }

  // Update user with new resume path (disk)
  user.resumePath = filePath;
  user.resumeOriginalName = file.name;
  user.resumeUploadedAt = new Date();

  // Also save a DB-stored copy (filename, content-type, binary data)
  user.resumeFilename = filename;
  user.resumeContentType = file.type;
  user.resumeData = buffer;

  // If the file is a PDF, extract text and then extract skills
  let parsedResumeText = null;
  if (file.type === 'application/pdf') {
    try {
      parsedResumeText = await parsePdfBuffer(buffer);
      
      if (parsedResumeText && parsedResumeText.length > 0) {
        console.log('✓ PDF parsed successfully, text length:', parsedResumeText.length);

        // Now, call the AI skills API
        const absoluteUrl = new URL('/api/ai/skills', request.url);
        const aiResponse = await fetch(absoluteUrl.href, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text: parsedResumeText })
        });

        if (aiResponse.ok) {
            const { skills } = await aiResponse.json();
            console.log('✓ Skills extracted:', skills);
            // Save the new skills to the user, replacing old ones
            user.skills = Array.from(new Set(skills));
        } else {
            console.error('Failed to extract skills from AI API');
        }

      } else {
        console.warn('PDF parsed but no text extracted');
      }
    } catch (err) {
      console.error('PDF parsing or AI skill extraction error:', err.message);
    }
  }
    
    console.log('Updating user with resume info:', {
      userId: decoded.userId,
      resumePath: filePath,
      resumeOriginalName: file.name,
      resumeUploadedAt: new Date()
    });
    
    const savedUser = await user.save();
    console.log('User saved successfully:', {
      id: savedUser._id,
      resumePath: savedUser.resumePath,
      resumeOriginalName: savedUser.resumeOriginalName,
      resumeUploadedAt: savedUser.resumeUploadedAt
    });

    // Trigger AI processing in the background (don't wait for it)
    ResumeProcessingService.processResumeWithAI(decoded.userId, filePath, file.type)
      .catch(error => {
        console.error('Background AI processing error:', error);
      });

    return NextResponse.json({
      message: 'Resume uploaded successfully',
      filePath: `/uploads/resumes/${filename}`,
      originalName: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      aiProcessing: {
        status: 'started',
        message: 'AI parsing will complete in the background'
      },
      debug: {
        userId: decoded.userId,
        savedToMongoDB: true,
        resumePath: savedUser.resumePath,
        resumeFilename: savedUser.resumeFilename,
        // parsed text is returned only in the upload response for immediate use; not persisted to the DB
        parsedText: parsedResumeText
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed. Please try again.' 
    }, { status: 500 });
  }
}

// Handle file serving (GET request)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 });
    }

    // Prefer serving from DB if available
    await connectDB();
    const userWithFile = await User.findOne({ resumeFilename: filename, resumeData: { $ne: null } });
    if (userWithFile && userWithFile.resumeData) {
      const fileBuffer = Buffer.from(userWithFile.resumeData);
      const contentType = userWithFile.resumeContentType || 'application/octet-stream';
      return new Response(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${userWithFile.resumeOriginalName || filename}"`,
        },
      });
    }

    // Fallback to disk
    const filePath = path.join(uploadDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const extension = path.extname(filename).toLowerCase();
    
    let contentType = 'application/octet-stream';
    if (extension === '.pdf') {
      contentType = 'application/pdf';
    } else if (extension === '.doc') {
      contentType = 'application/msword';
    } else if (extension === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('File serve error:', error);
    return NextResponse.json({ error: 'Could not serve file' }, { status: 500 });
  }
}

