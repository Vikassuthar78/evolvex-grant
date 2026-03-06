'use client';

import { motion } from 'framer-motion';
import { Clock, MapPin, DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ScoreBadge from './ScoreBadge';
import { Grant } from '@/types';

interface GrantCardProps {
    grant: Grant;
    index: number;
}

function getDaysUntilDeadline(deadline: string) {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatAmount(amount: number) {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
}

export default function GrantCard({ grant, index }: GrantCardProps) {
    const daysLeft = getDaysUntilDeadline(grant.deadline);
    const isUrgent = daysLeft <= 14;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
        >
            <Link href={`/grant/${grant.id}`}>
                <div className="glass-card glass-card-hover p-5 flex flex-col gap-4 cursor-pointer h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <span className="text-xs font-medium text-accent-purple bg-accent-purple/10 px-2 py-0.5 rounded-full">
                                {grant.category}
                            </span>
                            <h3 className="text-base font-semibold text-text-primary mt-2 leading-snug line-clamp-2">
                                {grant.title}
                            </h3>
                        </div>
                        <ScoreBadge score={grant.fitScore} label="Fit" />
                    </div>

                    {/* Funder */}
                    <p className="text-sm text-text-secondary">{grant.funder}</p>

                    {/* Description */}
                    <p className="text-xs text-text-muted line-clamp-2">{grant.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                        {grant.keywords.slice(0, 3).map((kw) => (
                            <span key={kw} className="text-[11px] px-2 py-0.5 rounded-md bg-surface-hover border border-border text-text-muted">
                                {kw}
                            </span>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                            <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {formatAmount(grant.amount)}
                            </span>
                            <span className={`flex items-center gap-1 ${isUrgent ? 'text-accent-rose' : ''}`}>
                                <Clock className="w-3 h-3" />
                                {daysLeft}d left
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ScoreBadge score={grant.probabilityScore} label="Win" size="sm" />
                            <ArrowRight className="w-4 h-4 text-text-muted" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
