'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Palette, Save, CheckCircle } from 'lucide-react';

export default function AdminSettingsPage() {
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Admin Settings</h1>
                    <p className="text-sm text-text-muted mt-1">Configure platform preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:opacity-90 transition-opacity"
                >
                    {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            <div className="grid gap-6">
                {/* General */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Settings className="w-4 h-4 text-purple-400" />
                        </div>
                        <h2 className="text-base font-semibold text-text-primary">General</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-1.5">Platform Name</label>
                            <input type="text" defaultValue="EvolveX Grant Agent" className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-sm text-text-primary focus:outline-none focus:border-purple-500/50" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-1.5">Default Grant Review Model</label>
                            <select className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-sm text-text-primary focus:outline-none focus:border-purple-500/50">
                                <option>llama-3.1-8b-instant (Groq)</option>
                                <option>gpt-4o-mini (OpenAI)</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Security */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-accent-green/10 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-accent-green" />
                        </div>
                        <h2 className="text-base font-semibold text-text-primary">Security</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-text-primary">Require Email Verification</p>
                                <p className="text-xs text-text-muted mt-0.5">New users must verify email before access</p>
                            </div>
                            <div className="w-10 h-6 bg-accent-green/30 rounded-full flex items-center justify-end px-0.5 cursor-pointer">
                                <div className="w-5 h-5 bg-accent-green rounded-full" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-text-primary">Two-Factor Authentication</p>
                                <p className="text-xs text-text-muted mt-0.5">Enforce 2FA for admin accounts</p>
                            </div>
                            <div className="w-10 h-6 bg-surface-hover rounded-full flex items-center px-0.5 cursor-pointer">
                                <div className="w-5 h-5 bg-text-muted rounded-full" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Notifications */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                            <Bell className="w-4 h-4 text-accent-cyan" />
                        </div>
                        <h2 className="text-base font-semibold text-text-primary">Notifications</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-text-primary">New Application Alerts</p>
                                <p className="text-xs text-text-muted mt-0.5">Get notified when new applications are submitted</p>
                            </div>
                            <div className="w-10 h-6 bg-accent-cyan/30 rounded-full flex items-center justify-end px-0.5 cursor-pointer">
                                <div className="w-5 h-5 bg-accent-cyan rounded-full" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-text-primary">Compliance Alerts</p>
                                <p className="text-xs text-text-muted mt-0.5">Alert when compliance scores drop below threshold</p>
                            </div>
                            <div className="w-10 h-6 bg-accent-cyan/30 rounded-full flex items-center justify-end px-0.5 cursor-pointer">
                                <div className="w-5 h-5 bg-accent-cyan rounded-full" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
