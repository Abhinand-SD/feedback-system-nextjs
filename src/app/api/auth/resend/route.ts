import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendOTP } from '@/lib/sendEmail';
import { sendSMS } from '@/lib/sendSMS';

export async function POST(req: Request) {
    try {
        const { email, mobile } = await req.json();

        if (!email && !mobile) {
            return NextResponse.json({ message: 'Email or Mobile is required' }, { status: 400 });
        }

        await dbConnect();

        const query = email ? { email } : { mobile };
        const user = await User.findOne(query);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (user.isVerified) {
            return NextResponse.json({ message: 'User is already verified' }, { status: 200 }); // Not an error, just info
        }

        // Check if previous OTP is still valid to prevent spam? 
        // For now, let's just regenerate. Or maybe enforce a cooldown?
        // Let's implement a simple 60s cooldown based on updatedUpdatedAt if needed, 
        // but for now, the frontend timer handles the UI cooldown.

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        if (email) {
            await sendOTP(email, otp);
        } else if (mobile) {
            await sendSMS(mobile, otp);
        }

        return NextResponse.json({ message: 'OTP resent successfully' }, { status: 200 });
    } catch (error) {
        console.error('Resend OTP error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
