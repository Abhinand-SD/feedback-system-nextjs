import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import Feedback from '@/models/Feedback';
import { authenticate } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const user = await authenticate();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // We can accept 'Weekly' or 'Monthly' from request, default to Weekly
        let type = 'Weekly';
        try {
            const body = await req.json();
            if (body.type) type = body.type;
        } catch (e) {
            // Ignore JSON parse error if body is empty
        }

        await dbConnect();
        const settings = await Settings.findOne();
        
        // Always send manual report even if automated report is disabled?
        // Let's decide to send it anyway if triggered manually.

        const dateFilter = new Date();
        if (type === 'Weekly') dateFilter.setDate(dateFilter.getDate() - 7);
        else dateFilter.setMonth(dateFilter.getMonth() - 1);

        const recentFeedbacks = await Feedback.find({ createdAt: { $gte: dateFilter } });

        const total = recentFeedbacks.length;
        let highPriorityCount = 0;
        let sentimentsCount = { positive: 0, neutral: 0, negative: 0 };
        let topicCounts: Record<string, number> = {};

        recentFeedbacks.forEach(f => {
            if (f.priority === 'high') highPriorityCount++;
            
            if (f.sentiment === 'positive') sentimentsCount.positive++;
            else if (f.sentiment === 'negative') sentimentsCount.negative++;
            else sentimentsCount.neutral++;
            
            if (Array.isArray(f.topics)) {
                f.topics.forEach((t: string) => {
                    topicCounts[t] = (topicCounts[t] || 0) + 1;
                });
            }
        });

        const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);

        let reportHtml = `
            <h2>${type} Hospital Feedback Report (Manual Trigger)</h2>
            <p>Total Feedback Received: ${total}</p>
            <p style="color: red;"><strong>High Priority Alerts: ${highPriorityCount}</strong></p>
            <h3>Sentiment Overview</h3>
            <ul>
                <li>Positive: ${sentimentsCount.positive}</li>
                <li>Neutral: ${sentimentsCount.neutral}</li>
                <li>Negative: ${sentimentsCount.negative}</li>
            </ul>
            <h3>Department-wise Issues</h3>
            <ul>
                ${sortedTopics.map(([topic, count]) => `<li>${topic.replace('_', ' ').toUpperCase()} – ${count} complaints</li>`).join('')}
            </ul>
        `;

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return NextResponse.json({ message: 'Email credentials not configured on server' }, { status: 500 });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Get admin email or default to user.email
        const adminEmail = user.email || 'abhinandssd90@gmail.com';

        await transporter.sendMail({
            from: `"Hospital Admin" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `${type} Patient Feedback Report – ICU, OPD, General Ward`,
            html: reportHtml,
        });

        return NextResponse.json({ message: `${type} Report sent to ${adminEmail} successfully` });

    } catch (error) {
        console.error('Manual send report error:', error);
        return NextResponse.json({ message: 'Internal server error while sending email' }, { status: 500 });
    }
}
