'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import FeedbackCard from '@/components/FeedbackCard';
import { Send } from 'lucide-react';

interface Feedback {
    _id: string;
    category: string;
    rating: number;
    message: string;
    status: string;
    createdAt: string;
    reply?: string;
    userId?: { name: string; email: string };
}

export default function Dashboard() {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ category: 'feature', rating: 5, message: '' });

    const fetchFeedbacks = async () => {
        try {
            const { data } = await axios.get('/api/feedback');
            setFeedbacks(data.feedbacks);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load feedback');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await axios.post('/api/feedback', form);
            toast.success('Feedback submitted!');
            setFeedbacks([data.feedback, ...feedbacks]);
            setForm({ category: 'feature', rating: 5, message: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (feedback: any) => {
        const newMessage = prompt('Update your feedback message:', feedback.message);
        if (newMessage === null || newMessage === feedback.message) return;

        try {
            const { data } = await axios.patch(`/api/feedback/${feedback._id}`, { message: newMessage });
            setFeedbacks(feedbacks.map(f => f._id === feedback._id ? data.feedback : f));
            toast.success('Feedback updated');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this feedback?')) return;
        try {
            await axios.delete(`/api/feedback/${id}`);
            setFeedbacks(feedbacks.filter((f) => f._id !== id));
            toast.success('Feedback deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}</h1>
            <p className="text-gray-600 mb-8">Manage your feedback and suggestions.</p>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Submission Form */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-md border sticky top-24">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Send size={20} className="text-blue-600" /> Submit Feedback
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    className="w-full mt-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                >
                                    <option value="feature">Feature Request</option>
                                    <option value="bug">Bug Report</option>
                                    <option value="general">General</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Rating</label>
                                <div className="flex gap-2 mt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setForm({ ...form, rating: star })}
                                            className={`text-2xl transition ${star <= form.rating ? 'text-yellow-400 scale-110' : 'text-gray-300'
                                                }`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full mt-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    placeholder="Tell us what you think..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Feedback List */}
                <div className="md:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Your Recent Feedback</h2>
                    {loading ? (
                        <div className="text-center py-10">Loading...</div>
                    ) : feedbacks.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-xl border border-dashed">
                            <p className="text-gray-500">No feedback submitted yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {feedbacks.map((item) => (
                                <FeedbackCard
                                    key={item._id}
                                    feedback={item}
                                    onDelete={item.status === 'pending' ? handleDelete : undefined}
                                    onEdit={item.status === 'pending' ? handleEdit : undefined}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
