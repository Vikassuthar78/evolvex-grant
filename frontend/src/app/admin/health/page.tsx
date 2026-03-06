'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, XCircle, RefreshCw, Database, Cpu, Zap } from 'lucide-react';
import api from '@/services/api';

interface HealthChecks {
    database: string;
    groq_configured: boolean;
    api: string;
}

export default function AdminHealthPage() {
    const [checks, setChecks] = useState<HealthChecks | null>(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/admin/health');
            if (data.success) {
                setChecks(data.checks);
                setStatus(data.status);
            }
        } catch (err) { console.error(err); setStatus('error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchHealth(); }, []);

    const items = checks ? [
        { label: 'Database (Supabase)', status: checks.database === 'healthy', icon: Database, detail: checks.database },
        { label: 'Groq LLM', status: checks.groq_configured, icon: Cpu, detail: checks.groq_configured ? 'Configured' : 'Not configured' },
        { label: 'API Server', status: checks.api === 'healthy', icon: Zap, detail: checks.api },
    ] : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">System Health</h1>
                    <p className="text-sm text-text-muted mt-1">Monitor infrastructure status</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status === 'healthy' ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' : 'bg-accent-rose/10 text-accent-rose border border-accent-rose/20'}`}>
                        {status === 'healthy' ? 'All Systems Operational' : 'Degraded'}
                    </span>
                    <button onClick={fetchHealth} disabled={loading} className="p-2 rounded-xl bg-surface border border-border hover:border-border-bright transition-all">
                        <RefreshCw className={`w-4 h-4 text-text-muted ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {loading && !checks ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="glass-card p-5 animate-pulse"><div className="h-5 w-48 bg-surface-hover rounded" /></div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-5 hover:border-border-bright transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.status ? 'bg-accent-green/10' : 'bg-accent-rose/10'}`}>
                                            <Icon className={`w-5 h-5 ${item.status ? 'text-accent-green' : 'text-accent-rose'}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-text-primary">{item.label}</h3>
                                            <p className="text-xs text-text-muted mt-0.5">{item.detail}</p>
                                        </div>
                                    </div>
                                    {item.status ? (
                                        <CheckCircle className="w-5 h-5 text-accent-green" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-accent-rose" />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
