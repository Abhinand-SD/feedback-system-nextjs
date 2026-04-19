import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: 'Please provide an email' }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ message: 'Email is not exist' }, { status: 404 });
        }

        // Generate Token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        // Ensure we handle URL port nicely for localhost
        let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
        if (!baseUrl) {
            // Try to extract from request headers host if not set
            const host = req.headers.get('host') || 'localhost:3000';
            const protocol = host.includes('localhost') ? 'http' : 'https';
            baseUrl = `${protocol}://${host}`;
        }

        const resetUrl = `${baseUrl}/reset/${resetToken}`;

        try {
            // Send Email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const message = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Password Reset Request',
                text: `You requested a password reset. Please go to this link to reset your password: \n\n ${resetUrl}`,
                html: `<p>You requested a password reset.</p><p>Click this ${resetUrl} to reset your password.</p>`
            };

            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                await transporter.sendMail(message);
            } else {
                console.log('\n--- MOCK EMAIL ---');
                console.log('To:', user.email);
                console.log('Reset URL:', resetUrl);
                console.log('------------------\n');
            }
        } catch (emailError) {
            console.error('Email sending failed, but logging the token locally:', resetUrl);
            console.log('\n--- MOCK EMAIL (Fallback) ---');
            console.log('To:', user.email);
            console.log('Reset URL:', resetUrl);
            console.log('------------------\n');
        }

        return NextResponse.json({ message: `Reset link sent to ${email}` }, { status: 200 });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ message: 'An error occurred. Please try again later.' }, { status: 500 });
    }
}
