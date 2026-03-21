'use client';

import { formatDistanceToNow } from 'date-fns';
import { BadgeCheck, Clock, Trash2 } from 'lucide-react';

interface FeedbackProps {
    _id: string;
    category: string;
    rating: number;
    message: string;
    sentiment?: string;
    topics?: string[];
    priority?: string;
    status: string;
    createdAt: string;
    reply?: string;
    userId?: { name: string; email: string };
}

interface FeedbackCardProps {
    feedback: FeedbackProps;
    onDelete?: (id: string) => void;
    onEdit?: (feedback: FeedbackProps) => void;
    onReply?: (id: string) => void;
    showUser?: boolean; // For admin view to show who posted
}

export default function FeedbackCard({ feedback, onDelete, onEdit, onReply, showUser }: FeedbackCardProps) {
    const isPending = feedback.status === 'pending';

    return (
        <div className={`bg-card p-5 rounded-xl border shadow-sm hover:shadow-md transition ${feedback.priority === 'high' ? 'border-red-500/50 shadow-red-500/10' : 'border-border'}`}>
            {feedback.priority === 'high' && (
                <div className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg mb-4 flex items-center gap-1.5 border border-red-100 uppercase tracking-wider">
                    ⚠️ High Priority Feedback
                </div>
            )}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${feedback.category === 'bug' ? 'bg-red-50 text-red-600 border border-red-100' :
                        feedback.category === 'feature' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                            'bg-sky-50 text-sky-600 border border-sky-100'
                        }`}>
                        {feedback.category.replace('_', ' ')}
                    </span>
                    {feedback.sentiment && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
                            feedback.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            feedback.sentiment === 'negative' ? 'bg-red-50 text-red-600 border border-red-100' :
                            'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}>
                            {feedback.sentiment === 'positive' ? '🙂 Positive' : feedback.sentiment === 'negative' ? '🙁 Negative' : '😐 Neutral'}
                        </span>
                    )}
                    <span className="flex items-center text-yellow-500 text-sm font-bold">
                        {'★'.repeat(feedback.rating)}
                        <span className="text-slate-200 dark:text-slate-600">{'★'.repeat(5 - feedback.rating)}</span>
                    </span>
                    {feedback.topics && feedback.topics.length > 0 && feedback.topics.map(topic => (
                        <span key={topic} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-600 border border-violet-100 uppercase tracking-wider">
                            {topic.replace('_', ' ')}
                        </span>
                    ))}
                </div>

                {isPending ? (
                    <div className="flex items-center gap-1.5 text-amber-600 text-xs bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 font-medium">
                        <Clock size={14} /> Pending Review
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 font-medium">
                        <BadgeCheck size={14} /> Reviewed
                    </div>
                )}
            </div>

            <p className="text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-wrap text-sm leading-relaxed">{feedback.message}</p>

            {/* Admin specific: Show User info */}
            {showUser && feedback.userId && (
                <p className="text-xs text-muted-foreground mb-3 px-1 inline-block">
                    Patient/User: <span className="font-medium text-foreground">{feedback.userId.name}</span> ({feedback.userId.email})
                </p>
            )}

            {/* Admin Reply Display */}
            {feedback.reply && (
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border-l-4 border-primary mb-4">
                    <p className="text-xs text-primary font-bold uppercase mb-1 flex items-center gap-1">
                        <BadgeCheck size={12} /> Response from Establishment
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{feedback.reply}</p>
                </div>
            )}

            <div className="flex justify-between items-center mt-auto pt-3 border-t border-border">
                <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                </span>

                <div className="flex gap-2">
                    {onReply && (
                        <button
                            onClick={() => onReply(feedback._id)}
                            className="text-primary hover:text-sky-400 text-sm font-semibold hover:underline"
                        >
                            Reply
                        </button>
                    )}

                    {onEdit && isPending && (
                        <button
                            onClick={() => onEdit(feedback)}
                            className="text-slate-500 hover:text-primary transition p-1 text-sm font-medium"
                            title="Edit Feedback"
                        >
                            Edit
                        </button>
                    )}

                    {onDelete && (
                        <button
                            onClick={() => onDelete(feedback._id)}
                            className="text-red-400 hover:text-red-500 transition p-1 rounded hover:bg-red-500/10"
                            title="Delete Feedback"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

