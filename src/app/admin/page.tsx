'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import FeedbackCard from '@/components/FeedbackCard';
import { Users, MessageSquare, Star, Ban, CheckCircle } from 'lucide-react';
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
            await axios.delete(`/api/feedback/${id}`);
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

    if (authLoading || !user) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* Stats Cards */}
            {stats && (
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl shadow border flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Users size={24} /></div>
                        <div>
                            <p className="text-gray-500 text-sm">Total Users</p>
                            <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow border flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-full text-purple-600"><MessageSquare size={24} /></div>
                        <div>
                            <p className="text-gray-500 text-sm">Total Feedback</p>
                            <h3 className="text-2xl font-bold">{stats.totalFeedbacks}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow border flex items-center gap-4">
                        <div className="bg-yellow-100 p-3 rounded-full text-yellow-600"><Star size={24} /></div>
                        <div>
                            <p className="text-gray-500 text-sm">Avg Rating</p>
                            <h3 className="text-2xl font-bold">{stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}</h3>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
                <button
                    className={`pb-2 px-4 ${activeTab === 'feedbacks' ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('feedbacks')}
                >
                    All Feedback
                </button>
                <button
                    className={`pb-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('users')}
                >
                    Manage Users
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
                <div className="bg-white rounded-xl shadow overflow-hidden border">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium">{u.name}</td>
                                    <td className="p-4 text-gray-600">{u.email}</td>
                                    <td className="p-4">
                                        {u.blocked ? (
                                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">Blocked</span>
                                        ) : (
                                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold">Active</span>
                                        )}
                                    </td>
                                    <td className="p-4 uppercase text-xs font-bold text-gray-500">{u.role}</td>
                                    <td className="p-4">
                                        {u.role !== 'admin' && (
                                            <button
                                                onClick={() => toggleBlockUser(u._id, u.blocked)}
                                                className={`p-2 rounded transition ${u.blocked ? 'text-green-600 hover:bg-green-100' : 'text-red-600 hover:bg-red-100'}`}
                                                title={u.blocked ? "Unblock User" : "Block User"}
                                            >
                                                {u.blocked ? <CheckCircle size={18} /> : <Ban size={18} />}
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
    );
}
