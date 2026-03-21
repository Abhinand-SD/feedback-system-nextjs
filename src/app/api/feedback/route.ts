import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Feedback from '@/models/Feedback';
import { authenticate } from '@/lib/auth';
import Sentiment from 'sentiment';

export async function POST(req: Request) {
    try {
        const user = await authenticate();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { category, rating, message } = await req.json();

        if (!category || !rating || !message) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        await dbConnect();

        const sentimentAnalyzer = new Sentiment();
        const result = sentimentAnalyzer.analyze(message);
        let sentiment = 'neutral';
        if (result.score > 0) sentiment = 'positive';
        else if (result.score < 0) sentiment = 'negative';

        // Extract topics based on keywords
        const lowerMsg = message.toLowerCase();
        const detectedTopics: string[] = [];
        if (/(doctor|dr\.|physician|surgeon|consultant)/.test(lowerMsg)) detectedTopics.push('doctor_behavior');
        if (/(nurse|nursing|sister|ward boy)/.test(lowerMsg)) detectedTopics.push('nursing_care');
        if (/(wait|delay|time|slow|queue|long)/.test(lowerMsg)) detectedTopics.push('waiting_time');
        if (/(clean|dirty|hygiene|washroom|bathroom|sweep|mop|dust|smell)/.test(lowerMsg)) detectedTopics.push('cleanliness');
        if (/(bill|amount|cost|price|pay|insurance|charge|expensive)/.test(lowerMsg)) detectedTopics.push('billing');
        if (/(room|bed|ac|fan|light|water|food|canteen|parking|lift|elevator|facility|facilities)/.test(lowerMsg)) detectedTopics.push('facilities');
        if (detectedTopics.length === 0) detectedTopics.push('other');

        // Extract priority
        let priority = 'low';
        const urgentKeywords = ['very rude', 'unsafe', 'negligence', 'emergency delay', 'worst', 'terrible', 'pathetic', 'died', 'police', 'legal'];
        const hasUrgent = urgentKeywords.some(keyword => lowerMsg.includes(keyword));
        if (hasUrgent) {
            priority = 'high';
        } else if (sentiment === 'negative') {
            priority = 'medium';
        }

        const newFeedback = new Feedback({
            userId: user.userId,
            category,
            rating,
            message,
            sentiment,
            topics: detectedTopics,
            priority,
        });

        await newFeedback.save();

        return NextResponse.json({ message: 'Feedback submitted successfully', feedback: newFeedback }, { status: 201 });
    } catch (error) {
        console.error('Submit feedback error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const user = await authenticate();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        let feedbacks;
        if (user.role === 'admin') {
            // Admin sees all. Implement filters later if needed via searchParams
            const { searchParams } = new URL(req.url); // Use query params for filter?
            feedbacks = await Feedback.find().populate('userId', 'name email').sort({ createdAt: -1 });
        } else {
            // User sees own
            feedbacks = await Feedback.find({ userId: user.userId }).sort({ createdAt: -1 });
        }

        return NextResponse.json({ feedbacks }, { status: 200 });
    } catch (error) {
        console.error('Get feedback error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
