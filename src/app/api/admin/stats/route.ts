import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Feedback from '@/models/Feedback';
import { authenticate } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const user = await authenticate();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const totalUsers = await User.countDocuments();
        const totalFeedbacks = await Feedback.countDocuments();

        const ratings = await Feedback.aggregate([
            { $group: { _id: '$rating', count: { $sum: 1 } } }
        ]);

        const averageRating = await Feedback.aggregate([
            { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]);

        return NextResponse.json({
            totalUsers,
            totalFeedbacks,
            ratings,
            averageRating: averageRating.length > 0 ? averageRating[0].avg : 0
        }, { status: 200 });
    } catch (error) {
        console.error('Get stats error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
