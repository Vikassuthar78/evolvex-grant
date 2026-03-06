'use client';

import AppLayout from '@/components/layout/AppLayout';
import ScoreBadge from '@/components/ui/ScoreBadge';
import { applicationsService } from '@/services';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    FileText, Clock, ArrowRight, Filter,
    MoreHorizontal, ExternalLink, Download, Send,
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
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [sendingId, setSendingId] = useState<string | null>(null);

    const handleDownloadPackage = async (appId: string) => {
        setDownloadingId(appId);
        try {
            const res = await applicationsService.getPackage(appId);
            if (res?.success) {
                const blob = new Blob([JSON.stringify(res.package, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `submission-package-${appId.substring(0, 8)}.json`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Package download error:', err);
        } finally {
            setDownloadingId(null);
        }
    };

    const handleSendEmail = async (appId: string) => {
        setSendingId(appId);
        try {
            const res = await applicationsService.sendEmail(appId, 'vikassuthar6377@gmail.com');
            if (res?.success) {
                alert('Application PDF sent to vikassuthar6377@gmail.com');
            }
        } catch (err: any) {
            const detail = err?.response?.data?.detail || 'Failed to send email';
            alert(detail);
        } finally {
            setSendingId(null);
        }
    };

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const orgId = localStorage.getItem('org_id');
                if (!orgId) {
                    setApplications([]);
                    setIsLoading(false);
                    return;
                }
                const res = await applicationsService.getAll(orgId);
                if (res?.applications) {
                    setApplications(res.applications);
                } else {
                    setApplications([]);
                }
            } catch (err) {
                console.error("Fetch apps error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchApps();
    }, []);

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
                    {isLoading ? (
                        <div className="p-12 flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 text-accent-cyan animate-spin mb-4" />
                            <h3 className="text-base font-semibold text-text-primary">Loading applications...</h3>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border text-xs font-medium text-text-muted uppercase tracking-wider">
                                <div className="col-span-4">Grant</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-1">Fit</div>
                                <div className="col-span-2">Compliance</div>
                                <div className="col-span-2">Deadline</div>
                                <div className="col-span-1"></div>
                            </div>

                            {/* Rows */}
                            {applications.map((app: any, i: number) => {
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
                                            <p className="text-sm font-medium text-text-primary">Grant Application</p>
                                            <p className="text-xs text-text-muted font-mono">{app.grant_id?.substring(0, 12)}...</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[app.status?.toLowerCase()] || statusColors.draft}`}>
                                                {app.status?.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="col-span-1">
                                            <ScoreBadge score={app.probability_score || app.probabilityScore || 0} label="" size="sm" />
                                        </div>
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${app.compliance_score ?? app.complianceScore ?? 0}%`,
                                                            background: (app.compliance_score ?? app.complianceScore ?? 0) >= 80 ? '#00FFA3' : (app.compliance_score ?? app.complianceScore ?? 0) >= 60 ? '#00D4FF' : '#F59E0B',
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs text-text-muted">{app.compliance_score ?? app.complianceScore ?? 0}%</span>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className={`flex items-center gap-1 text-xs ${daysLeft <= 14 ? 'text-accent-rose' : 'text-text-muted'}`}>
                                                <Clock className="w-3 h-3" />
                                                <span>{daysLeft} days left</span>
                                            </div>
                                        </div>
                                        <div className="col-span-1 flex justify-end gap-1">
                                            <button
                                                onClick={() => handleDownloadPackage(app.id)}
                                                disabled={downloadingId === app.id}
                                                className="p-2 rounded-lg hover:bg-surface transition-all text-text-muted hover:text-accent-cyan disabled:opacity-50"
                                                title="Download Submission Package"
                                            >
                                                {downloadingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleSendEmail(app.id)}
                                                disabled={sendingId === app.id}
                                                className="p-2 rounded-lg hover:bg-surface transition-all text-text-muted hover:text-accent-green disabled:opacity-50"
                                                title="Send PDF to Email"
                                            >
                                                {sendingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            </button>
                                            <Link href={`/apply/${app.id}`}>
                                                <button className="p-2 rounded-lg hover:bg-surface transition-all text-text-muted hover:text-text-primary">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {applications.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-12 flex flex-col items-center justify-center"
                                >
                                    <FileText className="w-10 h-10 text-text-muted mb-3" />
                                    <h3 className="text-base font-semibold text-text-primary">No applications yet</h3>
                                    <p className="text-sm text-text-muted mt-1 mb-4">Discover grants and start your first AI-powered proposal</p>
                                    <Link href="/discover">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-green text-background text-sm font-semibold flex items-center gap-2"
                                        >
                                            Discover Grants <ArrowRight className="w-4 h-4" />
                                        </motion.button>
                                    </Link>
                                </motion.div>
                            )}
                        </>
                    )}
                </motion.div>
            </div>
        </AppLayout>
    );
}
