'use client';

import AppLayout from '@/components/layout/AppLayout';
import { organizationService } from '@/services';
import { motion } from 'framer-motion';
import {
    Brain, Users, Target, FileText, BookOpen,
    Plus, Edit3, Trash2, Save, CheckCircle, Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MemoryPage() {
    const [editingField, setEditingField] = useState<string | null>(null);
    const [orgData, setOrgData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editedMission, setEditedMission] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const orgId = localStorage.getItem('org_id');
                if (orgId) {
                    const res = await organizationService.get(orgId);
                    if (res?.data) setOrgData(res.data);
                    else if (res) setOrgData(res);
                }
            } catch (err) {
                console.error("Fetch org error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrg();
    }, []);

    const mission = orgData?.mission || 'No mission set. Complete onboarding to populate your organization memory.';
    const focusAreas = orgData?.focus_areas || orgData?.focusAreas || [];
    const teamSize = orgData?.team_size || orgData?.teamSize || 0;
    const name = orgData?.name || 'Your Organization';
    const pastImpact = orgData?.past_impact || orgData?.pastImpact || '';

    return (
        <AppLayout>
            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <Loader2 className="w-8 h-8 text-accent-cyan animate-spin mb-4" />
                    <h3 className="text-base font-semibold text-text-primary">Loading Organization Memory...</h3>
                </div>
            ) : (
            <div className="space-y-6 max-w-5xl">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Brain className="w-6 h-6 text-accent-purple" /> Organization Memory
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">Your AI uses this context for every proposal and application</p>
                </div>

                {/* Mission */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold flex items-center gap-2">
                            <Target className="w-4 h-4 text-accent-cyan" /> Mission Statement
                        </h2>
                        <button
                            onClick={() => setEditingField(editingField === 'mission' ? null : 'mission')}
                            className="p-2 rounded-lg hover:bg-surface-hover transition-all text-text-muted hover:text-text-primary"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                    </div>
                    {editingField === 'mission' ? (
                        <div>
                            <textarea
                                defaultValue={mission}
                                onChange={e => setEditedMission(e.target.value)}
                                rows={4}
                                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all resize-none"
                            />
                            <button
                                onClick={async () => {
                                    if (!editedMission) return;
                                    setIsSaving(true);
                                    try {
                                        await organizationService.save({ ...orgData, mission: editedMission });
                                        setOrgData((prev: any) => ({ ...prev, mission: editedMission }));
                                        setEditingField(null);
                                    } catch (err) {
                                        console.error("Save mission error:", err);
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                                disabled={isSaving}
                                className="mt-3 px-4 py-2 rounded-xl bg-accent-cyan/10 text-accent-cyan text-xs font-medium hover:bg-accent-cyan/20 transition-all flex items-center gap-1"
                            >
                                <Save className="w-3 h-3" /> {isSaving ? 'Saving...' : 'Save Mission'}
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-text-secondary leading-relaxed">{mission}</p>
                    )}
                </motion.div>

                {/* Organization Info */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold flex items-center gap-2">
                            <Users className="w-4 h-4 text-accent-green" /> Organization Details
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-xl bg-surface">
                            <p className="text-xs text-text-muted mb-1">Name</p>
                            <p className="text-sm font-medium text-text-primary">{name}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-surface">
                            <p className="text-xs text-text-muted mb-1">Team Size</p>
                            <p className="text-sm font-medium text-text-primary">{teamSize} members</p>
                        </div>
                        <div className="p-3 rounded-xl bg-surface md:col-span-2">
                            <p className="text-xs text-text-muted mb-1">Focus Areas</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {focusAreas.map((area: string) => (
                                    <span key={area} className="px-3 py-1 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 text-xs text-accent-cyan font-medium">
                                        {area}
                                    </span>
                                ))}
                                {focusAreas.length === 0 && <span className="text-xs text-text-muted">No focus areas set</span>}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Past Impact */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-accent-amber" /> Past Impact
                        </h2>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        {pastImpact || 'No past impact data recorded. Complete onboarding to populate.'}
                    </p>
                </motion.div>
            </div>
            )}
        </AppLayout>
    );
}
