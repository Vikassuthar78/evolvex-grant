'use client';

import AppLayout from '@/components/layout/AppLayout';
import { mockReviewFeedback, mockAuditLog } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import {
    CheckCircle, Edit3, XCircle, Bot, Star,
    Clock, ArrowRight, ThumbsUp, ThumbsDown, MessageSquare,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { reviewService, applicationsService } from '@/services';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ReviewPage() {
    const [decisions, setDecisions] = useState<Record<string, string>>({});
    const [reviewData, setReviewData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [appId, setAppId] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionResult, setTransitionResult] = useState<string | null>(null);

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const orgId = localStorage.getItem('org_id');
                let foundAppId = 'demo-app-1';
                if (orgId) {
                    const apps = await applicationsService.getAll(orgId);
                    if (apps?.applications?.length > 0) {
                        foundAppId = apps.applications[0].id;
                    }
                }
                setAppId(foundAppId);
                const data = await reviewService.simulate(foundAppId);
                setReviewData(data);
            } catch (err) {
                console.error("Failed to fetch review", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReview();
    }, []);

    const overallScore = reviewData?.overall_score ? (reviewData.overall_score / 10) : 0;
    const reviewFeedback = reviewData?.sections || [];

    const handleDecision = (id: string, decision: string) => {
        setDecisions(prev => ({ ...prev, [id]: decision }));
    };

    const handleApproveApplication = async () => {
        if (!appId) return;
        setIsTransitioning(true);
        setTransitionResult(null);
        try {
            // First move DRAFT → IN_REVIEW, then IN_REVIEW → APPROVED
            try {
                await applicationsService.transitionStatus(appId, 'IN_REVIEW');
            } catch { /* may already be in review */ }
            await applicationsService.transitionStatus(appId, 'APPROVED');
            setTransitionResult('approved');
        } catch (err) {
            console.error('Transition error:', err);
            setTransitionResult('error');
        } finally {
            setIsTransitioning(false);
        }
    };

    const handleRejectApplication = async () => {
        if (!appId) return;
        setIsTransitioning(true);
        setTransitionResult(null);
        try {
            // Move back to DRAFT if in review
            await applicationsService.transitionStatus(appId, 'DRAFT');
            setTransitionResult('rejected');
        } catch (err) {
            console.error('Transition error:', err);
            setTransitionResult('error');
        } finally {
            setIsTransitioning(false);
        }
    };

    const allDecided = reviewFeedback.length > 0 && reviewFeedback.every((r: any) => decisions[r.section]);
    const allApproved = allDecided && Object.values(decisions).every(d => d === 'approve');
    const hasRejections = Object.values(decisions).some(d => d === 'reject');

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
                    <Link href="/applications">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-green text-background text-sm font-semibold flex items-center gap-2"
                        >
                            Generate Submission Package <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="glass-card p-12 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-accent-purple animate-spin mb-4" />
                        <h3 className="text-base font-semibold text-text-primary">Grok AI is reviewing your proposal...</h3>
                        <p className="text-sm text-text-muted mt-1">Evaluating against federal grant criteria</p>
                    </div>
                ) : (
                    <>
                        {/* Overall Score */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-accent-purple/10 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-accent-purple">{overallScore.toFixed(1)}</span>
                                <span className="text-[10px] text-text-muted">/10</span>
                            </div>
                            <div className="flex-1 text-center sm:text-left">
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
                            {reviewFeedback.map((review: any, i: number) => (
                                <motion.div
                                    key={review.section || i}
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
                                                {review.score}/{review.max_score}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-text-secondary mb-4">{review.feedback}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-xs font-medium text-accent-green mb-2">Strengths</p>
                                            <div className="space-y-1">
                                                {review.strengths?.map((s: string, si: number) => (
                                                    <div key={si} className="flex items-start gap-1.5 text-xs text-text-secondary">
                                                        <ThumbsUp className="w-3 h-3 mt-0.5 text-accent-green flex-shrink-0" />
                                                        <span>{s}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-accent-amber mb-2">Areas for Improvement</p>
                                            <div className="space-y-1">
                                                {review.weaknesses?.map((w: string, wi: number) => (
                                                    <div key={wi} className="flex items-start gap-1.5 text-xs text-text-secondary">
                                                        <ThumbsDown className="w-3 h-3 mt-0.5 text-accent-amber flex-shrink-0" />
                                                        <span>{w}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Decision Buttons */}
                                    <div className="flex items-center gap-2 pt-4 border-t border-border">
                                        <button
                                            onClick={() => handleDecision(review.section, 'approve')}
                                            className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${decisions[review.section] === 'approve' ? 'bg-accent-green/10 text-accent-green border border-accent-green/30' : 'bg-surface border border-border text-text-muted hover:text-text-secondary'
                                                }`}
                                        >
                                            <CheckCircle className="w-3 h-3" /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleDecision(review.section, 'edit')}
                                            className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${decisions[review.section] === 'edit' ? 'bg-accent-amber/10 text-accent-amber border border-accent-amber/30' : 'bg-surface border border-border text-text-muted hover:text-text-secondary'
                                                }`}
                                        >
                                            <Edit3 className="w-3 h-3" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDecision(review.section, 'reject')}
                                            className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${decisions[review.section] === 'reject' ? 'bg-accent-rose/10 text-accent-rose border border-accent-rose/30' : 'bg-surface border border-border text-text-muted hover:text-text-secondary'
                                                }`}
                                        >
                                            <XCircle className="w-3 h-3" /> Reject
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Human Decision Bar */}
                        {allDecided && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-6 flex items-center justify-between"
                            >
                                <div>
                                    <h3 className="text-base font-semibold">Final Decision</h3>
                                    <p className="text-sm text-text-muted mt-1">
                                        {allApproved ? 'All sections approved — ready to advance.' :
                                         hasRejections ? 'Some sections rejected — send back for revision.' :
                                         'Review complete — submit your decision.'}
                                    </p>
                                    {transitionResult === 'approved' && <p className="text-sm text-accent-green mt-1">Application approved successfully!</p>}
                                    {transitionResult === 'rejected' && <p className="text-sm text-accent-amber mt-1">Application sent back to draft.</p>}
                                    {transitionResult === 'error' && <p className="text-sm text-accent-rose mt-1">Failed to update status.</p>}
                                </div>
                                <div className="flex gap-2">
                                    {hasRejections && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleRejectApplication}
                                            disabled={isTransitioning}
                                            className="px-5 py-2.5 rounded-xl border border-accent-rose/30 text-accent-rose text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isTransitioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                            Send Back to Draft
                                        </motion.button>
                                    )}
                                    {!hasRejections && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleApproveApplication}
                                            disabled={isTransitioning}
                                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-green to-accent-cyan text-background text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isTransitioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                            Approve Application
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </>
                )}

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
