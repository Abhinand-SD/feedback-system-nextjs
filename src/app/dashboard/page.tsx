'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import FeedbackCard from '@/components/FeedbackCard';
import Shimmer from '@/components/Shimmer';
import { Send, Activity, ClipboardList, Mic, MicOff, MessageSquare } from 'lucide-react';

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

interface Question {
    _id: string;
    text: string;
}

interface Category {
    _id: string;
    name: string;
    slug: string;
    questions: Question[];
}

export default function Dashboard() {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ category: 'general', rating: 5, message: '' });

    // Dynamic Category Survey state
    const [categories, setCategories] = useState<Category[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    // Speech Recognition states for single text area fallback
    const [isRecording, setIsRecording] = useState(false);
    const [interimResult, setInterimResult] = useState('');
    const recognitionRef = useRef<any>(null);

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

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get('/api/survey');
            if (data.categories) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Failed to load survey questions', error);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
        fetchCategories();
    }, []);

    // Reset answers when category changes
    useEffect(() => {
        setAnswers({});
        setForm(prev => ({ ...prev, message: '' }));
    }, [form.category]);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onresult = (event: any) => {
                    let finalTranscript = '';
                    let currentInterim = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + ' ';
                        } else {
                            currentInterim += transcript;
                        }
                    }

                    if (finalTranscript) {
                        setForm((prev) => ({ ...prev, message: (prev.message ? prev.message + ' ' : '') + finalTranscript.trim() }));
                    }
                    setInterimResult(currentInterim);
                };

                recognition.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    if (event.error === 'not-allowed') {
                        toast.error('Microphone permission denied');
                    } else if (event.error === 'network') {
                        toast.error('Network error. Some browsers block speech recognition.');
                    } else if (event.error !== 'aborted') {
                        toast.error('Voice recognition failed: ' + event.error);
                    }
                    setIsRecording(false);
                };

                recognition.onend = () => {
                    setIsRecording(false);
                    setInterimResult('');
                };

                recognitionRef.current = recognition;
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            toast.error('Voice recognition is not supported in your browser.');
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
            setInterimResult('');
        } else {
            try {
                recognitionRef.current.start();
                setIsRecording(true);
            } catch (error) {
                console.error('Error starting recognition:', error);
            }
        }
    };

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const currentCat = categories.find(c => c.slug === form.category);
        let finalMessage = form.message;

        // If we have distinct category questions mapped
        if (currentCat && currentCat.questions?.length > 0) {
            // Validate all are answered
            const allAnswered = currentCat.questions.every(q => answers[q._id]?.trim().length > 0);
            if (!allAnswered) {
                toast.error('Please answer all questions before submitting.');
                return;
            }

            // Build compiled message
            const compiledBlocks = currentCat.questions.map(q => `**Q:** ${q.text}\n**A:** ${answers[q._id]}`);
            finalMessage = compiledBlocks.join('\n\n');
        } else if (!finalMessage.trim()) {
            toast.error('Please provide a message before submitting.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                category: form.category,
                rating: form.rating,
                message: finalMessage
            };

            const { data } = await axios.post('/api/feedback', payload);
            toast.success('Feedback submitted!');
            setFeedbacks([data.feedback, ...feedbacks]);
            setForm({ category: 'general', rating: 5, message: '' });
            setAnswers({});
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (feedback: any) => {
        // If the message contains our serialized Q&A block, it might be tough to edit simply, but prompt allows viewing/editing.
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

    const currentCatMapping = categories.find(c => c.slug === form.category);

    return (
        <div className="container mx-auto py-10 px-4 bg-background min-h-screen">
            <header className="mb-10 text-center">
                <h1 className="font-bold mb-2 text-primary flex justify-center items-center gap-3">
                    <Activity className="h-10 w-10" /> ASD Hospital Feedback Portal
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-medium tracking-wide uppercase text-sm">Patient Experience Management</p>
                <div className="mt-4 inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                    Welcome, {user?.name}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Submission Form */}
                <div className="md:col-span-1">
                    <div className="bg-card p-5 pt-4 rounded-xl shadow-sm border border-border sticky top-24">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground border-b border-border pb-3">
                            <ClipboardList size={20} className="text-primary" /> New Feedback
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Feedback Category</label>
                                    <select
                                        className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm transition-colors"
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    >
                                        <option value="medical_care">Medical Care</option>
                                        <option value="facilities">Facilities & Hygiene</option>
                                        <option value="staff">Staff Behavior</option>
                                        <option value="billing">Billing & Insurance</option>
                                        <option value="general">General Suggestion</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Satisfaction Rating</label>
                                    <div className="flex gap-2 justify-between p-2 rounded-lg border border-slate-300 dark:border-slate-700">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setForm({ ...form, rating: star })}
                                                className={`text-2xl transition hover:scale-110 focus:outline-none ${star <= form.rating ? 'text-amber-500 drop-shadow-sm' : 'text-slate-300 dark:text-slate-600'
                                                    }`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-border" />

                            <div className="space-y-5">
                                {currentCatMapping && currentCatMapping.questions?.length > 0 ? (
                                    // Render 5 Dynamic text inputs
                                    currentCatMapping.questions.map((q, idx) => (
                                        <div key={q._id}>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 leading-tight">
                                                <span className="text-primary font-bold mr-1">{idx + 1}.</span> {q.text}
                                            </label>
                                            <textarea
                                                required
                                                rows={3}
                                                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 resize-y text-sm bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                                                value={answers[q._id] || ''}
                                                onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                                placeholder="Type your feedback here..."
                                            />
                                        </div>
                                    ))
                                ) : (
                                    // Render Fallback single textarea
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Comments</label>
                                            <button
                                                type="button"
                                                onClick={toggleRecording}
                                                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                                                    isRecording 
                                                    ? 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800 animate-pulse' 
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:dark:bg-slate-700'
                                                }`}
                                            >
                                                {isRecording ? <><MicOff size={14} /> Stop Recording</> : <><Mic size={14} /> Dictate</>}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <textarea
                                                required
                                                rows={6}
                                                className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors ${
                                                    isRecording
                                                    ? 'border-rose-300 dark:border-rose-700 bg-rose-50/30 dark:bg-rose-900/10 text-slate-900 dark:text-slate-100 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                                                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                                                }`}
                                                value={form.message + (interimResult ? (form.message ? ' ' : '') + interimResult : '')}
                                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                                placeholder="Please describe your experience in detail... (You can type or use the Dictate button)"
                                            />
                                            {isRecording && (
                                                <div className="absolute right-3 bottom-3 flex items-center gap-2 pointer-events-none">
                                                    <span className="flex h-2.5 w-2.5 relative">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                                                    </span>
                                                    <span className="text-xs font-semibold text-rose-500 tracking-wide uppercase">Listening</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-sky-700 transition disabled:opacity-50 font-bold shadow-sm flex justify-center items-center gap-2 mt-4"
                            >
                                {submitting ? 'Submitting...' : <>Submit Feedback <Send size={16} /></>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Feedback List */}
                <div className="md:col-span-2">
                    <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                        Recent Submissions
                    </h2>
                    {loading ? (
                        <div className="space-y-4">
                            <Shimmer className="h-32" />
                            <Shimmer className="h-32" />
                            <Shimmer className="h-32" />
                        </div>
                    ) : feedbacks.length === 0 ? (
                        <div className="text-center py-16 bg-card rounded-xl border border-dashed border-slate-300">
                            <ClipboardList className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                            <p className="text-slate-500 font-medium">No feedback records found.</p>
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
