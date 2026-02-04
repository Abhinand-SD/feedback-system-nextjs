import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { checkRateLimit } from '@/lib/rateLimit';
import { verifySchema } from '@/lib/validations';

export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const rateLimit = checkRateLimit(ip, 10, 10 * 60 * 1000); // 10 attempts per 10 mins (IP level spam protection)

        if (!rateLimit.success) {
            return NextResponse.json({
                message: 'Too many requests. Please try again later.'
            }, { status: 429 });
        }

        const body = await req.json();
        const validation = verifySchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                message: 'Invalid input',
                errors: validation.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { email, mobile, otp } = validation.data;

        await dbConnect();

        const query = email ? { email } : { mobile };
        const user = await User.findOne(query);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Check for lockout
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
            return NextResponse.json({
                message: 'Account temporarily locked due to too many failed attempts. Try again in 1 hour.'
            }, { status: 429 });
        }

        if (user.isVerified) {
            return NextResponse.json({ message: 'User already verified' }, { status: 400 });
        }

        // Verify OTP
        if (user.otp !== otp || user.otpExpires < new Date()) {
            // Increment attempts
            user.otpAttempts = (user.otpAttempts || 0) + 1;

            if (user.otpAttempts >= 5) {
                user.lockoutUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour lockout
                user.otpAttempts = 0; // Reset counter so they start fresh after lockout
                await user.save();
                return NextResponse.json({
                    message: 'Too many failed attempts. Account locked for 1 hour.'
                }, { status: 429 });
            }

            await user.save();
            return NextResponse.json({
                message: `Invalid or expired OTP. ${5 - user.otpAttempts} attempts remaining.`
            }, { status: 400 });
        }

        // Success
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.otpAttempts = 0;
        user.lockoutUntil = undefined;
        await user.save();

        // Generate Token for Auto-Login
        const jwt = (await import('jsonwebtoken')).default;
        const { cookies } = await import('next/headers');

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        );

        const cookieStore = await cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400, // 1 day
            path: '/',
        });

        return NextResponse.json({
            message: 'Email verified successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
            }
        }, { status: 200 });
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
