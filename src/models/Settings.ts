import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
    isAutomatedReportEnabled: {
        type: Boolean,
        default: false,
    },
    feedback_summary: {
        type: String,
        default: null
    },
    summary_updated_at: {
        type: Date,
        default: null
    }
}, { timestamps: true });

if (mongoose.models.Settings) {
    delete mongoose.models.Settings;
}

export default mongoose.model('Settings', SettingsSchema);
