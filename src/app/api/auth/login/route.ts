import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { checkRateLimit } from '@/lib/rateLimit';
import { loginSchema } from '@/lib/validations';

export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const rateLimit = checkRateLimit(ip, 5, 15 * 60 * 1000); // 5 attempts per 15 mins

        if (!rateLimit.success) {
            return NextResponse.json({
                message: 'Too many login attempts. Please try again later.'
            }, { status: 429 });
        }

        const body = await req.json();

        // Map email/mobile to identifier for schema validation
        const payload = {
            identifier: body.email || body.mobile,
            password: body.password
        };

        const validation = loginSchema.safeParse(payload);

        if (!validation.success) {
            return NextResponse.json({
                message: 'Invalid input',
                errors: validation.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { identifier, password } = validation.data;

        await dbConnect();

        // Determine if identifier is email or mobile based on input or regex
        // Since we unified it in schema, let's just query both or strict check?
        // The original code successfully separated them on frontend.
        // Here we can try to find by either.

        const isEmail = identifier.includes('@');
        const query = isEmail ? { email: identifier } : { mobile: identifier };

        const user = await User.findOne(query);

        if (!user) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
        }

        if (user.blocked) {
            return NextResponse.json({ message: 'Account is blocked' }, { status: 403 });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
        }

        if (!user.isVerified) {
            return NextResponse.json({ message: 'Please verify your account first', isVerified: false }, { status: 403 });
        }

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
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
            }
        }, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
