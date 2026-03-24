import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Feedback from '@/models/Feedback';
import Settings from '@/models/Settings';
import { authenticate } from '@/lib/auth';
import { GoogleGenAI } from '@google/genai';

export async function GET(req: Request) {
    try {
        const user = await authenticate();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const settings = await Settings.findOne();

        if (!settings || !settings.feedback_summary) {
            return NextResponse.json({ summary: null, updatedAt: null }, { status: 200 });
        }

        return NextResponse.json({ 
            summary: settings.feedback_summary, 
            updatedAt: settings.summary_updated_at 
        }, { status: 200 });
    } catch (error) {
        console.error('Fetch AI Summary error:', error);
        return NextResponse.json({ message: 'Failed to fetch summary.' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await authenticate();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        // Fetch recent feedbacks to give context to the AI
        const recentFeedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(50);

        if (recentFeedbacks.length === 0) {
            return NextResponse.json({ summary: "No recent feedback available to summarize." }, { status: 200 });
        }

        const feedbackTexts = recentFeedbacks.map(f => `Priority: ${f.priority}, Topics: ${f.topics?.join(',') || 'none'}, Message: "${f.message}"`).join('\n');

        const prompt = `You are an expert healthcare analytics AI. Synthesize the following raw patient feedback records into a sharp, professional, 3-sentence executive summary. 
Your structure must be:
Sentence 1: The overarching sentiment and volume snapshot.
Sentence 2: The most critical negative issues and urgent priorities.
Sentence 3: The key positive highlights or neutral observations.

Feedback Data:
${feedbackTexts}`;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const summary = response.text || "Summary could not be generated.";

        // Save to Database
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({ feedback_summary: summary, summary_updated_at: new Date() });
            await settings.save();
        } else {
            settings.feedback_summary = summary;
            settings.summary_updated_at = new Date();
            await settings.save();
        }

        return NextResponse.json({ summary, updatedAt: settings.summary_updated_at }, { status: 200 });
    } catch (error) {
        console.error('AI Summary generation error:', error);
        return NextResponse.json({ message: 'Failed to generate AI summary. Check if GEMINI_API_KEY is properly configured.' }, { status: 500 });
    }
}
