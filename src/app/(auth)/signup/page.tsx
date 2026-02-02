'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ClipboardList, Mail, Phone, User as UserIcon, Lock } from 'lucide-react';

import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';

export default function Signup() {
    const [signupMethod, setSignupMethod] = useState<'email' | 'mobile'>('email');
    const [data, setData] = useState({ name: '', email: '', mobile: '', password: '' });
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { checkAuth } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                name: data.name,
                password: data.password,
                ...(signupMethod === 'email' ? { email: data.email } : { mobile: data.mobile }),
            };

            await axios.post('/api/auth/signup', payload);
            toast.success('Signup successful! Check your device for OTP.');

            const queryParam = signupMethod === 'email'
                ? `email=${encodeURIComponent(data.email)}`
                : `mobile=${encodeURIComponent(data.mobile)}`;

            router.push(`/verify?${queryParam}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const res = await axios.post('/api/auth/google', {
                credential: credentialResponse.credential
            });
            toast.success('Account created with Google');
            await checkAuth(); // Update context
            router.push('/dashboard'); // Direct to dashboard as google is verified
        } catch (error: any) {
            console.error('Google Signup Error:', error);
            toast.error(error.response?.data?.message || 'Google Signup Failed');
        }
    };


    return (
        <div className="flex justify-center items-center min-h-screen bg-background">
            <div className="bg-card p-8 rounded-xl shadow-md w-full max-w-md border border-border">
                <div className="flex flex-col items-center mb-6">
                    <div className="p-3 bg-primary/10 rounded-full mb-3">
                        <ClipboardList className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Patient Registration</h2>
                    <p className="text-muted-foreground text-sm mt-1">Create an account to submit feedback</p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg mb-6">
                    <button
                        type="button"
                        onClick={() => setSignupMethod('email')}
                        className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${signupMethod === 'email'
                            ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                    </button>
                    <button
                        type="button"
                        onClick={() => setSignupMethod('mobile')}
                        className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${signupMethod === 'mobile'
                            ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Phone className="w-4 h-4 mr-2" />
                        Mobile
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground">
                                <UserIcon className="w-4 h-4" />
                            </span>
                            <input
                                type="text"
                                required
                                className="w-full pl-9 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition bg-slate-100 dark:bg-slate-900 text-foreground placeholder:text-muted-foreground"
                                value={data.name}
                                onChange={(e) => setData({ ...data, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    {signupMethod === 'email' ? (
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-muted-foreground">
                                    <Mail className="w-4 h-4" />
                                </span>
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-9 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition bg-slate-100 dark:bg-slate-900 text-foreground placeholder:text-muted-foreground"
                                    value={data.email}
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Mobile Number</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                </span>
                                <input
                                    type="tel"
                                    required
                                    pattern="^\+?[0-9]{10,15}$"
                                    className="w-full pl-9 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition bg-slate-100 dark:bg-slate-900 text-foreground placeholder:text-muted-foreground"
                                    value={data.mobile}
                                    onChange={(e) => setData({ ...data, mobile: e.target.value })}
                                    placeholder="+919876543210"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground">
                                <Lock className="w-4 h-4" />
                            </span>
                            <input
                                type="password"
                                required
                                className="w-full pl-9 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition bg-slate-100 dark:bg-slate-900 text-foreground placeholder:text-muted-foreground"
                                value={data.password}
                                onChange={(e) => setData({ ...data, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 font-medium shadow-sm"
                    >
                        {loading ? 'Processing...' : 'Create Account'}
                    </button>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-card text-muted-foreground">or continue with</span>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => toast.error('Google Signup Failed')}
                            theme="filled_blue"
                            shape="pill"
                            text="signup_with"
                        />
                    </div>
                </form>
                <div className="mt-6 text-center text-sm">
                    <p className="text-muted-foreground">
                        Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

