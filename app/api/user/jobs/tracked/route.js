import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';

const VALID_STATUSES = ['saved', 'applied', 'interviewed', 'rejected', 'offered'];

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
  const appliedAtDate = job.appliedAt ? new Date(job.appliedAt) : null;
  const normalizedAppliedAt = appliedAtDate instanceof Date && !isNaN(appliedAtDate.valueOf())
    ? appliedAtDate
    : null;

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
      : job.matchAnalysis?.matchPercentage ?? null,
    appliedAt: normalizedAppliedAt,
    notes: safeString(job.notes),
    source: safeString(job.source) === 'manual' ? 'manual' : 'auto'
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
      existing.source = normalizedJob.source || existing.source || 'auto';
      if (normalizedJob.notes) {
        existing.notes = normalizedJob.notes;
      }

      if (!existing.savedAt) {
        existing.savedAt = now;
      }

      if (status !== 'saved') {
        existing.appliedAt = normalizedJob.appliedAt || existing.appliedAt || now;
      } else if (!normalizedJob.appliedAt) {
        existing.appliedAt = null;
      }
    } else {
      user.trackedJobs.unshift({
        ...normalizedJob,
        status,
        source: normalizedJob.source || 'auto',
        savedAt: now,
        appliedAt: status === 'saved' ? null : (normalizedJob.appliedAt || now),
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

