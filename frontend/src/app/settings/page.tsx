'use client';

import AppLayout from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import {
    Settings as SettingsIcon, User, Key, Users, Bell,
    CheckCircle, XCircle, ExternalLink, ChevronRight,
} from 'lucide-react';

const apiServices = [
    { name: 'Grants.gov API', status: 'connected', description: 'Federal grant discovery' },
    { name: 'OpenAI', status: 'ready', description: 'Narrative generation & embeddings' },
    { name: 'Anthropic Claude', status: 'ready', description: 'Multi-agent orchestration' },
    { name: 'Supabase', status: 'connected', description: 'Database & authentication' },
];

export default function SettingsPage() {
    return (
        <AppLayout>
            <div className="space-y-6 max-w-4xl">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <SettingsIcon className="w-6 h-6 text-text-secondary" /> Settings
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">Manage your account, API integrations, and preferences</p>
                </div>

                {/* Profile */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                    <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-accent-cyan" /> Profile
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Name</label>
                            <input
                                defaultValue="Jane Founder"
                                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Email</label>
                            <input
                                defaultValue="jane@grantagent.ai"
                                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Organization</label>
                            <input
                                defaultValue="NovaTech Labs"
                                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Role</label>
                            <input
                                defaultValue="Founder & CEO"
                                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all"
                            />
                        </div>
                    </div>
                    <button className="mt-4 px-5 py-2 rounded-xl bg-accent-cyan/10 text-accent-cyan text-sm font-medium hover:bg-accent-cyan/20 transition-all">
                        Save Changes
                    </button>
                </motion.div>

                {/* API Status */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                    <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                        <Key className="w-4 h-4 text-accent-green" /> API Integrations
                    </h2>
                    <div className="space-y-3">
                        {apiServices.map(svc => (
                            <div key={svc.name} className="flex items-center justify-between p-4 rounded-xl bg-surface hover:bg-surface-hover transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${svc.status === 'connected' ? 'bg-accent-green' : 'bg-accent-amber'}`} />
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">{svc.name}</p>
                                        <p className="text-xs text-text-muted">{svc.description}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${svc.status === 'connected' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-amber/10 text-accent-amber'
                                    }`}>
                                    {svc.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Notifications */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                    <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-accent-amber" /> Notifications
                    </h2>
                    <div className="space-y-3">
                        {['Deadline reminders', 'AI agent activity', 'Compliance alerts', 'New grant matches'].map((pref, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface">
                                <span className="text-sm text-text-secondary">{pref}</span>
                                <button className="w-10 h-5 rounded-full bg-accent-cyan/20 relative transition-all">
                                    <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-accent-cyan transition-all" />
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Collaboration */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
                    <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent-purple" /> Collaboration
                    </h2>
                    <p className="text-sm text-text-muted mb-4">Invite team members to collaborate on grant applications.</p>
                    <div className="flex gap-3">
                        <input
                            placeholder="Email address"
                            className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 transition-all"
                        />
                        <button className="px-5 py-2.5 rounded-xl bg-accent-purple/10 text-accent-purple text-sm font-medium hover:bg-accent-purple/20 transition-all">
                            Invite
                        </button>
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}
