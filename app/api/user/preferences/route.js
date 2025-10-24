import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    return null;
  }
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
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ preferences: user.jobPreferences || {} });
  } catch (error) {
    console.error('GET /api/user/preferences error:', error);
    return NextResponse.json({ error: 'Failed to load preferences' }, { status: 500 });
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
    const { preferences } = body || {};
    await connectDB();
    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Sanitize incoming preferences: only set defined keys
    const clean = {};
    if (preferences) {
      if (Array.isArray(preferences.jobTitles)) clean.jobTitles = preferences.jobTitles;
      if (Array.isArray(preferences.locationTypes)) clean.locationTypes = preferences.locationTypes;
      if (Array.isArray(preferences.locations)) clean.locations = preferences.locations;
      if (Array.isArray(preferences.employmentTypes)) clean.employmentTypes = preferences.employmentTypes;
      if (typeof preferences.desiredPay === 'string') clean.desiredPay = preferences.desiredPay;
      if (typeof preferences.location === 'string') clean.location = preferences.location;
      if (typeof preferences.jobType === 'string') clean.jobType = preferences.jobType;
      if (typeof preferences.remotePreference === 'string') clean.remotePreference = preferences.remotePreference;
      if (preferences.salaryRange && (typeof preferences.salaryRange.min === 'number' || typeof preferences.salaryRange.max === 'number')) {
        clean.salaryRange = { min: preferences.salaryRange.min, max: preferences.salaryRange.max };
      }
      if (typeof preferences.minSalary === 'number') clean.minSalary = preferences.minSalary;
    }

    // Ensure nested object exists
    if (!user.jobPreferences) user.jobPreferences = {};

    // Apply updates field-by-field to avoid casting undefined subdocuments
    const assignIfDefined = (key, val) => {
      if (val !== undefined) user.set(`jobPreferences.${key}`, val);
    };

    assignIfDefined('jobTitles', clean.jobTitles);
    assignIfDefined('locationTypes', clean.locationTypes);
    assignIfDefined('locations', clean.locations);
    assignIfDefined('employmentTypes', clean.employmentTypes);
    assignIfDefined('desiredPay', clean.desiredPay);
    assignIfDefined('location', clean.location);
    assignIfDefined('jobType', clean.jobType);
    assignIfDefined('remotePreference', clean.remotePreference);
    if (clean.salaryRange) assignIfDefined('salaryRange', clean.salaryRange);
    if (clean.minSalary !== undefined) assignIfDefined('minSalary', clean.minSalary);

    await user.save();

    return NextResponse.json({ message: 'Preferences saved', preferences: user.jobPreferences });
  } catch (error) {
    console.error('POST /api/user/preferences error:', error);
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}


