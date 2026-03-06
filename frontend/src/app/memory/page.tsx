'use client';

import AppLayout from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import {
    Brain, Users, Target, FileText, BookOpen,
    Plus, Edit3, Trash2, Save, CheckCircle,
} from 'lucide-react';
import { useState } from 'react';

const memoryData = {
    mission: 'We are building an AI-powered platform that democratizes access to non-dilutive funding for early-stage deep tech startups. Our mission is to ensure that every founder with a transformative idea can navigate the grant landscape without needing grant-writing expertise.',
    team: [
        { name: 'Dr. Sarah Chen', role: 'CEO & PI', expertise: 'NLP, AI Systems Design' },
        { name: 'James Rodriguez', role: 'CTO', expertise: 'ML Infrastructure, Cloud Systems' },
        { name: 'Priya Patel', role: 'Head of Product', expertise: 'UX Research, SaaS Platforms' },
        { name: 'Mark Thompson', role: 'Grant Specialist', expertise: 'Federal Grants, SBIR/STTR' },
    ],
    reusableAnswers: [
        { label: 'Company Overview', content: 'Founded in 2024, our team of 12 is building AI-native tools for the funding ecosystem...' },
        { label: 'Technical Capabilities', content: 'Our platform leverages multi-agent LLM architecture, vector embeddings for semantic matching...' },
        { label: 'Past Impact', content: 'In our beta phase, we helped 47 startups discover matching grants, resulting in 12 successful applications totaling $3.2M in non-dilutive funding...' },
        { label: 'Broader Impacts', content: 'Our solution addresses systemic inequity in grant access, particularly for minority-led and first-time applicant organizations...' },
    ],
};

export default function MemoryPage() {
    const [editingField, setEditingField] = useState<string | null>(null);

    return (
        <AppLayout>
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
                        <textarea
                            defaultValue={memoryData.mission}
                            rows={4}
                            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all resize-none"
                        />
                    ) : (
                        <p className="text-sm text-text-secondary leading-relaxed">{memoryData.mission}</p>
                    )}
                </motion.div>

                {/* Team */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold flex items-center gap-2">
                            <Users className="w-4 h-4 text-accent-green" /> Team
                        </h2>
                        <button className="px-3 py-1.5 rounded-lg bg-accent-cyan/10 text-accent-cyan text-xs font-medium flex items-center gap-1 hover:bg-accent-cyan/20 transition-all">
                            <Plus className="w-3 h-3" /> Add Member
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {memoryData.team.map((member, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-white text-sm font-semibold">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-text-primary">{member.name}</p>
                                    <p className="text-xs text-text-muted">{member.role} • {member.expertise}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Reusable Answers */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-accent-amber" /> Reusable Answers
                        </h2>
                        <button className="px-3 py-1.5 rounded-lg bg-accent-cyan/10 text-accent-cyan text-xs font-medium flex items-center gap-1 hover:bg-accent-cyan/20 transition-all">
                            <Plus className="w-3 h-3" /> Add Answer
                        </button>
                    </div>
                    <div className="space-y-3">
                        {memoryData.reusableAnswers.map((ans, i) => (
                            <div key={i} className="p-4 rounded-xl bg-surface hover:bg-surface-hover transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-text-primary">{ans.label}</p>
                                    <div className="flex items-center gap-1">
                                        <button className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all">
                                            <Edit3 className="w-3 h-3" />
                                        </button>
                                        <button className="p-1.5 rounded-lg text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-all">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-text-muted leading-relaxed">{ans.content}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}
