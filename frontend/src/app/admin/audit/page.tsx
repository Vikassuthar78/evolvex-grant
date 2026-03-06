'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Search, Clock, User, Zap, Filter } from 'lucide-react';
import api from '@/services/api';

interface AuditEntry {
    id: string;
    user_id?: string;
    action: string;
    details?: string;
    agent?: string;
    created_at: string;
}

export default function AdminAuditPage() {
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/api/admin/audit');
                if (data.success) setEntries(data.entries || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        })();
    }, []);

    const filtered = entries.filter(e => {
        const q = query.toLowerCase();
        return !query || e.action?.toLowerCase().includes(q) || e.details?.toLowerCase().includes(q) || e.agent?.toLowerCase().includes(q) || e.user_id?.toLowerCase().includes(q);
    });

    const actionColor = (action: string) => {
        const a = action.toUpperCase();
        if (a.includes('CREATE') || a.includes('GENERATE')) return 'text-accent-green bg-accent-green/10';
        if (a.includes('DELETE') || a.includes('REJECT')) return 'text-accent-rose bg-accent-rose/10';
        if (a.includes('UPDATE') || a.includes('TRANSITION')) return 'text-accent-cyan bg-accent-cyan/10';
        if (a.includes('COMPLIANCE') || a.includes('CHECK')) return 'text-accent-purple bg-accent-purple/10';
        return 'text-text-muted bg-surface-hover';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Audit Logs</h1>
                    <p className="text-sm text-text-muted mt-1">System-wide activity trail</p>
                </div>
                <span className="text-sm text-text-muted">{entries.length} entries</span>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search actions, agents, users..."
                    className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 transition-all" />
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="glass-card p-4 animate-pulse"><div className="h-4 w-64 bg-surface-hover rounded" /></div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <ScrollText className="w-10 h-10 text-text-muted mx-auto mb-3" />
                    <p className="text-sm text-text-muted">No audit entries found</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((entry, i) => (
                        <motion.div
                            key={entry.id || i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="glass-card p-4 hover:border-border-bright transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${actionColor(entry.action)}`}>
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${actionColor(entry.action)}`}>
                                                {entry.action}
                                            </span>
                                            {entry.agent && (
                                                <span className="text-xs text-text-muted">by {entry.agent}</span>
                                            )}
                                        </div>
                                        {entry.details && (
                                            <p className="text-sm text-text-secondary mt-1.5 line-clamp-2">{entry.details}</p>
                                        )}
                                        {entry.user_id && (
                                            <div className="flex items-center gap-1 mt-1.5 text-xs text-text-muted">
                                                <User className="w-3 h-3" /> {entry.user_id.slice(0, 12)}...
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-text-muted flex-shrink-0">
                                    <Clock className="w-3 h-3" />
                                    {entry.created_at ? new Date(entry.created_at).toLocaleString() : '—'}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
