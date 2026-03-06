'use client';

import AppLayout from '@/components/layout/AppLayout';
import { organizationService } from '@/services';
import { motion } from 'framer-motion';
import {
    Settings as SettingsIcon, User, Key, Users, Bell,
    CheckCircle, XCircle, ExternalLink, ChevronRight, Loader2, Save,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const apiServices = [
    { name: 'Grants.gov API', status: 'connected', description: 'Federal grant discovery' },
    { name: 'Groq LLM', status: 'connected', description: 'Narrative generation (llama-3.1-8b)' },
    { name: 'Supabase', status: 'connected', description: 'Database & authentication' },
];

export default function SettingsPage() {
    const [orgData, setOrgData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', organization: '', role: 'Founder & CEO' });

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const orgId = localStorage.getItem('org_id');
                if (orgId) {
                    const res = await organizationService.get(orgId);
                    const data = res?.data || res;
                    if (data) {
                        setOrgData(data);
                        setForm(prev => ({
                            ...prev,
                            organization: data.name || '',
                            name: data.team_size || 'Team Lead',
                        }));
                    }
                }
                // Load user email from auth
                const userStr = localStorage.getItem('grantagent_user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setForm(prev => ({ ...prev, email: user.email || '', name: user.name || prev.name }));
                }
            } catch (err) {
                console.error("Settings fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrg();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save user info to localStorage
            const userStr = localStorage.getItem('grantagent_user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.name = form.name;
                user.email = form.email;
                localStorage.setItem('grantagent_user', JSON.stringify(user));
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error("Save error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 max-w-4xl">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <SettingsIcon className="w-6 h-6 text-text-secondary" /> Settings
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">Manage your account, API integrations, and preferences</p>
                </div>

                {isLoading ? (
                    <div className="glass-card p-12 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-accent-cyan animate-spin mb-4" />
                        <p className="text-sm text-text-muted">Loading settings...</p>
                    </div>
                ) : (
                <>
                {/* Profile */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                    <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-accent-cyan" /> Profile
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Name</label>
                            <input
                                value={form.name}
                                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Email</label>
                            <input
                                value={form.email}
                                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Organization</label>
                            <input
                                value={form.organization}
                                readOnly
                                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-muted focus:outline-none transition-all cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Role</label>
                            <input
                                value={form.role}
                                onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="mt-4 px-5 py-2 rounded-xl bg-accent-cyan/10 text-accent-cyan text-sm font-medium hover:bg-accent-cyan/20 transition-all flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved ? 'Saved!' : 'Save Changes'}
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
                </>
                )}
            </div>
        </AppLayout>
    );
}
