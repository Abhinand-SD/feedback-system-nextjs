import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import User from '@/models/User';
import connectDB from '@/lib/db';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
    try {
        const { credential } = await req.json();

        if (!credential) {
            return NextResponse.json({ message: 'No credential provided' }, { status: 400 });
        }

        // Verify the token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return NextResponse.json({ message: 'Invalid token payload' }, { status: 400 });
        }

        const { email, name, sub: googleId } = payload;

        await connectDB();

        // Find or create user
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user
            // Note: Password is required by schema usually, but for OAuth users we might set a dummy one or make it optional.
            // Assuming the schema allows it, or we set a random secure string.
            // We'll generate a random password placeholder since they login via Google.
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

            user = await User.create({
                name: name || 'Google User',
                email,
                password: randomPassword, // You should ensure your Login flow handles users without known passwords properly
                role: 'user', // Default role
                isVerified: true, // Google emails are verified
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set Cookie
        const response = NextResponse.json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error('Google Auth Error:', error);
        return NextResponse.json({ message: 'Authentication failed' }, { status: 500 });
    }
}
