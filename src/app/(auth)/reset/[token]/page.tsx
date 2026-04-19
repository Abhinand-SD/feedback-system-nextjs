'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Activity } from 'lucide-react';
import React from 'react';

export default function ResetPassword({ params }: { params: Promise<{ token: string }> }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const resolvedParams = React.use(params);
    const token = resolvedParams.token;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('/api/auth/reset', { token, password });
            toast.success(res.data.message || 'Password successfully reset.');
            router.push('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
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
                    <h2 className="text-2xl font-bold text-foreground">Set New Password</h2>
                    <p className="text-muted-foreground text-sm mt-1 text-center">
                        Please enter your new password below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            className="w-full p-2.5 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition bg-slate-100 dark:bg-slate-900 text-foreground placeholder:text-muted-foreground"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            className="w-full p-2.5 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition bg-slate-100 dark:bg-slate-900 text-foreground placeholder:text-muted-foreground"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 font-medium shadow-sm"
                    >
                        {loading ? 'Updating Password...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
