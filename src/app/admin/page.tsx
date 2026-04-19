'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import FeedbackCard from '@/components/FeedbackCard';
import SummaryCard from '@/components/SummaryCard';
import Shimmer from '@/components/Shimmer';
import { Users, MessageSquare, Star, Ban, CheckCircle, Bell, Mail, LayoutDashboard, Menu, Settings as SettingsIcon, LogOut, UserCircle, PanelLeft, PanelLeftClose } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
    // Auth context
    const { user, loading: authLoading, logout } = useAuth();
    
    // Data states
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    
    // UI states
    const [isEmailReportEnabled, setIsEmailReportEnabled] = useState(false);
    const [isSendingReport, setIsSendingReport] = useState(false);
    
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'feedbacks', 'users'
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const router = useRouter();
    const settingsRef = useRef<HTMLDivElement>(null);

    // Close settings dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [settingsRef]);

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'admin') {
                router.push('/dashboard');
            } else {
                fetchData();
            }
        }
    }, [user, authLoading]);

    const fetchData = async (retryCount = 0) => {
        try {
            const [statsRes, usersRes, feedbacksRes, settingsRes] = await Promise.all([
                axios.get('/api/admin/stats'),
                axios.get('/api/admin/users'),
                axios.get('/api/feedback'),
                axios.get('/api/admin/settings'),
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data.users);
            setFeedbacks(feedbacksRes.data.feedbacks);
            setIsEmailReportEnabled(settingsRes.data.isAutomatedReportEnabled);
        } catch (error) {
            if (retryCount < 2) {
                // Retry up to 2 times with a 1.5s delay to allow Vercel lambdas to establish MongoDB connections
                setTimeout(() => fetchData(retryCount + 1), 1500);
            } else {
                toast.error('Failed to load admin data');
            }
        }
    };

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

    const toggleBlockUser = async (userId: string, currentStatus: boolean) => {
        try {
            await axios.patch('/api/admin/users', { userId, blocked: !currentStatus });
            setUsers(users.map(u => u._id === userId ? { ...u, blocked: !currentStatus } : u));
            toast.success(`User ${!currentStatus ? 'blocked' : 'unblocked'}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const deleteFeedback = async (id: string) => {
        if (!confirm('Delete this feedback?')) return;
        try {
            axios.delete(`/api/feedback/${id}`);
            setFeedbacks(feedbacks.filter(f => f._id !== id));
            toast.success('Feedback deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleReply = async (id: string) => {
        const reply = prompt('Enter your reply:');
        if (!reply) return;

        try {
            const { data } = await axios.patch(`/api/feedback/${id}`, { reply, status: 'reviewed' });
            setFeedbacks(feedbacks.map(f => f._id === id ? data.feedback : f));
            toast.success('Reply sent & marked reviewed');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Reply failed');
        }
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'feedbacks', label: 'Feedbacks', icon: MessageSquare },
        { id: 'users', label: 'Users', icon: Users },
    ];

    if (authLoading || !user) return <div className="flex h-screen items-center justify-center bg-background text-foreground"><Shimmer className="w-32 h-32 rounded-full" /></div>;

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 bg-card border-border transform transition-all duration-300 ease-in-out flex flex-col shrink-0 overflow-hidden
                ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
                ${isDesktopSidebarOpen ? 'lg:translate-x-0 lg:w-64 lg:static border-r' : 'lg:translate-x-0 lg:w-0 lg:static lg:border-none lg:opacity-0'} 
            `}>
                <div className="w-64 h-full flex flex-col">
                    <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-border">
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-violet-500 pl-2">
                            AdminPanel
                        </h2>
                        <button 
                            className="p-1.5 rounded-lg hidden lg:flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setIsDesktopSidebarOpen(false)}
                            title="Collapse Sidebar"
                        >
                            <PanelLeftClose size={20} />
                        </button>
                    </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${activeTab === item.id ? 'bg-primary text-primary-foreground font-semibold shadow-md border-primary/20' : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                        >
                            <item.icon size={20} className={activeTab === item.id ? 'text-primary-foreground' : 'text-muted-foreground'} />
                            {item.label}
                        </button>
                    ))}
                </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Navbar */}
                <header className="h-16 shrink-0 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-8 z-30 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Toggle */}
                        <button 
                            className="p-2 -ml-2 rounded-lg lg:hidden hover:bg-muted text-foreground"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <PanelLeft size={24} />
                        </button>
                        {/* Desktop Sidebar Toggle (When Sidebar is Closed) */}
                        {!isDesktopSidebarOpen && (
                            <button 
                                className="p-2 -ml-2 rounded-lg hidden lg:block hover:bg-muted text-muted-foreground hover:text-foreground transition-colors animate-in fade-in"
                                onClick={() => setIsDesktopSidebarOpen(true)}
                                title="Expand Sidebar"
                            >
                                <PanelLeft size={24} />
                            </button>
                        )}
                        <h1 className="text-lg font-bold lg:hidden bg-clip-text text-transparent bg-linear-to-r from-primary to-violet-500">
                            FeedbackSystem
                        </h1>
                        <h1 className="hidden lg:block text-2xl font-bold">
                            {navItems.find(i => i.id === activeTab)?.label}
                        </h1>
                    </div>

                    <div className="relative" ref={settingsRef}>
                        <button 
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className="flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors ring-2 ring-transparent focus:outline-none focus:ring-primary/50"
                        >
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-violet-800 flex items-center justify-center text-lg text-white font-bold border border-primary/20 shadow-sm">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </button>

                        {/* Settings Dropdown Popover */}
                        {isSettingsOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-card rounded-2xl shadow-xl border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="p-4 border-b border-border bg-muted/30">
                                    <p className="font-bold text-foreground truncate">{user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                                <div className="p-2 space-y-1">
                                    <div className="px-3 py-2.5 flex items-center justify-between rounded-lg hover:bg-muted/50 cursor-pointer" onClick={toggleSettings}>
                                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                            <Bell size={16} className="text-muted-foreground" />
                                            Email Reports
                                        </div>
                                        <button
                                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${isEmailReportEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                                        >
                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${isEmailReportEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={sendTestReport}
                                        disabled={isSendingReport}
                                        className="w-full px-3 py-2.5 flex items-center gap-2 rounded-lg hover:bg-muted/50 text-sm font-medium text-foreground disabled:opacity-50 transition-colors"
                                    >
                                        <Mail size={16} className="text-muted-foreground" />
                                        {isSendingReport ? 'Sending...' : 'Send Test Report'}
                                    </button>
                                </div>
                                <div className="p-2 border-t border-border">
                                    <button
                                        onClick={logout}
                                        className="w-full px-3 py-2.5 flex items-center gap-2 rounded-lg hover:bg-red-500/10 text-red-500 text-sm font-medium transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Logout Session
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-muted/20">
                    <div className="max-w-7xl mx-auto pb-10">
                        
                        {/* --- DASHBOARD VIEW --- */}
                        {activeTab === 'dashboard' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold mb-1">Overview</h2>
                                    <p className="text-muted-foreground">Monitor system performance and analytics.</p>
                                </div>
                                {/* Stats Cards */}
                                {stats ? (
                                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                                        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center gap-5 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-5 transform translate-x-2 -translate-y-2 text-foreground">
                                                <Users size={80} />
                                            </div>
                                            <div className="p-4 rounded-xl bg-primary/10 text-primary">
                                                <Users size={28} />
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-sm font-medium mb-1">Total Users</p>
                                                <h3 className="text-3xl font-bold">{stats.totalUsers}</h3>
                                            </div>
                                        </div>
                                        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center gap-5 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 opacity-5 transform translate-x-2 -translate-y-2 text-foreground">
                                                <MessageSquare size={80} />
                                            </div>
                                            <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-500">
                                                <MessageSquare size={28} />
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-sm font-medium mb-1">Total Feedback</p>
                                                <h3 className="text-3xl font-bold">{stats.totalFeedbacks}</h3>
                                            </div>
                                        </div>
                                        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center gap-5 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 opacity-5 transform translate-x-2 -translate-y-2 text-foreground">
                                                <Star size={80} />
                                            </div>
                                            <div className="p-4 rounded-xl bg-amber-500/10 text-amber-500">
                                                <Star size={28} />
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-sm font-medium mb-1">Avg Rating</p>
                                                <h3 className="text-3xl font-bold">{stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}</h3>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                                        <Shimmer className="h-32 rounded-2xl" />
                                        <Shimmer className="h-32 rounded-2xl" />
                                        <Shimmer className="h-32 rounded-2xl" />
                                    </div>
                                )}

                                {/* Charts Area */}
                                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                                    {/* Sentiment Distribution Chart */}
                                    {stats && stats.sentiments && stats.sentiments.length > 0 && (
                                        <div className="bg-card p-6 rounded-3xl shadow-sm border border-border flex flex-col justify-between lg:col-span-1">
                                            <h2 className="text-xl font-bold mb-4">Sentiment Balance</h2>
                                            <div className="h-64 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={stats.sentiments
                                                                .filter((s: any) => ['positive', 'negative', 'neutral'].includes(s._id))
                                                                .map((s: any) => ({ name: s._id === 'positive' ? 'Positive' : s._id === 'negative' ? 'Negative' : 'Neutral', value: s.count }))}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={65}
                                                            outerRadius={85}
                                                            paddingAngle={5}
                                                            stroke="none"
                                                            cornerRadius={8}
                                                        >
                                                            {stats.sentiments
                                                                .filter((s: any) => ['positive', 'negative', 'neutral'].includes(s._id))
                                                                .map((s: any, index: number) => (
                                                                    <Cell key={`cell-${index}`} fill={s._id === 'positive' ? '#10b981' : s._id === 'negative' ? '#ef4444' : '#eab308'} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                                                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Executive Summary */}
                                    <div className="lg:col-span-2 h-full">
                                        <SummaryCard />
                                    </div>
                                </div>

                                {/* Department Topics Chart */}
                                {stats && stats.topicsCount && stats.topicsCount.length > 0 && (
                                    <div className="bg-card p-6 rounded-3xl shadow-sm border border-border">
                                        <h2 className="text-xl font-bold mb-4">Department Issues</h2>
                                        <div className="h-72 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={stats.topicsCount.map((t: any) => ({ name: t._id.replace('_', ' ').toUpperCase(), count: t.count }))} margin={{ top: 10, right: 10, left: -20, bottom: 40}}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'currentColor' }} interval={0} angle={-30} textAnchor="end" height={60} stroke="none" />
                                                    <YAxis allowDecimals={false} tick={{fill: 'currentColor'}} stroke="none" />
                                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                                                    <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]}>
                                                        {stats.topicsCount.map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={'#8b5cf6'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- FEEDBACKS VIEW --- */}
                        {activeTab === 'feedbacks' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold mb-1">Patient Feedback</h2>
                                    <p className="text-muted-foreground">Review and respond to all patient submitted feedback.</p>
                                </div>
                                {feedbacks.length === 0 ? (
                                    <div className="text-center py-10 text-muted-foreground">No feedbacks found.</div>
                                ) : (
                                    feedbacks.map(fb => (
                                        <FeedbackCard
                                            key={fb._id}
                                            feedback={fb}
                                            onDelete={deleteFeedback}
                                            onReply={handleReply}
                                            showUser
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {/* --- USERS VIEW --- */}
                        {activeTab === 'users' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold mb-1">User Management</h2>
                                    <p className="text-muted-foreground">Manage active, blocked, and admin user accounts.</p>
                                </div>
                                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[800px]">
                                        <thead className="bg-muted/40 text-muted-foreground text-sm">
                                            <tr>
                                                <th className="p-4 font-semibold uppercase tracking-wider rounded-tl-2xl">User</th>
                                                <th className="p-4 font-semibold uppercase tracking-wider">Contact</th>
                                                <th className="p-4 font-semibold uppercase tracking-wider">Status</th>
                                                <th className="p-4 font-semibold uppercase tracking-wider">Role</th>
                                                <th className="p-4 font-semibold uppercase tracking-wider text-right rounded-tr-2xl">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {users.map(u => (
                                                <tr key={u._id} className="hover:bg-muted/20 transition-colors">
                                                    <td className="p-4 font-medium flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-violet-800 flex items-center justify-center text-xs text-white font-bold shrink-0">
                                                            {u.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="truncate font-semibold">{u.name}</div>
                                                    </td>
                                                    <td className="p-4 text-muted-foreground text-sm">
                                                        {u.email || u.mobile}
                                                    </td>
                                                    <td className="p-4">
                                                        {u.blocked ? (
                                                            <span className="bg-red-500/10 text-red-500 px-2.5 py-1 rounded-full text-xs font-bold border border-red-500/20 inline-flex">Blocked</span>
                                                        ) : (
                                                            <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-500/20 inline-flex">Active</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 uppercase text-xs font-bold text-muted-foreground">{u.role}</td>
                                                    <td className="p-4 flex justify-end">
                                                        {u.role !== 'admin' && (
                                                            <button
                                                                onClick={() => toggleBlockUser(u._id, u.blocked)}
                                                                className={`p-2 rounded-lg transition-all shadow-xs ${u.blocked ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                                                title={u.blocked ? "Unblock User" : "Block User"}
                                                            >
                                                                {u.blocked ? <Ban size={16} /> : <CheckCircle size={16} />}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {users.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                        No users found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
