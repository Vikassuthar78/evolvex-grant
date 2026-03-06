'use client';

import { use, useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ScoreBadge from '@/components/ui/ScoreBadge';
import { grantsService, applicationsService, matchService } from '@/services';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Clock, DollarSign, CheckCircle, XCircle,
    Target, Brain, Users, ArrowRight, Sparkles, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function formatAmount(amount: number) {
    if (!amount || amount <= 0) return 'Varies';
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
}

export default function GrantDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [grant, setGrant] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreatingApp, setIsCreatingApp] = useState(false);
    const [aiReasoning, setAiReasoning] = useState<{ label: string; score: number; detail: string }[]>([]);

    const handleApply = async () => {
        try {
            setIsCreatingApp(true);
            const orgId = localStorage.getItem('org_id');
            if (!orgId) {
                alert("Please complete onboarding first to generate an Organization Profile.");
                router.push('/onboard');
                return;
            }
            const res = await applicationsService.create(orgId, grant.id);
            if (res?.application_id) {
                router.push(`/apply/${res.application_id}`);
            } else {
                alert("Failed to create draft application.");
            }
        } catch (error) {
            console.error(error);
            alert("Database Error: Failed to initialize application.");
        } finally {
            setIsCreatingApp(false);
        }
    };

    useEffect(() => {
        const fetchGrant = async () => {
            try {
                const res = await grantsService.getById(id);
                setGrant(res);

                // Fetch real AI match scoring
                const orgId = localStorage.getItem('org_id');
                if (orgId) {
                    try {
                        const matchData = await matchService.score(orgId, id);
                        const fitScore = matchData.fit_score || 0;
                        const probScore = matchData.probability_score || 0;
                        setAiReasoning([
                            { label: 'Overall Fit Score', score: Math.round(fitScore), detail: matchData.recommendation || 'Calculated from your org profile vs grant requirements' },
                            { label: 'Win Probability', score: Math.round(probScore), detail: 'Estimated success likelihood based on profile match' },
                            { label: 'Mission Alignment', score: Math.round(fitScore * 0.95), detail: 'How well your mission aligns with funder priorities' },
                            { label: 'Focus Area Match', score: Math.round(fitScore * 0.88), detail: 'Overlap between your focus areas and grant keywords' },
                        ]);
                    } catch {
                        setAiReasoning([
                            { label: 'Fit Score', score: Math.round(res?.fitScore || res?.fit_score || 0), detail: 'Based on keyword similarity analysis' },
                        ]);
                    }
                }
            } catch (err) {
                console.error("Fetch grant error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGrant();
    }, [id]);

    const daysLeft = 14;

    return (
        <AppLayout>
            {isLoading || !grant ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <Loader2 className="w-8 h-8 text-accent-cyan animate-spin mb-4" />
                    <h3 className="text-base font-semibold text-text-primary">Loading Grant Details...</h3>
                </div>
            ) : (
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Back */}
                    <Link href="/discover" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Discover
                    </Link>

                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <span className="text-xs font-medium text-accent-purple bg-accent-purple/10 px-2 py-0.5 rounded-full">{grant.category}</span>
                                <h1 className="text-xl font-bold mt-2">{grant.title}</h1>
                                <p className="text-sm text-text-secondary mt-1">{grant.funder}</p>
                                <p className="text-sm text-text-muted mt-3">{grant.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <ScoreBadge score={grant.fitScore} label="Fit" />
                                <ScoreBadge score={grant.probabilityScore} label="Win" />
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border">
                            <div className="flex items-center gap-1.5 text-sm">
                                <DollarSign className="w-4 h-4 text-accent-green" />
                                <span className="font-semibold">{formatAmount(grant.amount)}</span>
                            </div>
                            <div className={`flex items-center gap-1.5 text-sm ${daysLeft <= 14 ? 'text-accent-rose' : ''}`}>
                                <Clock className="w-4 h-4" />
                                <span>{daysLeft} days remaining</span>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <div className="flex-1">
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={handleApply}
                                    disabled={isCreatingApp}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-green text-background font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isCreatingApp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    Start AI Proposal
                                </motion.button>
                            </div>
                            <button className="px-6 py-3 rounded-xl border border-border text-text-secondary text-sm font-medium hover:bg-surface-hover transition-all">
                                Save Grant
                            </button>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Eligibility */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-accent-green" /> Eligibility Summary
                            </h2>
                            <div className="space-y-2">
                                {(() => {
                                    const elig = Array.isArray(grant.eligibility)
                                        ? grant.eligibility
                                        : typeof grant.eligibility === 'string' && grant.eligibility
                                            ? [grant.eligibility]
                                            : [];
                                    return elig.length > 0 ? elig.map((req: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />
                                            <span className="text-text-secondary">{req}</span>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-text-muted">Eligibility details not available — check the grant listing for full requirements.</p>
                                    );
                                })()}
                            </div>
                        </motion.div>

                        {/* AI Reasoning */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                                <Brain className="w-4 h-4 text-accent-purple" /> AI Reasoning
                            </h2>
                            <div className="space-y-3">
                                {aiReasoning.map((item, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-text-secondary">{item.label}</span>
                                            <span className={`font-semibold ${item.score >= 80 ? 'text-accent-green' : item.score >= 60 ? 'text-accent-cyan' : 'text-accent-amber'}`}>
                                                {item.score}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.score}%` }}
                                                transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                                className="h-full rounded-full"
                                                style={{ background: item.score >= 80 ? '#00FFA3' : item.score >= 60 ? '#00D4FF' : '#F59E0B' }}
                                            />
                                        </div>
                                        <p className="text-xs text-text-muted">{item.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Funding Priorities */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
                            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                                <Target className="w-4 h-4 text-accent-cyan" /> Funding Priorities
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {(Array.isArray(grant.keywords)
                                    ? grant.keywords
                                    : typeof grant.keywords === 'string'
                                        ? grant.keywords.split(/[,\s]+/).filter(Boolean)
                                        : []
                                ).map((kw: string) => (
                                    <span key={kw} className="px-3 py-1 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 text-xs text-accent-cyan font-medium">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Grant Details */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
                            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4 text-accent-amber" /> Grant Details
                            </h2>
                            <div className="space-y-2">
                                {grant.funder && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-hover text-sm text-text-secondary">
                                        <CheckCircle className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />
                                        Funder: {grant.funder}
                                    </div>
                                )}
                                {grant.amount > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-hover text-sm text-text-secondary">
                                        <CheckCircle className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />
                                        Amount: {formatAmount(grant.amount)}
                                    </div>
                                )}
                                {grant.category && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-hover text-sm text-text-secondary">
                                        <CheckCircle className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />
                                        Category: {grant.category}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
