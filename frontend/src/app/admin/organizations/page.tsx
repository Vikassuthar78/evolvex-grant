'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, Users, MapPin, Briefcase, ChevronRight } from 'lucide-react';
import api from '@/services/api';

interface OrgRow {
    id: string;
    name: string;
    mission?: string;
    focus_areas?: string[];
    location?: string;
    team_size?: number;
    budget?: number;
    application_count: number;
    created_at?: string;
}

export default function AdminOrganizationsPage() {
    const [orgs, setOrgs] = useState<OrgRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<OrgRow | null>(null);
    const [orgApps, setOrgApps] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/api/admin/organizations');
                if (data.success) setOrgs(data.organizations || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        })();
    }, []);

    const filtered = orgs.filter(o =>
        !query || o.name?.toLowerCase().includes(query.toLowerCase()) || o.location?.toLowerCase().includes(query.toLowerCase())
    );

    const openDetail = async (org: OrgRow) => {
        setSelected(org);
        try {
            const { data } = await api.get(`/api/admin/organizations/${org.id}`);
            if (data.success) setOrgApps(data.applications || []);
        } catch { setOrgApps([]); }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Organizations</h1>
                    <p className="text-sm text-text-muted mt-1">All registered organizations</p>
                </div>
                <span className="text-sm text-text-muted">{orgs.length} total</span>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search organizations..."
                    className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 transition-all"
                />
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="glass-card p-4 animate-pulse"><div className="h-5 w-48 bg-surface-hover rounded" /></div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((org, i) => (
                        <motion.div
                            key={org.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => openDetail(org)}
                            className="glass-card p-4 hover:border-border-bright transition-all cursor-pointer group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-accent-cyan" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-cyan transition-colors">{org.name}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                                            {org.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{org.location}</span>}
                                            {org.team_size && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{org.team_size} members</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <span className="text-sm font-medium text-accent-purple">{org.application_count}</span>
                                        <span className="text-xs text-text-muted ml-1">apps</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent-cyan transition-colors" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="glass-card p-12 text-center">
                            <Building2 className="w-10 h-10 text-text-muted mx-auto mb-3" />
                            <p className="text-sm text-text-muted">No organizations found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Detail slide-over */}
            {selected && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <motion.div
                        initial={{ x: 400 }}
                        animate={{ x: 0 }}
                        exit={{ x: 400 }}
                        transition={{ type: 'spring', damping: 25 }}
                        onClick={e => e.stopPropagation()}
                        className="relative w-full max-w-lg bg-background border-l border-border h-full overflow-y-auto p-6 space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-text-primary">{selected.name}</h2>
                            <button onClick={() => setSelected(null)} className="text-text-muted hover:text-text-primary text-lg">&times;</button>
                        </div>

                        {selected.mission && (
                            <div>
                                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Mission</p>
                                <p className="text-sm text-text-secondary">{selected.mission}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {selected.location && (
                                <div className="p-3 rounded-xl bg-surface border border-border">
                                    <p className="text-xs text-text-muted">Location</p>
                                    <p className="text-sm font-medium text-text-primary mt-0.5">{selected.location}</p>
                                </div>
                            )}
                            {selected.team_size && (
                                <div className="p-3 rounded-xl bg-surface border border-border">
                                    <p className="text-xs text-text-muted">Team Size</p>
                                    <p className="text-sm font-medium text-text-primary mt-0.5">{selected.team_size}</p>
                                </div>
                            )}
                            {selected.budget && (
                                <div className="p-3 rounded-xl bg-surface border border-border">
                                    <p className="text-xs text-text-muted">Budget</p>
                                    <p className="text-sm font-medium text-text-primary mt-0.5">${selected.budget.toLocaleString()}</p>
                                </div>
                            )}
                            <div className="p-3 rounded-xl bg-surface border border-border">
                                <p className="text-xs text-text-muted">Applications</p>
                                <p className="text-sm font-medium text-accent-purple mt-0.5">{selected.application_count}</p>
                            </div>
                        </div>

                        {selected.focus_areas && selected.focus_areas.length > 0 && (
                            <div>
                                <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Focus Areas</p>
                                <div className="flex flex-wrap gap-2">
                                    {selected.focus_areas.map((a, i) => (
                                        <span key={i} className="px-2.5 py-1 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 text-xs text-accent-cyan">{a}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {orgApps.length > 0 && (
                            <div>
                                <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Applications</p>
                                <div className="space-y-2">
                                    {orgApps.map((app: any) => (
                                        <div key={app.id} className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-text-primary">{app.grant_id?.slice(0, 8)}...</p>
                                                <p className="text-xs text-text-muted mt-0.5">Created {new Date(app.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${app.status === 'approved' ? 'bg-accent-green/10 text-accent-green' :
                                                app.status === 'submitted' ? 'bg-amber-400/10 text-amber-400' :
                                                    app.status === 'rejected' ? 'bg-accent-rose/10 text-accent-rose' :
                                                        'bg-surface-hover text-text-muted'
                                                }`}>{app.status?.toUpperCase()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
