'use client';

import AppLayout from '@/components/layout/AppLayout';
import ScoreBadge from '@/components/ui/ScoreBadge';
import { mockApplications } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import {
    FileText, Clock, ArrowRight, Filter,
    MoreHorizontal, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
    draft: 'bg-surface-hover text-text-muted',
    in_progress: 'bg-accent-cyan/10 text-accent-cyan',
    submitted: 'bg-accent-green/10 text-accent-green',
    under_review: 'bg-accent-purple/10 text-accent-purple',
    approved: 'bg-accent-green/10 text-accent-green',
    rejected: 'bg-accent-rose/10 text-accent-rose',
};

export default function ApplicationsPage() {
    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <FileText className="w-6 h-6 text-accent-cyan" /> Applications
                        </h1>
                        <p className="text-sm text-text-secondary mt-1">Track all your grant applications</p>
                    </div>
                    <Link href="/discover">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-green text-background text-sm font-semibold flex items-center gap-2"
                        >
                            New Application <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </Link>
                </div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card overflow-hidden"
                >
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border text-xs font-medium text-text-muted uppercase tracking-wider">
                        <div className="col-span-4">Grant</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-1">Fit</div>
                        <div className="col-span-2">Compliance</div>
                        <div className="col-span-2">Deadline</div>
                        <div className="col-span-1"></div>
                    </div>

                    {/* Rows */}
                    {mockApplications.map((app, i) => {
                        const daysLeft = 14;
                        return (
                            <motion.div
                                key={app.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border hover:bg-surface-hover transition-colors items-center"
                            >
                                <div className="col-span-4">
                                    <p className="text-sm font-medium text-text-primary">{app.grantTitle}</p>
                                    <p className="text-xs text-text-muted">{app.funder}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[app.status]}`}>
                                        {app.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="col-span-1">
                                    <ScoreBadge score={app.probabilityScore} label="" size="sm" />
                                </div>
                                <div className="col-span-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${app.complianceScore}%`,
                                                    background: app.complianceScore >= 80 ? '#00FFA3' : app.complianceScore >= 60 ? '#00D4FF' : '#F59E0B',
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-text-muted">{app.complianceScore}%</span>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className={`flex items-center gap-1 text-xs ${daysLeft <= 14 ? 'text-accent-rose' : 'text-text-muted'}`}>
                                        <Clock className="w-3 h-3" />
                                        <span>{daysLeft} days left</span>
                                    </div>
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    <Link href={`/apply/${app.grantId}`}>
                                        <button className="p-2 rounded-lg hover:bg-surface transition-all text-text-muted hover:text-text-primary">
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </AppLayout>
    );
}
