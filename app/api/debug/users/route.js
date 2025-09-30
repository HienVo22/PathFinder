import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function GET() {
    try {
        await connectDB();
        const users = await User.find({}).select('-password');  // Exclude password field
        console.log('Found users:', users);
        return NextResponse.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
