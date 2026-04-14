import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Question from '@/models/Question';

const seedData = [
    {
        name: 'Medical Care',
        slug: 'medical_care',
        questions: [
            "Please describe your experience regarding the attending doctor's attention to your medical concerns.",
            "How was your diagnosis and treatment plan explained to you?",
            "What are your thoughts on the pain management and comfort measures provided?",
            "Did you feel you had adequate opportunity to ask questions? Please explain.",
            "How clear were your post-discharge medical instructions?"
        ]
    },
    {
        name: 'Facilities',
        slug: 'facilities',
        questions: [
            "Please describe the overall cleanliness and hygiene of your patient room.",
            "What was your experience with the maintenance of the hospital restrooms?",
            "Please provide your feedback on the quality, taste, and temperature of the hospital food.",
            "How would you describe the hospital environment regarding noise and restfulness?",
            "Were the hospital corridors and departments easy to navigate?"
        ]
    },
    {
        name: 'Staff',
        slug: 'staff',
        questions: [
            "How would you describe your initial interaction with the front desk and reception staff?",
            "Please comment on how promptly the nurses responded to your call button or requests.",
            "Did the ward and support staff maintain your privacy and dignity? Please explain.",
            "Please provide feedback on the skill and gentleness of the staff during procedures (e.g., IVs, drawing blood).",
            "How would you describe the overall empathy and attitude of your caretaking team?"
        ]
    },
    {
        name: 'Billing',
        slug: 'billing',
        questions: [
            "Please describe how clearly your final hospital charges were explained to you.",
            "Did you experience any delays during the medical discharge and billing process?",
            "How did the billing department assist you with insurance claims or payment options?",
            "Were there any charges on your final invoice that felt unexpected or hidden?",
            "Please provide your overall feedback on the efficiency of the billing department."
        ]
    },
    {
        name: 'General',
        slug: 'general',
        questions: [
            "Please share your overall satisfaction with your experience at ASD Hospital.",
            "How would you describe the initial appointment booking and admission process?",
            "What are your thoughts on the waiting time prior to your consultation or admission?",
            "Why would or wouldn't you recommend ASD Hospital to friends and family?",
            "Do you feel the medical services provided offered good value for the cost? Please explain."
        ]
    },
    {
        name: 'Other',
        slug: 'other',
        questions: [
            "Please provide your feedback on the convenience and accessibility of the hospital parking.",
            "What was your experience with the hospital cafeteria for visitors?",
            "Please comment on the efficiency and stock of the in-house pharmacy.",
            "How accommodating were the hospital's visitor policies for your family or guests?",
            "Did you use the patient Wi-Fi or entertainment systems? If so, how was your experience?"
        ]
    }
];

export async function POST() {
    try {
        await dbConnect();

        // Clear existing data for a fresh seed
        await Category.deleteMany({});
        await Question.deleteMany({});

        for (const catData of seedData) {
            const category = new Category({
                name: catData.name,
                slug: catData.slug,
                questions: []
            });
            await category.save();

            const questionIds = [];
            for (const qText of catData.questions) {
                const question = new Question({
                    categorySlug: catData.slug,
                    text: qText,
                    type: 'text'
                });
                await question.save();
                questionIds.push(question._id);
            }

            category.questions = questionIds;
            await category.save();
        }

        return NextResponse.json({ message: 'Dynamic text survey data seeded successfully' }, { status: 201 });
    } catch (error: any) {
        console.error('Seeding error:', error);
        return NextResponse.json({ message: 'Failed to seed data', error: error.message, stack: error.stack }, { status: 500 });
    }
}
