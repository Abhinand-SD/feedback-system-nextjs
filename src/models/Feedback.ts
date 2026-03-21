import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        enum: ['medical_care', 'facilities', 'staff', 'billing', 'general', 'other'],
        required: [true, 'Please provide a category'],
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: 1,
        max: 5,
    },
    message: {
        type: String,
        required: [true, 'Please provide a message'],
        maxlength: [1000, 'Message cannot be more than 1000 characters'],
    },
    sentiment: {
        type: String,
        enum: ['positive', 'neutral', 'negative'],
        default: 'neutral',
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed'],
        default: 'pending',
    },
    reply: {
        type: String,
    },
}, { timestamps: true });

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
