'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Activity } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/forgot', { email });
            toast.success(res.data.message || 'Reset link sent to your email.');
            setEmail('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-background">
            <div className="bg-card p-8 rounded-xl shadow-md w-full max-w-md border border-border">
                <div className="flex flex-col items-center mb-6">
                    <div className="p-3 bg-primary/10 rounded-full mb-3">
                        <Activity className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Forgot Password</h2>
                    <p className="text-muted-foreground text-sm mt-1 text-center">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full p-2.5 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition bg-slate-100 dark:bg-slate-900 text-foreground placeholder:text-muted-foreground"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 font-medium shadow-sm"
                    >
                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                    </button>
                </form>
                
                <div className="mt-6 text-center text-sm">
                    <Link href="/login" className="text-primary hover:underline font-medium">Back to Login</Link>
                </div>
            </div>
        </div>
    );
}
