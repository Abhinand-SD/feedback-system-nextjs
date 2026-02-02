import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        unique: true,
        sparse: true, // Allows null/undefined values to not conflict
        lowercase: true,
        trim: true,
    },
    mobile: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password cannot be less than 6 characters'],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    blocked: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
