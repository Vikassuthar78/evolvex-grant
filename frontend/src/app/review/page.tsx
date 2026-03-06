'use client';

import AppLayout from '@/components/layout/AppLayout';
import { mockReviewFeedback, mockAuditLog } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import {
    CheckCircle, Edit3, XCircle, Bot, Star,
    Clock, ArrowRight, ThumbsUp, ThumbsDown, MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ReviewPage() {
    const [decisions, setDecisions] = useState<Record<string, string>>({});
    const overallScore = mockReviewFeedback.reduce((a, b) => a + b.score, 0) / mockReviewFeedback.reduce((a, b) => a + b.maxScore, 0) * 10;

    const handleDecision = (id: string, decision: string) => {
        setDecisions(prev => ({ ...prev, [id]: decision }));
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Bot className="w-6 h-6 text-accent-purple" /> Review Center
                        </h1>
                        <p className="text-sm text-text-secondary mt-1">AI Reviewer Simulator & Human Approval</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-green text-background text-sm font-semibold flex items-center gap-2"
                    >
                        Generate Submission Package <ArrowRight className="w-4 h-4" />
                    </motion.button>
                </div>

                {/* Overall Score */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 flex items-center gap-6"
                >
                    <div className="w-20 h-20 rounded-2xl bg-accent-purple/10 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-accent-purple">{overallScore.toFixed(1)}</span>
                        <span className="text-[10px] text-text-muted">/10</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-base font-semibold">AI Reviewer Score</h2>
                        <p className="text-sm text-text-muted mt-1">
                            Based on simulated review criteria matching NSF evaluation standards.
                            {overallScore >= 8 ? ' Strong proposal — recommended for submission.' :
                                overallScore >= 6 ? ' Good proposal — minor revisions recommended.' :
                                    ' Needs improvement before submission.'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-5 h-5 ${i < Math.round(overallScore / 2) ? 'text-accent-amber fill-accent-amber' : 'text-border'}`}
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Feedback Sections */}
                <div className="space-y-4">
                    {mockReviewFeedback.map((review, i) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold">{review.section}</h3>
                                <div className="flex items-center gap-2">
                                    <span className={`text-lg font-bold ${review.score >= 8 ? 'text-accent-green' : review.score >= 6 ? 'text-accent-cyan' : 'text-accent-amber'
                                        }`}>
                                        {review.score}/{review.maxScore}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-text-secondary mb-4">{review.feedback}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-xs font-medium text-accent-green mb-2">Strengths</p>
                                    <div className="space-y-1">
                                        {review.strengths.map((s, si) => (
                                            <div key={si} className="flex items-center gap-1.5 text-xs text-text-secondary">
                                                <ThumbsUp className="w-3 h-3 text-accent-green flex-shrink-0" />
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-accent-amber mb-2">Areas for Improvement</p>
                                    <div className="space-y-1">
                                        {review.weaknesses.map((w, wi) => (
                                            <div key={wi} className="flex items-center gap-1.5 text-xs text-text-secondary">
                                                <ThumbsDown className="w-3 h-3 text-accent-amber flex-shrink-0" />
                                                {w}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Decision Buttons */}
                            <div className="flex items-center gap-2 pt-4 border-t border-border">
                                <button
                                    onClick={() => handleDecision(review.id, 'approve')}
                                    className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${decisions[review.id] === 'approve' ? 'bg-accent-green/10 text-accent-green border border-accent-green/30' : 'bg-surface border border-border text-text-muted hover:text-text-secondary'
                                        }`}
                                >
                                    <CheckCircle className="w-3 h-3" /> Approve
                                </button>
                                <button
                                    onClick={() => handleDecision(review.id, 'edit')}
                                    className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${decisions[review.id] === 'edit' ? 'bg-accent-amber/10 text-accent-amber border border-accent-amber/30' : 'bg-surface border border-border text-text-muted hover:text-text-secondary'
                                        }`}
                                >
                                    <Edit3 className="w-3 h-3" /> Edit
                                </button>
                                <button
                                    onClick={() => handleDecision(review.id, 'reject')}
                                    className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${decisions[review.id] === 'reject' ? 'bg-accent-rose/10 text-accent-rose border border-accent-rose/30' : 'bg-surface border border-border text-text-muted hover:text-text-secondary'
                                        }`}
                                >
                                    <XCircle className="w-3 h-3" /> Reject
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Audit Trail */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="glass-card p-6"
                >
                    <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent-cyan" /> Audit Trail
                    </h2>
                    <div className="space-y-3">
                        {mockAuditLog.map((entry, i) => (
                            <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
                                    <MessageSquare className="w-4 h-4 text-accent-cyan" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-text-primary">{entry.action}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-hover text-text-muted">{entry.agent}</span>
                                    </div>
                                    <p className="text-xs text-text-muted mt-0.5">{entry.outputSummary}</p>
                                </div>
                                <span className="text-[11px] text-text-muted whitespace-nowrap">
                                    {new Date(entry.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}
