'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Activity } from 'lucide-react';

import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
    const [data, setData] = useState({ identifier: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { checkAuth } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const isEmail = data.identifier.includes('@');
            const payload = {
                password: data.password,
                ...(isEmail ? { email: data.identifier } : { mobile: data.identifier })
            };

            const res = await axios.post('/api/auth/login', payload);
            toast.success('Logged in successfully');
            await checkAuth(); // Update context
            if (res.data.user.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (error: any) {
            // If not verified, redirect to verify
            if (error.response?.data?.isVerified === false) {
                toast.error('Account not verified');
                const isEmail = data.identifier.includes('@');
                const queryParam = isEmail
                    ? `email=${encodeURIComponent(data.identifier)}`
                    : `mobile=${encodeURIComponent(data.identifier)}`;
                router.push(`/verify?${queryParam}`);
            } else {
                toast.error(error.response?.data?.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const res = await axios.post('/api/auth/google', {
                credential: credentialResponse.credential
            });
            toast.success('Logged in with Google');
            await checkAuth();
            if (res.data.user.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (error: any) {
            console.error('Google Login Error:', error);
            toast.error(error.response?.data?.message || 'Google Login Failed');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-background">
            <div className="bg-card p-8 rounded-xl shadow-md w-full max-w-md border border-border">
                <div className="flex flex-col items-center mb-6">
                    <div className="p-3 bg-primary/10 rounded-full mb-3">
                        <Activity className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
                    <p className="text-muted-foreground text-sm mt-1">Sign in to the feedback portal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Email or Mobile Number</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2.5 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition bg-slate-100 dark:bg-slate-900 text-foreground placeholder:text-muted-foreground"
                            value={data.identifier}
                            onChange={(e) => setData({ ...data, identifier: e.target.value })}
                            placeholder="name@example.com or +919876543210"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full p-2.5 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition bg-slate-100 dark:bg-slate-900 text-foreground placeholder:text-muted-foreground"
                            value={data.password}
                            onChange={(e) => setData({ ...data, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 font-medium shadow-sm"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
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
                            onError={() => toast.error('Google Login Failed')}
                            theme="filled_blue"
                            shape="pill"
                        />
                    </div>
                </form>
                <div className="mt-6 text-center text-sm">
                    <p className="text-muted-foreground">
                        Don't have an account? <Link href="/signup" className="text-primary hover:underline font-medium">Create Account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
