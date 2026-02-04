import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendOTP } from '@/lib/sendEmail';
import { sendSMS } from '@/lib/sendSMS';
import { checkRateLimit } from '@/lib/rateLimit';
import { resendSchema } from '@/lib/validations';

export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const rateLimit = checkRateLimit(ip, 3, 60 * 60 * 1000); // 3 attempts per hour

        if (!rateLimit.success) {
            return NextResponse.json({
                message: 'Too many resend attempts. Please try again later.'
            }, { status: 429 });
        }

        const body = await req.json();
        const validation = resendSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                message: 'Invalid input',
                errors: validation.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { email, mobile } = validation.data;

        await dbConnect();

        const query = email ? { email } : { mobile };
        const user = await User.findOne(query);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Check availability
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
            return NextResponse.json({
                message: 'Account locked. Cannot resend OTP.'
            }, { status: 429 });
        }

        if (user.isVerified) {
            return NextResponse.json({ message: 'User is already verified' }, { status: 200 });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        user.otp = otp;
        user.otpExpires = otpExpires;
        user.otpAttempts = 0; // Reset attempts on new OTP
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
