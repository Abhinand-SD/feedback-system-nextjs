import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Feedback from '@/models/Feedback';
import { authenticate } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const user = await authenticate();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { category, rating, message } = await req.json();

        if (!category || !rating || !message) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        await dbConnect();

        const newFeedback = new Feedback({
            userId: user.userId,
            category,
            rating,
            message,
        });

        await newFeedback.save();

        return NextResponse.json({ message: 'Feedback submitted successfully', feedback: newFeedback }, { status: 201 });
    } catch (error) {
        console.error('Submit feedback error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const user = await authenticate();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        let feedbacks;
        if (user.role === 'admin') {
            // Admin sees all. Implement filters later if needed via searchParams
            const { searchParams } = new URL(req.url); // Use query params for filter?
            feedbacks = await Feedback.find().populate('userId', 'name email').sort({ createdAt: -1 });
        } else {
            // User sees own
            feedbacks = await Feedback.find({ userId: user.userId }).sort({ createdAt: -1 });
        }

        return NextResponse.json({ feedbacks }, { status: 200 });
    } catch (error) {
        console.error('Get feedback error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
