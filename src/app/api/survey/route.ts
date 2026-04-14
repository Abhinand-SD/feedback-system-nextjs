import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Question from '@/models/Question';
import FeedbackSubmission from '@/models/FeedbackSubmission';
import { authenticate } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        
        // Ensure Question model is bundled when populating
        void Question.length; 
        
        const categories = await Category.find().populate('questions').lean();
        
        return NextResponse.json({ categories }, { status: 200 });
    } catch (error) {
        console.error('Fetch survey error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
