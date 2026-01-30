'use client';

import { useState, Suspense } from 'react'; // Added Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';

function VerifyForm() {
    const searchParams = useSearchParams();
    const initialEmail = searchParams.get('email') || '';
    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/auth/verify', { email, otp });
            toast.success('Email verified! You can now login.');
            router.push('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[85vh] bg-background">
            <div className="bg-card p-8 rounded-xl shadow-md w-full max-w-md border border-border">
                <div className="flex flex-col items-center mb-6">
                    <div className="p-3 bg-primary/10 rounded-full mb-3">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Verify Identity</h2>
                    <p className="text-slate-500 text-sm mt-1">Enter the OTP sent to your email</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            readOnly={!!initialEmail}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Security Code (OTP)</label>
                        <input
                            type="text"
                            required
                            maxLength={6}
                            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none tracking-[0.5em] text-center text-2xl font-mono text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="......"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-sky-700 transition disabled:opacity-50 font-medium shadow-sm"
                    >
                        {loading ? 'Verifying...' : 'Verify Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function Verify() {
    return (
        <Suspense fallback={<div className="flex justify-center p-10 text-primary">Loading verification...</div>}>
            <VerifyForm />
        </Suspense>
    );
}
