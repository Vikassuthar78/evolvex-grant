'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { applicationsService, grantsService } from '@/services';
import { motion } from 'framer-motion';
import {
    Wand2, ArrowRight, Loader2, Search, FileText, Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function ProposalStudioLanding() {
    const [applications, setApplications] = useState<any[]>([]);
    const [grants, setGrants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const orgId = localStorage.getItem('org_id');
            if (!orgId) {
                setIsLoading(false);
                return;
            }
            try {
                const [appRes, grantRes] = await Promise.all([
                    applicationsService.getAll(orgId).catch(() => ({ applications: [] })),
                    grantsService.getAll().catch(() => ({ grants: [] })),
                ]);
                setApplications(appRes?.applications || []);
                setGrants(grantRes?.grants || []);
            } catch {
                // handled
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleStartProposal = async (grantId: string) => {
        const orgId = localStorage.getItem('org_id');
        if (!orgId) return;
        try {
            const res = await applicationsService.create(orgId, grantId);
            if (res?.application_id) {
                window.location.href = `/apply/${res.application_id}`;
            }
        } catch (err) {
            console.error('Failed to create application:', err);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Wand2 className="w-6 h-6 text-accent-purple" /> Proposal Studio
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">AI-powered proposal writing and editing</p>
                </div>

                {isLoading ? (
                    <div className="glass-card p-12 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-accent-cyan animate-spin mb-4" />
                        <h3 className="text-base font-semibold text-text-primary">Loading...</h3>
                    </div>
                ) : (
                    <>
                        {/* Existing applications / drafts */}
                        {applications.length > 0 && (
                            <div className="space-y-3">
                                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Continue Working</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {applications.map((app: any, i: number) => (
                                        <motion.div
                                            key={app.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <Link href={`/apply/${app.id}`}>
                                                <div className="glass-card p-5 hover:border-accent-purple/30 transition-all cursor-pointer">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <FileText className="w-5 h-5 text-accent-purple" />
                                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-accent-purple/10 text-accent-purple">
                                                            {app.status?.replace('_', ' ') || 'draft'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-text-primary line-clamp-2">
                                                        {app.grant_title || 'Grant Application'}
                                                    </p>
                                                    <p className="text-xs text-text-muted mt-1 font-mono">
                                                        {app.grant_id?.substring(0, 16)}...
                                                    </p>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Start new proposal from available grants */}
                        <div className="space-y-3">
                            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                                {applications.length > 0 ? 'Start New Proposal' : 'Select a Grant to Begin'}
                            </h2>
                            {grants.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {grants.map((grant: any, i: number) => (
                                        <motion.div
                                            key={grant.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="glass-card p-5 hover:border-accent-cyan/30 transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <Sparkles className="w-5 h-5 text-accent-cyan" />
                                                {(grant.fit_score || grant.fitScore) > 0 && (
                                                    <span className="text-xs font-medium text-accent-green">
                                                        {grant.fit_score || grant.fitScore}% fit
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium text-text-primary line-clamp-2 mb-1">{grant.title}</p>
                                            <p className="text-xs text-text-muted mb-3">{grant.funder}</p>
                                            <button
                                                onClick={() => handleStartProposal(grant.id)}
                                                className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-accent-cyan to-accent-green text-background text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                                            >
                                                Start AI Proposal <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="glass-card p-12 text-center"
                                >
                                    <Search className="w-10 h-10 text-text-muted mx-auto mb-3" />
                                    <h3 className="text-base font-semibold text-text-primary">No grants available</h3>
                                    <p className="text-sm text-text-muted mt-1 mb-4">Discover grants first to start writing proposals</p>
                                    <Link href="/discover">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-green text-background text-sm font-semibold inline-flex items-center gap-2"
                                        >
                                            Discover Grants <ArrowRight className="w-4 h-4" />
                                        </motion.button>
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
