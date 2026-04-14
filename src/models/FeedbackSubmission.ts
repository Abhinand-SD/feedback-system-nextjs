import mongoose from 'mongoose';

const FeedbackSubmissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    selectedCategory: { type: String, required: true },
    answers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
        textValue: { type: String, required: true },
    }],
    status: { type: String, default: 'pending', enum: ['pending', 'reviewed'] },
}, { timestamps: true });

export default mongoose.models.FeedbackSubmission || mongoose.model('FeedbackSubmission', FeedbackSubmissionSchema);
