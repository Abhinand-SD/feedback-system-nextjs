import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import { authenticate } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const user = await authenticate();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ isAutomatedReportEnabled: false });
        }

        return NextResponse.json(settings, { status: 200 });
    } catch (error) {
        console.error('Get settings error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await authenticate();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const { isAutomatedReportEnabled } = await req.json();

        await dbConnect();

        const settings = await Settings.findOneAndUpdate(
            {},
            { isAutomatedReportEnabled },
            { new: true, upsert: true }
        );

        return NextResponse.json(settings, { status: 200 });
    } catch (error) {
        console.error('Update settings error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
