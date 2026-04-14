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
        </div>
    );
}
