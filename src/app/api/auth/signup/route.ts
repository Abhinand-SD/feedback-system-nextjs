import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendOTP } from '@/lib/sendEmail';
import { sendSMS } from '@/lib/sendSMS';

export async function POST(req: Request) {
    try {
        const { name, email, mobile, password } = await req.json();

        if (!name || (!email && !mobile) || !password) {
            return NextResponse.json({ message: 'Name, password, and either email or mobile are required' }, { status: 400 });
        }

        await dbConnect();

        // Sync indexes to ensure 'sparse' option is applied to email/mobile
        // This fixes the "E11000 duplicate key error" for null/missing fields
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
            email: email || undefined, // Ensure empty string becomes undefined
            mobile: mobile || undefined, // Ensure empty string becomes undefined
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
