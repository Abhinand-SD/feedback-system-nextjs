import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
    isAutomatedReportEnabled: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
