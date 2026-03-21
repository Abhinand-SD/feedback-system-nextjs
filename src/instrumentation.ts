export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const cron = (await import('node-cron')).default;
        const nodemailer = (await import('nodemailer')).default;
        const dbConnect = (await import('./lib/db')).default;
        const Settings = (await import('./models/Settings')).default;
        const Feedback = (await import('./models/Feedback')).default;
        const sendReport = async (type: 'Weekly' | 'Monthly') => {
            try {
                await dbConnect();
                const settings = await Settings.findOne();
                if (!settings || !settings.isAutomatedReportEnabled) return;

                // Simple date filtering can be added here, for now we aggregate all or recent
                // Assuming we want to aggregate recent feedbacks
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
                    sentimentsCount[f.sentiment as keyof typeof sentimentsCount]++;
                    f.topics.forEach((t: string) => {
                        topicCounts[t] = (topicCounts[t] || 0) + 1;
                    });
                });

                const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);

                let reportHtml = `
                    <h2>${type} Hospital Feedback Report</h2>
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

                // Configure Nodemailer
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                await transporter.sendMail({
                    from: `"Hospital Admin" <${process.env.EMAIL_USER}>`,
                    to: 'abhinandssd90@gmail.com',
                    subject: `${type} Patient Feedback Report – ICU, OPD, General Ward`,
                    html: reportHtml,
                });

                console.log(`${type} Email Report sent successfully.`);
            } catch (error) {
                console.error(`Failed to send ${type} report:`, error);
            }
        };

        // Scheduled for Sunday at 23:59:59
        cron.schedule('59 59 23 * * 0', () => {
            console.log('Running Weekly Cron Job');
            sendReport('Weekly');
        });

        // Scheduled for 1st of every month at 23:59:59
        cron.schedule('59 59 23 1 * *', () => {
            console.log('Running Monthly Cron Job');
            sendReport('Monthly');
        });
    }
}
