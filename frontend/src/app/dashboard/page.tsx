'use client';

import AppLayout from '@/components/layout/AppLayout';
import KPICard from '@/components/ui/KPICard';
import ActivityFeed from '@/components/ui/ActivityFeed';
import ScoreBadge from '@/components/ui/ScoreBadge';
import { dashboardService, grantsService } from '@/services';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import { Sparkles, ArrowRight, Clock, AlertTriangle, Globe, DollarSign, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [liveGrants, setLiveGrants] = useState<any[]>([]);
    const [liveLoading, setLiveLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await dashboardService.getStats();
                setData(res);
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();

        // Fetch live grants directly from Grants.gov
        const fetchLive = async () => {
            try {
                const keywords = ['technology', 'health', 'education'];
                const results = await Promise.allSettled(
                    keywords.map(k => grantsService.search({ keyword: k, rows: 4 }))
                );
                const all = results
                    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
                    .flatMap(r => r.value?.grants || []);
                // Deduplicate by title
                const seen = new Set<string>();
                const unique = all.filter(g => {
                    if (seen.has(g.title)) return false;
                    seen.add(g.title);
                    return true;
                });
                setLiveGrants(unique.slice(0, 6));
            } catch (e) {
                console.error('Live grants fetch error:', e);
            }
            finally { setLiveLoading(false); }
        };
        fetchLive();
    }, []);

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p className="text-sm text-text-secondary mt-1">Your AI Grant Office at a glance</p>
                    </div>
                    <Link href="/discover">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-green text-background text-sm font-semibold flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            Discover Grants
                        </motion.button>
                    </Link>
                </div>

                {isLoading || !data ? (
                    <div className="glass-card p-12 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-accent-cyan animate-spin mb-4" />
                        <h3 className="text-base font-semibold text-text-primary">Loading your AI Dashboard...</h3>
                        <p className="text-sm text-text-muted mt-1">Fetching live stats from backend</p>
                    </div>
                ) : (
                    <>

                        {/* KPIs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {data.kpis.map((kpi: any, i: number) => (
                                <KPICard key={kpi.label} {...kpi} index={i} />
                            ))}
                        </div>

                        {/* AI Recommendation Banner */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="glass-card p-5 flex items-center gap-4 border-l-2 border-accent-cyan"
                        >
                            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-5 h-5 text-accent-cyan" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-text-primary">AI Recommendation</h3>
                                <p className="text-xs text-text-secondary mt-0.5">
                                    Based on your profile, <span className="text-accent-cyan font-medium">NSF SBIR Phase I</span> has the highest fit score (92%).
                                    The deadline is in 40 days — start your proposal now to maximize review time.
                                </p>
                            </div>
                            <Link href="/apply">
                                <button className="px-4 py-2 rounded-lg bg-accent-cyan/10 text-accent-cyan text-xs font-semibold hover:bg-accent-cyan/20 transition-colors flex items-center gap-1">
                                    Start Proposal <ArrowRight className="w-3 h-3" />
                                </button>
                            </Link>
                        </motion.div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Pipeline */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="glass-card p-6"
                            >
                                <h3 className="text-sm font-semibold text-text-primary mb-4">Grant Pipeline</h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={data.pipeline} barSize={40}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }}
                                            labelStyle={{ color: '#E5E7EB' }}
                                        />
                                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                            {data.pipeline.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>

                            {/* Probability Trend */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="glass-card p-6"
                            >
                                <h3 className="text-sm font-semibold text-text-primary mb-4">Avg. Win Probability Trend</h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={data.probabilityTrend}>
                                        <defs>
                                            <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} />
                                        <Tooltip
                                            contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }}
                                            labelStyle={{ color: '#E5E7EB' }}
                                        />
                                        <Area type="monotone" dataKey="score" stroke="#00D4FF" fill="url(#probGradient)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </div>

                        {/* Bottom Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Recent Activity */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="glass-card p-5 lg:col-span-2"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-text-primary">Recent AI Activity</h3>
                                    <span className="text-xs text-text-muted">Last 24 hours</span>
                                </div>
                                <ActivityFeed items={data.activity} />
                            </motion.div>

                            {/* Urgent Deadlines */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                                className="glass-card p-5"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertTriangle className="w-4 h-4 text-accent-amber" />
                                    <h3 className="text-sm font-semibold text-text-primary">Urgent Deadlines</h3>
                                </div>
                                <div className="space-y-3">
                                    {data.urgentDeadlines
                                        .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                                        .slice(0, 4)
                                        .map((app: any, i: number) => {
                                            const days = 14;
                                            const isUrgent = days <= 30;
                                            return (
                                                <motion.div
                                                    key={app.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 1 + i * 0.1 }}
                                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-hover transition-colors"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-text-primary truncate">{app.grantTitle}</p>
                                                        <p className="text-xs text-text-muted">{app.funder}</p>
                                                    </div>
                                                    <div className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap ${isUrgent ? 'text-accent-rose' : 'text-text-muted'}`}>
                                                        <Clock className="w-3 h-3" />
                                                        {days}d
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                </div>
                            </motion.div>
                        </div>

                        {/* Live Grants from Grants.gov */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-accent-green" />
                                    <h3 className="text-sm font-semibold text-text-primary">Live Grants from Grants.gov</h3>
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                                </div>
                                <Link href="/discover">
                                    <span className="text-xs text-accent-cyan font-medium hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></span>
                                </Link>
                            </div>
                            {liveLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-5 h-5 text-accent-green animate-spin" />
                                    <span className="ml-2 text-sm text-text-muted">Fetching from Grants.gov...</span>
                                </div>
                            ) : liveGrants.length === 0 ? (
                                <p className="text-sm text-text-muted text-center py-6">No grants found. Complete onboarding to discover matching grants.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {liveGrants.slice(0, 6).map((g: any, i: number) => (
                                        <motion.div
                                            key={g.id || i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1.1 + i * 0.05 }}
                                            className="p-4 rounded-xl bg-surface border border-border hover:border-accent-green/30 transition-all group"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <span className="px-2 py-0.5 rounded-md bg-accent-green/10 text-accent-green text-[10px] font-medium">{g.category || 'Federal'}</span>
                                                {g.fitScore > 0 && <span className="text-[10px] font-bold text-accent-cyan">{g.fitScore}% fit</span>}
                                            </div>
                                            <h4 className="text-sm font-medium text-text-primary line-clamp-2 mb-2">{g.title}</h4>
                                            <p className="text-xs text-text-muted mb-3">{g.funder || 'Federal Agency'}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1 text-accent-green text-xs font-semibold">
                                                    <DollarSign className="w-3 h-3" />
                                                    {(g.amount || 0).toLocaleString()}
                                                </div>
                                                {g.source_url ? (
                                                    <a href={g.source_url} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent-cyan transition-colors">
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                ) : (
                                                    <Link href={`/grant/${g.id}`}>
                                                        <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent-cyan transition-colors" />
                                                    </Link>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
