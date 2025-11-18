import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';

const VALID_STATUSES = ['saved', 'applied'];

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    return null;
  }
}

function normalizeJobPayload(job = {}) {
  const jobId = String(job.jobId || job.id || '').trim();
  if (!jobId) {
    return null;
  }

  const safeString = (value) => (typeof value === 'string' ? value : value?.toString?.() || '');

  return {
    jobId,
    title: safeString(job.title),
    company: safeString(job.company),
    location: safeString(job.location),
    locationType: safeString(job.locationType),
    salary: safeString(job.salary),
    type: safeString(job.type),
    jobLink: safeString(job.jobLink || job.applyLink),
    applyLink: safeString(job.applyLink || job.jobLink),
    companyLogo: safeString(job.companyLogo),
    postedDisplay: safeString(job.postedDisplay),
    matchPercentage: typeof job.matchPercentage === 'number'
      ? job.matchPercentage
      : job.matchAnalysis?.matchPercentage ?? null
  };
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ jobs: user.trackedJobs || [] });
  } catch (error) {
    console.error('GET /api/user/jobs/tracked error:', error);
    return NextResponse.json({ error: 'Failed to load tracked jobs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { job, status } = body || {};

    if (!job || !status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const normalizedJob = normalizeJobPayload(job);
    if (!normalizedJob) {
      return NextResponse.json({ error: 'Missing job identifier' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!Array.isArray(user.trackedJobs)) {
      user.trackedJobs = [];
    }

    const now = new Date();
    const existingIndex = user.trackedJobs.findIndex(entry => entry.jobId === normalizedJob.jobId);

    if (existingIndex >= 0) {
      const existing = user.trackedJobs[existingIndex];
      Object.assign(existing, normalizedJob);
      existing.status = status;
      existing.updatedAt = now;

      if (!existing.savedAt) {
        existing.savedAt = now;
      }

      if (status === 'applied') {
        existing.appliedAt = now;
      }
    } else {
      user.trackedJobs.unshift({
        ...normalizedJob,
        status,
        savedAt: now,
        appliedAt: status === 'applied' ? now : null,
        updatedAt: now
      });
    }

    await user.save();
    return NextResponse.json({ message: 'Tracked jobs updated', jobs: user.trackedJobs });
  } catch (error) {
    console.error('POST /api/user/jobs/tracked error:', error);
    return NextResponse.json({ error: 'Failed to update tracked jobs' }, { status: 500 });
  }
}

