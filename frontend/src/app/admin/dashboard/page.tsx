'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, FileText, ClipboardList, ScrollText, Sparkles, Shield, TrendingUp, Activity } from 'lucide-react';
import api from '@/services/api';

interface AdminStats {
    total_organizations: number;
    total_grants: number;
    total_applications: number;
    total_audit_entries: number;
    narratives_today: number;
    compliance_today: number;
    application_status: Record<string, number>;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/api/admin/stats');
                if (data.success) setStats(data);
            } catch (err) {
                console.error('Failed to fetch admin stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const kpis = stats ? [
        { label: 'Total Organizations', value: stats.total_organizations, icon: Building2, color: 'cyan', gradient: 'from-accent-cyan to-accent-green' },
        { label: 'Total Grants', value: stats.total_grants, icon: FileText, color: 'purple', gradient: 'from-accent-purple to-accent-cyan' },
        { label: 'Total Applications', value: stats.total_applications, icon: ClipboardList, color: 'green', gradient: 'from-accent-green to-emerald-400' },
        { label: 'Audit Entries', value: stats.total_audit_entries, icon: ScrollText, color: 'amber', gradient: 'from-amber-400 to-orange-400' },
        { label: 'Narratives Today', value: stats.narratives_today, icon: Sparkles, color: 'cyan', gradient: 'from-accent-cyan to-blue-400' },
        { label: 'Compliance Today', value: stats.compliance_today, icon: Shield, color: 'green', gradient: 'from-accent-green to-teal-400' },
    ] : [];

    const statusData = stats?.application_status || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
                <p className="text-sm text-text-muted mt-1">Platform overview and key metrics</p>
            </div>

            {/* KPI Cards */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="glass-card p-5 animate-pulse">
                            <div className="h-4 w-24 bg-surface-hover rounded mb-3" />
                            <div className="h-8 w-16 bg-surface-hover rounded" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {kpis.map((kpi, i) => {
                        const Icon = kpi.icon;
                        return (
                            <motion.div
                                key={kpi.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-5 hover:border-border-bright transition-all group"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{kpi.label}</span>
                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity`}>
                                        <Icon className="w-4.5 h-4.5 text-background" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-text-primary">{kpi.value}</p>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Application Pipeline */}
            {stats && Object.keys(statusData).length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6"
                >
                    <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-accent-purple" />
                        Application Pipeline
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(statusData).map(([status, count]) => (
                            <div key={status} className="p-4 rounded-xl bg-surface border border-border">
                                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{status.replace(/_/g, ' ')}</p>
                                <p className="text-2xl font-bold text-text-primary">{count}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Quick actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6"
            >
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent-cyan" />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'View Organizations', href: '/admin/organizations', icon: Building2, color: 'cyan' },
                        { label: 'Manage Grants', href: '/admin/grants', icon: FileText, color: 'purple' },
                        { label: 'Monitor Applications', href: '/admin/applications', icon: ClipboardList, color: 'green' },
                        { label: 'Audit Logs', href: '/admin/audit', icon: ScrollText, color: 'amber' },
                    ].map((action) => {
                        const Icon = action.icon;
                        return (
                            <a key={action.href} href={action.href} className="p-4 rounded-xl bg-surface border border-border hover:border-border-bright hover:bg-surface-hover transition-all group cursor-pointer">
                                <Icon className={`w-5 h-5 text-accent-${action.color} mb-2 group-hover:scale-110 transition-transform`} />
                                <p className="text-sm font-medium text-text-primary">{action.label}</p>
                            </a>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
