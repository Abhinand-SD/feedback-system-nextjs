'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import FeedbackCard from '@/components/FeedbackCard';
import { Users, MessageSquare, Star, Ban, CheckCircle, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('feedbacks');
    const router = useRouter();

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'admin') {
                router.push('/dashboard');
            } else {
                fetchData();
            }
        }
    }, [user, authLoading]);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, feedbacksRes] = await Promise.all([
                axios.get('/api/admin/stats'),
                axios.get('/api/admin/users'),
                axios.get('/api/feedback'),
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data.users);
            setFeedbacks(feedbacksRes.data.feedbacks);
        } catch (error) {
            toast.error('Failed to load admin data');
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

    if (authLoading || !user) return <div className="p-10 text-center text-foreground">Loading...</div>;

    return (
        <div className="min-h-screen pt-10 pb-20 font-sans bg-background text-foreground transition-colors duration-300">
            <div className="container mx-auto px-4">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Overview of system performance</p>
                    </div>
                </header>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-card p-6 rounded-2xl shadow-lg border border-border flex items-center gap-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 transform translate-x-2 -translate-y-2 text-foreground">
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
                        <div className="bg-card p-6 rounded-2xl shadow-lg border border-border flex items-center gap-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10 transform translate-x-2 -translate-y-2 text-foreground">
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
                        <div className="bg-card p-6 rounded-2xl shadow-lg border border-border flex items-center gap-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10 transform translate-x-2 -translate-y-2 text-foreground">
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
                )}

                {/* Tabs */}
                <div className="flex gap-6 mb-8 border-b border-border">
                    <button
                        className={`pb-4 px-2 transition-all font-medium text-lg relative ${activeTab === 'feedbacks' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('feedbacks')}
                    >
                        All Feedback
                        {activeTab === 'feedbacks' && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>}
                    </button>
                    <button
                        className={`pb-4 px-2 transition-all font-medium text-lg relative ${activeTab === 'users' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Manage Users
                        {activeTab === 'users' && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>}
                    </button>
                </div>

                {activeTab === 'feedbacks' ? (
                    <div className="space-y-4">
                        {feedbacks.map(fb => (
                            <FeedbackCard
                                key={fb._id}
                                feedback={fb}
                                onDelete={deleteFeedback}
                                onReply={handleReply}
                                showUser
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-card rounded-2xl shadow-xl border border-border overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-5 text-muted-foreground font-semibold text-sm uppercase tracking-wider">Name</th>
                                    <th className="p-5 text-muted-foreground font-semibold text-sm uppercase tracking-wider">Email</th>
                                    <th className="p-5 text-muted-foreground font-semibold text-sm uppercase tracking-wider">Status</th>
                                    <th className="p-5 text-muted-foreground font-semibold text-sm uppercase tracking-wider">Role</th>
                                    <th className="p-5 text-muted-foreground font-semibold text-sm uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.map(u => (
                                    <tr key={u._id} className="hover:bg-muted/20 transition-colors group">
                                        <td className="p-5 font-medium text-card-foreground flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-violet-800 flex items-center justify-center text-xs text-white font-bold">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            {u.name}
                                        </td>
                                        <td className="p-5 text-muted-foreground">{u.email}</td>
                                        <td className="p-5">
                                            {u.blocked ? (
                                                <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20">Blocked</span>
                                            ) : (
                                                <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">Active</span>
                                            )}
                                        </td>
                                        <td className="p-5 uppercase text-xs font-bold text-muted-foreground">{u.role}</td>
                                        <td className="p-5">
                                            {u.role !== 'admin' && (
                                                <button
                                                    onClick={() => toggleBlockUser(u._id, u.blocked)}
                                                    className={`p-2.5 rounded-lg transition-all shadow-sm ${u.blocked ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                                    title={u.blocked ? "Unblock User" : "Block User"}
                                                >
                                                    {u.blocked ? <Ban size={18} /> : <CheckCircle size={18} />}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
