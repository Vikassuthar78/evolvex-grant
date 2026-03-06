'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Search, Building2, FileText, TrendingUp } from 'lucide-react';
import api from '@/services/api';

interface AppRow {
    id: string;
    org_id: string;
    grant_id: string;
    status: string;
    compliance_score?: number;
    org_name?: string;
    grant_title?: string;
    created_at: string;
}

const statusColors: Record<string, string> = {
    draft: 'bg-surface-hover text-text-muted',
    in_review: 'bg-accent-cyan/10 text-accent-cyan',
    approved: 'bg-accent-green/10 text-accent-green',
    submitted: 'bg-amber-400/10 text-amber-400',
    rejected: 'bg-accent-rose/10 text-accent-rose',
};

export default function AdminApplicationsPage() {
    const [apps, setApps] = useState<AppRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/api/admin/applications');
                if (data.success) setApps(data.applications || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        })();
    }, []);

    const statuses = ['all', ...Array.from(new Set(apps.map(a => a.status).filter(Boolean)))];

    const filtered = apps.filter(a => {
        const q = query.toLowerCase();
        const matchesQuery = !query || a.org_name?.toLowerCase().includes(q) || a.grant_title?.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchesQuery && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Applications Monitor</h1>
                    <p className="text-sm text-text-muted mt-1">Track all grant applications across organizations</p>
                </div>
                <span className="text-sm text-text-muted">{apps.length} total</span>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by org, grant, or ID..."
                        className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 transition-all" />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                    {statuses.map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${statusFilter === s
                                ? 'bg-accent-purple/10 border-accent-purple/30 text-accent-purple'
                                : 'bg-surface border-border text-text-muted hover:text-text-secondary hover:border-border-bright'}`}>
                            {s === 'all' ? 'All' : s.replace(/_/g, ' ').toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="glass-card p-8 animate-pulse"><div className="h-6 w-64 bg-surface-hover rounded" /></div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Organization</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Grant</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Compliance</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((app, i) => (
                                    <motion.tr
                                        key={app.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-accent-cyan flex-shrink-0" />
                                                <span className="text-sm font-medium text-text-primary">{app.org_name || app.org_id?.slice(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-accent-purple flex-shrink-0" />
                                                <span className="text-sm text-text-secondary">{app.grant_title || app.grant_id?.slice(0, 12)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[app.status] || statusColors.draft}`}>
                                                {(app.status || 'draft').replace(/_/g, ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {app.compliance_score != null ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 rounded-full bg-surface-hover overflow-hidden">
                                                        <div className="h-full rounded-full bg-accent-green" style={{ width: `${Math.min(app.compliance_score, 100)}%` }} />
                                                    </div>
                                                    <span className="text-xs text-text-muted">{app.compliance_score}%</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-text-muted">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-text-muted">
                                            {app.created_at ? new Date(app.created_at).toLocaleDateString() : '—'}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filtered.length === 0 && (
                        <div className="p-12 text-center">
                            <ClipboardList className="w-10 h-10 text-text-muted mx-auto mb-3" />
                            <p className="text-sm text-text-muted">No applications found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
