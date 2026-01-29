import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authenticate } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const user = await authenticate();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const users = await User.find().select('-password -otp -otpExpires').sort({ createdAt: -1 });

        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const currentUser = await authenticate();
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const { userId, blocked } = await req.json();

        if (!userId || typeof blocked !== 'boolean') {
            return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Prevent blocking self?
        if (userId === currentUser.userId) {
            return NextResponse.json({ message: 'Cannot block yourself' }, { status: 400 });
        }

        user.blocked = blocked;
        await user.save();

        return NextResponse.json({ message: `User ${blocked ? 'blocked' : 'unblocked'} successfully` }, { status: 200 });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
