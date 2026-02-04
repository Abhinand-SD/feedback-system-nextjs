import { z } from 'zod';

export const loginSchema = z.object({
    identifier: z.string().min(1, "Email or Mobile is required"),
    password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal('')),
    mobile: z.string().regex(/^\+91[0-9]{10}$/, "Invalid mobile number format").optional().or(z.literal('')),
    password: z.string().min(8, "Password must be at least 8 characters"),
}).refine(data => data.email || data.mobile, {
    message: "Either Email or Mobile is required",
    path: ["email"],
});

export const verifySchema = z.object({
    email: z.string().email().optional().or(z.literal('')),
    mobile: z.string().regex(/^\+91[0-9]{10}$/).optional().or(z.literal('')),
    otp: z.string().length(6, "OTP must be 6 digits"),
}).refine(data => data.email || data.mobile, {
    message: "Either Email or Mobile is required",
});

export const resendSchema = z.object({
    email: z.string().email().optional().or(z.literal('')),
    mobile: z.string().regex(/^\+91[0-9]{10}$/).optional().or(z.literal('')),
}).refine(data => data.email || data.mobile, {
    message: "Either Email or Mobile is required",
});
