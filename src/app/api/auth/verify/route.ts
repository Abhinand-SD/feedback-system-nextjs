import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const { email, mobile, otp } = await req.json();

        if ((!email && !mobile) || !otp) {
            return NextResponse.json({ message: 'Email/Mobile and OTP are required' }, { status: 400 });
        }

        await dbConnect();

        const query = email ? { email } : { mobile };
        const user = await User.findOne(query);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (user.isVerified) {
            return NextResponse.json({ message: 'User already verified' }, { status: 400 });
        }

        if (user.otp !== otp || user.otpExpires < new Date()) {
            return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
