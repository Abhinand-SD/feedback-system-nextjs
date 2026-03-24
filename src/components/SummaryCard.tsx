'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Sparkles, RefreshCw } from 'lucide-react';
import Shimmer from './Shimmer';

export default function SummaryCard() {
    const [summary, setSummary] = useState<string | null>(null);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await axios.get('/api/admin/summary');
                if (res.data.summary) {
                    setSummary(res.data.summary);
                    setUpdatedAt(res.data.updatedAt);
                }
            } catch (error) {
                console.error('Failed to load summary', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSummary();
    }, []);

    const generateAISummary = async () => {
        setIsGenerating(true);
        try {
            const res = await axios.post('/api/admin/summary');
            setSummary(res.data.summary);
            setUpdatedAt(res.data.updatedAt);
            toast.success('AI Summary Generated');
        } catch (error) {
            toast.error('Failed to generate summary. Ensure LLM API key is configured.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-card p-6 rounded-3xl shadow-lg border border-border md:col-span-2 flex flex-col relative overflow-hidden bg-linear-to-br from-card to-primary/5">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="text-primary" size={20} />
                        AI Executive Summary
                    </h2>
                    {updatedAt && (
                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                            Last generated: {new Date(updatedAt).toLocaleDateString()} {new Date(updatedAt).toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <button
                    onClick={generateAISummary}
                    disabled={isGenerating || isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white transition rounded-full font-semibold text-xs border border-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
                    {summary ? 'Regenerate' : 'Generate'}
                </button>
            </div>
            
            <div className="flex-1 bg-white/50 dark:bg-slate-900/50 rounded-2xl p-6 border border-white/20 dark:border-white/5 backdrop-blur-sm shadow-inner flex flex-col justify-center min-h-[120px]">
                {isLoading ? (
                    <div className="w-full space-y-3">
                        <Shimmer className="h-4 w-full" />
                        <Shimmer className="h-4 w-5/6" />
                        <Shimmer className="h-4 w-4/6" />
                    </div>
                ) : isGenerating ? (
                    <div className="flex items-center justify-center gap-3 text-primary animate-pulse w-full h-full">
                        <Sparkles size={24} />
                        <span className="font-semibold text-lg">Analyzing feedback patterns...</span>
                    </div>
                ) : summary ? (
                    <p className="text-foreground leading-relaxed text-sm whitespace-pre-wrap font-medium">{summary}</p>
                ) : (
                    <div className="text-center w-full">
                        <p className="text-muted-foreground italic leading-relaxed text-sm mb-2">No summary available.</p>
                        <p className="text-xs text-slate-400">Click generate to scan the latest feedback trends.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
