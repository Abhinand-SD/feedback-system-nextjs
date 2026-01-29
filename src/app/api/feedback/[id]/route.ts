import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Feedback from '@/models/Feedback';
import { authenticate } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await authenticate();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params; // await params in Next.js 15+ (though 14 is likely used, 15 requires await)
        // Actually in Next 15 params is a promise. In 14 it's object. create-next-app@latest is 15.
        // I will await it to be safe for 15.

        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return NextResponse.json({ message: 'Feedback not found' }, { status: 404 });
        }

        if (user.role !== 'admin' && feedback.userId.toString() !== user.userId) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await Feedback.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Feedback deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Delete feedback error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await authenticate();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        await dbConnect();

        // Fix for Next.js 15 params being async
        const { id } = await params;

        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return NextResponse.json({ message: 'Feedback not found' }, { status: 404 });
        }

        if (user.role === 'admin') {
            // Admin options
            if (body.reply !== undefined) feedback.reply = body.reply;
            if (body.status !== undefined) feedback.status = body.status;
        } else {
            // User options
            if (feedback.userId.toString() !== user.userId) {
                return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
            }
            // User can only edit if pending
            if (feedback.status !== 'pending') {
                return NextResponse.json({ message: 'Cannot edit processed feedback' }, { status: 400 });
            }

            if (body.category) feedback.category = body.category;
            if (body.rating) feedback.rating = body.rating;
            if (body.message) feedback.message = body.message;
        }

        await feedback.save();

        return NextResponse.json({ message: 'Feedback updated', feedback }, { status: 200 });
    } catch (error) {
        console.error('Update feedback error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
