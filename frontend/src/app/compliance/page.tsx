'use client';

import AppLayout from '@/components/layout/AppLayout';
import ComplianceMeter from '@/components/ui/ComplianceMeter';
import { mockComplianceChecks } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import {
    ShieldCheck, CheckCircle, AlertTriangle, XCircle,
    Lightbulb, ArrowRight, FileText,
} from 'lucide-react';
import Link from 'next/link';

export default function CompliancePage() {
    const overallScore = 72;
    const passed = mockComplianceChecks.filter(c => c.status === 'pass').length;
    const warnings = mockComplianceChecks.filter(c => c.status === 'warning').length;
    const failed = mockComplianceChecks.filter(c => c.status === 'fail').length;

    const categories = [...new Set(mockComplianceChecks.map(c => c.category))];

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-accent-amber" /> Compliance Center
                        </h1>
                        <p className="text-sm text-text-secondary mt-1">Validate your application before submission</p>
                    </div>
                    <Link href="/review">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-green text-background text-sm font-semibold flex items-center gap-2"
                        >
                            Proceed to Review <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </Link>
                </div>

                {/* Score Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6 flex flex-col items-center justify-center"
                    >
                        <ComplianceMeter score={overallScore} />
                        <p className="text-sm font-semibold mt-3">Overall Score</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-accent-green" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-accent-green">{passed}</p>
                            <p className="text-xs text-text-muted">Passed</p>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent-amber/10 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-accent-amber" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-accent-amber">{warnings}</p>
                            <p className="text-xs text-text-muted">Warnings</p>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent-rose/10 flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-accent-rose" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-accent-rose">{failed}</p>
                            <p className="text-xs text-text-muted">Failed</p>
                        </div>
                    </motion.div>
                </div>

                {/* Checklist by Category */}
                {categories.map((cat, ci) => (
                    <motion.div
                        key={cat}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + ci * 0.1 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-accent-cyan" /> {cat}
                        </h2>
                        <div className="space-y-3">
                            {mockComplianceChecks.filter(c => c.category === cat).map((check, i) => (
                                <div key={check.id} className="flex items-start gap-3 p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors">
                                    <div className="mt-0.5">
                                        {check.status === 'pass' && <CheckCircle className="w-4 h-4 text-accent-green" />}
                                        {check.status === 'warning' && <AlertTriangle className="w-4 h-4 text-accent-amber" />}
                                        {check.status === 'fail' && <XCircle className="w-4 h-4 text-accent-rose" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-text-primary">{check.label}</p>
                                            <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${check.status === 'pass' ? 'text-accent-green bg-accent-green/10' :
                                                    check.status === 'warning' ? 'text-accent-amber bg-accent-amber/10' :
                                                        'text-accent-rose bg-accent-rose/10'
                                                }`}>{check.status.toUpperCase()}</span>
                                        </div>
                                        <p className="text-xs text-text-muted mt-0.5">{check.message}</p>
                                        {check.suggestion && (
                                            <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg bg-accent-amber/5 border border-accent-amber/10">
                                                <Lightbulb className="w-3 h-3 text-accent-amber mt-0.5 flex-shrink-0" />
                                                <p className="text-xs text-accent-amber">{check.suggestion}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </AppLayout>
    );
}
