'use client';

import { formatDistanceToNow } from 'date-fns';
import { BadgeCheck, Clock, Trash2 } from 'lucide-react';

interface FeedbackProps {
    _id: string;
    category: string;
    rating: number;
    message: string;
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
        <div className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${feedback.category === 'bug' ? 'bg-red-100 text-red-600' :
                        feedback.category === 'feature' ? 'bg-purple-100 text-purple-600' :
                            'bg-blue-100 text-blue-600'
                        }`}>
                        {feedback.category}
                    </span>
                    <span className="flex items-center text-yellow-500 text-sm font-bold">
                        {'★'.repeat(feedback.rating)}
                        <span className="text-gray-300">{'★'.repeat(5 - feedback.rating)}</span>
                    </span>
                </div>

                {isPending ? (
                    <div className="flex items-center gap-1 text-yellow-600 text-xs bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                        <Clock size={12} /> Pending
                    </div>
                ) : (
                    <div className="flex items-center gap-1 text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full border border-green-200">
                        <BadgeCheck size={12} /> Reviewed
                    </div>
                )}
            </div>

            <p className="text-gray-800 mb-4 whitespace-pre-wrap">{feedback.message}</p>

            {/* Admin specific: Show User info */}
            {showUser && feedback.userId && (
                <p className="text-sm text-gray-500 mb-2">
                    By: <span className="font-medium">{feedback.userId.name}</span> ({feedback.userId.email})
                </p>
            )}

            {/* Admin Reply Display */}
            {feedback.reply && (
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500 mb-4">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Admin Reply</p>
                    <p className="text-sm text-gray-700">{feedback.reply}</p>
                </div>
            )}

            <div className="flex justify-between items-center mt-auto pt-3 border-t">
                <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                </span>

                <div className="flex gap-2">
                    {onReply && (
                        <button
                            onClick={() => onReply(feedback._id)}
                            className="text-blue-500 hover:text-blue-700 text-sm font-semibold hover:underline"
                        >
                            Reply
                        </button>
                    )}

                    {onEdit && isPending && (
                        <button
                            onClick={() => onEdit(feedback)}
                            className="text-gray-500 hover:text-blue-600 transition p-1"
                            title="Edit Feedback"
                        >
                            Edit
                        </button>
                    )}

                    {onDelete && (
                        <button
                            onClick={() => onDelete(feedback._id)}
                            className="text-red-400 hover:text-red-600 transition p-1 rounded hover:bg-red-50"
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
