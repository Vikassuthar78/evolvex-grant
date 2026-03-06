'use client';

import AppLayout from '@/components/layout/AppLayout';
import KPICard from '@/components/ui/KPICard';
import ActivityFeed from '@/components/ui/ActivityFeed';
import ScoreBadge from '@/components/ui/ScoreBadge';
import { mockKPIs, mockActivity, mockGrants, mockPipelineData, mockProbabilityData, mockApplications } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import { Sparkles, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
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

                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mockKPIs.map((kpi, i) => (
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
                    <Link href="/apply/grant-1">
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
                            <BarChart data={mockPipelineData} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }}
                                    labelStyle={{ color: '#E5E7EB' }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {mockPipelineData.map((entry, index) => (
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
                            <AreaChart data={mockProbabilityData}>
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
                        <ActivityFeed items={mockActivity} />
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
                            {mockApplications
                                .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                                .slice(0, 4)
                                .map((app, i) => {
                                    const days = Math.max(0, Math.ceil((new Date(app.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
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
            </div>
        </AppLayout>
    );
}
