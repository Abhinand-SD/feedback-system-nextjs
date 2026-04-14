import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    questions: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
        validate: {
            validator: function(v: any[]) {
                return v.length <= 5;
            },
            message: 'A category can have a maximum of 5 questions'
        }
    }
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
