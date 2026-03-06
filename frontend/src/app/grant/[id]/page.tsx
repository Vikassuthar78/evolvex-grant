'use client';

import { use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ScoreBadge from '@/components/ui/ScoreBadge';
import { mockGrants } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Clock, DollarSign, CheckCircle, XCircle,
    Target, Brain, Users, ArrowRight, Sparkles,
} from 'lucide-react';
import Link from 'next/link';

function formatAmount(amount: number) {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
}

export default function GrantDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const grant = mockGrants.find(g => g.id === id) || mockGrants[0];
    const daysLeft = Math.max(0, Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    const aiReasoning = [
        { label: 'Sector Alignment', score: 94, detail: 'Your AI/ML focus strongly aligns with this program\'s priorities' },
        { label: 'Team Eligibility', score: 88, detail: 'Team size and PI qualifications meet all requirements' },
        { label: 'Budget Match', score: 85, detail: 'Your funding need ($250K) is within the grant ceiling' },
        { label: 'Past Performance', score: 72, detail: 'Prior projects demonstrate relevant capability' },
    ];

    const pastWinners = [
        'DeepMind Health (2024) — AI diagnostics platform',
        'CleanAir Labs (2023) — IoT pollution monitoring',
        'BioForge (2024) — Synthetic biology toolkit',
    ];

    return (
        <AppLayout>
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
                        <Link href={`/apply/${grant.id}`} className="flex-1">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-green text-background font-semibold text-sm flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" /> Start AI Proposal
                            </motion.button>
                        </Link>
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
                            {grant.eligibility.map((req, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />
                                    <span className="text-text-secondary">{req}</span>
                                </div>
                            ))}
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
                            {grant.keywords.map(kw => (
                                <span key={kw} className="px-3 py-1 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 text-xs text-accent-cyan font-medium">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Similar Past Winners */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
                        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-accent-amber" /> Similar Past Winners
                        </h2>
                        <div className="space-y-2">
                            {pastWinners.map((winner, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-hover text-sm text-text-secondary">
                                    <CheckCircle className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />
                                    {winner}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
