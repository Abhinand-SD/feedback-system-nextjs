'use client';

import { useState, Suspense, useEffect } from 'react'; // Added Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function VerifyForm() {
    const searchParams = useSearchParams();
    const initialEmail = searchParams.get('email') || '';
    const initialMobile = searchParams.get('mobile') || '';

    const { checkAuth } = useAuth(); // Correctly placed inside component

    const [identifier, setIdentifier] = useState(initialEmail || initialMobile);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const isEmail = !!initialEmail || (identifier.includes('@'));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = isEmail ? { email: identifier, otp } : { mobile: identifier, otp };
            await axios.post('/api/auth/verify', payload);
            toast.success('Verification successful! Logging you in...');
            await checkAuth(); // Update auth state
            router.push('/dashboard'); // Redirect to dashboard
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
                    <p className="text-slate-500 text-sm mt-1">
                        Enter the OTP sent to your {isEmail ? 'email' : 'mobile'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {isEmail ? 'Email Address' : 'Mobile Number'}
                        </label>
                        <input
                            type={isEmail ? 'email' : 'tel'}
                            required
                            className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            readOnly={!!initialEmail || !!initialMobile}
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

                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-sky-700 transition disabled:opacity-50 font-medium shadow-sm"
                        >
                            {loading ? 'Verifying...' : 'Verify Account'}
                        </button>

                        <ResendTimer identifier={identifier} isEmail={isEmail} />
                    </div>
                </form>
            </div>
        </div>
    );
}

function ResendTimer({ identifier, isEmail }: { identifier: string, isEmail: boolean }) {
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const handleResend = async () => {
        try {
            setCanResend(false);
            const payload = isEmail ? { email: identifier } : { mobile: identifier };
            await axios.post('/api/auth/resend', payload);
            toast.success('OTP Resent!');
            setTimeLeft(60);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
            setCanResend(true);
        }
    };

    return (
        <div className="text-center text-sm">
            {canResend ? (
                <button
                    type="button"
                    onClick={handleResend}
                    className="text-primary hover:underline font-medium"
                >
                    Resend OTP
                </button>
            ) : (
                <span className="text-muted-foreground">
                    Resend OTP in <span className="font-mono">{timeLeft}s</span>
                </span>
            )}
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
