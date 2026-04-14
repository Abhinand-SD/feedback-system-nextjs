import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
    categorySlug: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, default: 'text', enum: ['rating', 'text'] },
});

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
