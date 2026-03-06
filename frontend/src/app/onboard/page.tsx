'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { useRouter } from 'next/navigation';
import {
    Building2, Globe, DollarSign, Users, Target, Lightbulb,
    ArrowRight, ArrowLeft, CheckCircle, Sparkles, Brain, Loader2
} from 'lucide-react';
import { organizationService } from '@/services';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

const steps = [
    { title: 'Organization', icon: Building2 },
    { title: 'Focus & Mission', icon: Target },
    { title: 'Funding', icon: DollarSign },
    { title: 'Team & Impact', icon: Users },
];

const sectors = ['AI/ML', 'Climate Tech', 'Healthcare', 'Education', 'Fintech', 'Biotech', 'AgriTech', 'Space Tech', 'Cybersecurity', 'Social Impact'];
const focusAreas = ['Research & Development', 'Product Development', 'Market Expansion', 'Workforce Training', 'Infrastructure', 'Community Impact', 'Environmental Sustainability', 'Health Equity'];

export default function OnboardPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState({
        name: '', sector: '', country: '', mission: '',
        fundingNeed: '', teamSize: '', focusAreas: [] as string[],
        pastImpact: '',
    });

    const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);
    const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);

    const updateForm = (key: string, value: string | string[]) => {
        setForm({ ...form, [key]: value });
        // Simulate AI analysis
        if (key === 'mission' && typeof value === 'string' && value.length > 20) {
            const words = value.toLowerCase().split(' ');
            const keywords = words.filter(w => ['ai', 'climate', 'health', 'research', 'innovation', 'technology', 'energy', 'education', 'community', 'sustainable'].includes(w));
            setDetectedKeywords([...new Set(keywords)]);
            setSuggestedCategories(['SBIR/STTR', 'NSF Programs', 'DOE ARPA-E'].slice(0, keywords.length + 1));
        }
        if (key === 'sector') {
            setSuggestedCategories(value === 'AI/ML' ? ['NSF AI Institutes', 'DARPA', 'Google.org'] :
                value === 'Climate Tech' ? ['DOE ARPA-E', 'EPA Grants', 'USDA'] :
                    value === 'Healthcare' ? ['NIH STTR', 'BARDA', 'PCORI'] :
                        ['NSF SBIR', 'EDA', 'SBA']);
        }
    };

    const toggleFocus = (area: string) => {
        const updated = form.focusAreas.includes(area)
            ? form.focusAreas.filter(a => a !== area)
            : [...form.focusAreas, area];
        updateForm('focusAreas', updated);
    };

    const handleComplete = async () => {
        try {
            setIsSaving(true);
            // Map frontend camelCase form to backend snake_case schema
            const payload = {
                name: form.name,
                sector: form.sector,
                country: form.country,
                mission: form.mission,
                funding_need: form.fundingNeed ? parseFloat(form.fundingNeed) : null,
                team_size: form.teamSize,
                focus_areas: form.focusAreas,
                past_impact: form.pastImpact,
                budget: form.fundingNeed ? parseFloat(form.fundingNeed) : null,
                location: form.country,
            };
            const response = await organizationService.save(payload);
            if (response?.data?.id) {
                const orgId = response.data.id;
                localStorage.setItem('org_id', orgId);
                // Save org_id to Supabase profile for persistence across sessions
                if (user?.id && user.id !== 'admin-builtin') {
                    await supabase.from('profiles').update({ org_id: orgId }).eq('id', user.id);
                }
            }
            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to save organization:', error);
            alert("Failed to save organization profile to database.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Organization Onboarding</h1>
                        <p className="text-sm text-text-secondary mt-1">Help our AI understand your organization to find the best grants</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {steps.map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${i <= step ? 'bg-accent-cyan/10 text-accent-cyan' : 'bg-surface text-text-muted'
                                        }`}>
                                        {i < step ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                    </div>
                                    {i < steps.length - 1 && <div className={`w-8 h-px ${i < step ? 'bg-accent-cyan' : 'bg-border'}`} />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <div className="glass-card p-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {step === 0 && (
                                        <div className="space-y-5">
                                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                                <Building2 className="w-5 h-5 text-accent-cyan" /> Organization Details
                                            </h2>
                                            <div>
                                                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Organization Name</label>
                                                <input
                                                    value={form.name}
                                                    onChange={e => updateForm('name', e.target.value)}
                                                    placeholder="e.g. NovaTech Labs"
                                                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Sector</label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {sectors.map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => updateForm('sector', s)}
                                                            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${form.sector === s
                                                                ? 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan'
                                                                : 'bg-surface border-border text-text-secondary hover:border-border-bright'
                                                                }`}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Country</label>
                                                <input
                                                    value={form.country}
                                                    onChange={e => updateForm('country', e.target.value)}
                                                    placeholder="e.g. United States"
                                                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {step === 1 && (
                                        <div className="space-y-5">
                                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                                <Target className="w-5 h-5 text-accent-green" /> Focus & Mission
                                            </h2>
                                            <div>
                                                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Mission Statement</label>
                                                <textarea
                                                    value={form.mission}
                                                    onChange={e => updateForm('mission', e.target.value)}
                                                    rows={4}
                                                    placeholder="Describe your organization's core mission and what you're building..."
                                                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 transition-all resize-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Focus Areas</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {focusAreas.map(area => (
                                                        <button
                                                            key={area}
                                                            onClick={() => toggleFocus(area)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${form.focusAreas.includes(area)
                                                                ? 'bg-accent-green/10 border-accent-green/30 text-accent-green'
                                                                : 'bg-surface border-border text-text-secondary hover:border-border-bright'
                                                                }`}
                                                        >
                                                            {area}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-5">
                                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                                <DollarSign className="w-5 h-5 text-accent-purple" /> Funding Needs
                                            </h2>
                                            <div>
                                                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Funding Needed (USD)</label>
                                                <input
                                                    value={form.fundingNeed}
                                                    onChange={e => updateForm('fundingNeed', e.target.value)}
                                                    placeholder="e.g. 250000"
                                                    type="number"
                                                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-5">
                                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                                <Users className="w-5 h-5 text-accent-amber" /> Team & Impact
                                            </h2>
                                            <div>
                                                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Team Size</label>
                                                <input
                                                    value={form.teamSize}
                                                    onChange={e => updateForm('teamSize', e.target.value)}
                                                    placeholder="e.g. 12"
                                                    type="number"
                                                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Past Impact / Achievements</label>
                                                <textarea
                                                    value={form.pastImpact}
                                                    onChange={e => updateForm('pastImpact', e.target.value)}
                                                    rows={4}
                                                    placeholder="Describe past projects, awards, or milestones..."
                                                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 transition-all resize-none"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Navigation */}
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                                <button
                                    onClick={() => setStep(Math.max(0, step - 1))}
                                    disabled={step === 0}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-30 flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                {step < 3 ? (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setStep(step + 1)}
                                        className="px-6 py-2.5 rounded-xl bg-accent-cyan/10 text-accent-cyan text-sm font-semibold hover:bg-accent-cyan/20 transition-all flex items-center gap-1"
                                    >
                                        Next <ArrowRight className="w-4 h-4" />
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleComplete}
                                        disabled={isSaving}
                                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-green text-background text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle className="w-4 h-4" /> Complete Setup</>}
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* AI Analysis Panel */}
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card p-5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Brain className="w-4 h-4 text-accent-purple" />
                                <h3 className="text-sm font-semibold">Live AI Analysis</h3>
                                <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse ml-auto" />
                            </div>

                            {detectedKeywords.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs text-text-muted mb-2">Detected Keywords</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {detectedKeywords.map(kw => (
                                            <span key={kw} className="px-2 py-0.5 rounded-md bg-accent-cyan/10 text-accent-cyan text-[11px] font-medium">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {suggestedCategories.length > 0 && (
                                <div>
                                    <p className="text-xs text-text-muted mb-2">Suggested Grant Categories</p>
                                    <div className="space-y-1.5">
                                        {suggestedCategories.map(cat => (
                                            <div key={cat} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-hover text-xs text-text-secondary">
                                                <Sparkles className="w-3 h-3 text-accent-green" />
                                                {cat}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {detectedKeywords.length === 0 && suggestedCategories.length === 0 && (
                                <p className="text-xs text-text-muted">Start filling in your details — AI will analyze in real-time as you type.</p>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="glass-card p-5"
                        >
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-accent-amber" /> Tips
                            </h3>
                            <ul className="space-y-2 text-xs text-text-muted">
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-cyan">•</span>
                                    Be specific about your mission — AI uses it to match grants
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-cyan">•</span>
                                    Include measurable impact data for stronger proposals
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-cyan">•</span>
                                    Select multiple focus areas to discover more opportunities
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
