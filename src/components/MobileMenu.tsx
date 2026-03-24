'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Bell, Mail } from 'lucide-react';

export default function MobileMenu({ isMenuOpen, setIsMenuOpen }: { isMenuOpen: boolean, setIsMenuOpen: (val: boolean) => void }) {
    const { user, logout, loading } = useAuth();
    
    // Admin specific states
    const [isEmailReportEnabled, setIsEmailReportEnabled] = useState(false);
    const [isSendingReport, setIsSendingReport] = useState(false);

    useEffect(() => {
        if (user?.role === 'admin' && isMenuOpen) {
            axios.get('/api/admin/settings').then(res => {
                setIsEmailReportEnabled(res.data.isAutomatedReportEnabled);
            }).catch(err => console.error(err));
        }
    }, [user, isMenuOpen]);

    const toggleSettings = async () => {
        try {
            const res = await axios.post('/api/admin/settings', { isAutomatedReportEnabled: !isEmailReportEnabled });
            setIsEmailReportEnabled(res.data.isAutomatedReportEnabled);
            toast.success(`Automated Email Reports turned ${!isEmailReportEnabled ? 'ON' : 'OFF'}`);
        } catch (error) {
            toast.error('Failed to update settings');
        }
    };

    const sendTestReport = async () => {
        setIsSendingReport(true);
        try {
            const res = await axios.post('/api/admin/send-report', { type: 'Weekly' });
            toast.success(res.data.message || 'Test report sent successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send test report');
        } finally {
            setIsSendingReport(false);
        }
    };

    if (!isMenuOpen) return null;

    return (
        <div className="md:hidden absolute top-full left-0 right-0 bg-card border-b border-border p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
            {loading ? null : (
                user ? (
                    <>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                            <span className="font-medium text-foreground">{user.name}</span>
                        </div>

                        {user.role === 'admin' && (
                            <div className="flex flex-col gap-3 py-2 border-y border-border">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin Controls</span>
                                <div className="flex items-center justify-between bg-card px-3 py-2 rounded-xl border border-border shadow-xs">
                                    <div className="flex items-center gap-2">
                                        <Bell size={16} className={isEmailReportEnabled ? 'text-primary' : 'text-slate-400'} />
                                        <span className="font-medium text-sm">Automated Reports</span>
                                    </div>
                                    <button
                                        onClick={toggleSettings}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isEmailReportEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${isEmailReportEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                                <button
                                    onClick={sendTestReport}
                                    disabled={isSendingReport}
                                    className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl border border-primary hover:bg-primary/90 transition shadow-xs disabled:opacity-50"
                                >
                                    <Mail size={16} className={isSendingReport ? 'animate-pulse' : ''} />
                                    <span className="font-medium text-sm">{isSendingReport ? 'Sending...' : 'Send Test Report'}</span>
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                logout();
                                setIsMenuOpen(false);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-center transition w-full font-medium"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="hover:text-primary hover:bg-muted py-2.5 block text-center border border-border rounded-lg text-muted-foreground transition"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Login
                        </Link>
                        <Link
                            href="/signup"
                            className="bg-primary hover:bg-sky-500 text-primary-foreground px-4 py-2.5 rounded-lg transition text-center block font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Sign Up
                        </Link>
                    </>
                )
            )}
        </div>
    );
}
