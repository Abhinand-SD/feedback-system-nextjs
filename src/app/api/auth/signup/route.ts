import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendOTP } from '@/lib/sendEmail';
import { sendSMS } from '@/lib/sendSMS';
import { checkRateLimit } from '@/lib/rateLimit';
import { signupSchema } from '@/lib/validations';

export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const rateLimit = checkRateLimit(ip, 10, 10 * 60 * 1000); // 10 attempts per 10 mins

        if (!rateLimit.success) {
            return NextResponse.json({
                message: 'Too many signup attempts. Please try again later.'
            }, { status: 429 });
        }

        const body = await req.json();
        const validation = signupSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                message: 'Invalid input',
                errors: validation.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { name, email, mobile, password } = validation.data;

        await dbConnect();

        // Sync indexes to ensure 'sparse' option is applied to email/mobile
        await User.syncIndexes();

        const query = email ? { email } : { mobile };
        const existingUser = await User.findOne(query);

        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        const newUser = new User({
            name,
            email: email || undefined,
            mobile: mobile || undefined,
            password: hashedPassword,
            otp,
            otpExpires,
        });

        await newUser.save();

        if (email) {
            await sendOTP(email, otp);
        } else if (mobile) {
            await sendSMS(mobile, otp);
        }

        const method = email ? 'email' : 'mobile number';
        return NextResponse.json({ message: `User created successfully. Please verify your ${method}.` }, { status: 201 });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
