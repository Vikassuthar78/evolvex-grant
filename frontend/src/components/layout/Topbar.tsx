'use client';

import { Bell, Search, User, Sparkles, LogOut, Settings, CheckCircle, ChevronDown, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function Topbar() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    // Close dropdowns on outside click
    const notifRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfile(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
    };
    return (
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
            {/* Search */}
            <div className="flex items-center gap-3 flex-1 max-w-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search grants, applications, or ask AI..."
                        className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/20 transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-surface-hover border border-border text-[10px] text-text-muted">
                        ⌘K
                    </div>
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* AI Status */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20"
                >
                    <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
                    <span className="text-xs font-medium text-accent-cyan">AI Active</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                </motion.div>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                        className={`relative p-2.5 rounded-xl border transition-all ${showNotifications ? 'bg-surface-hover border-border-bright' : 'bg-surface border-border hover:border-border-bright hover:bg-surface-hover'}`}
                    >
                        <Bell className="w-4 h-4 text-text-secondary" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-rose" />
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-2 w-80 bg-surface/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl overflow-hidden z-50"
                            >
                                <div className="p-4 border-b border-border flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                                    <span className="text-xs text-accent-cyan cursor-pointer hover:underline">Mark all read</span>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    <div className="p-4 border-b border-border hover:bg-surface-hover transition-colors cursor-pointer group">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-accent-green/10 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="w-4 h-4 text-accent-green" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-text-primary font-medium group-hover:text-accent-cyan transition-colors">Compliance Check Passed</p>
                                                <p className="text-xs text-text-muted mt-1">Your NSF SBIR Phase I proposal passed all primary compliance checks.</p>
                                                <p className="text-[10px] text-text-secondary mt-2">2 hours ago</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 hover:bg-surface-hover transition-colors cursor-pointer group">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
                                                <Rocket className="w-4 h-4 text-accent-cyan" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-text-primary font-medium group-hover:text-accent-cyan transition-colors">New Grant Match!</p>
                                                <p className="text-xs text-text-muted mt-1">We found a new DOE ARPA-E grant that strongly matches your profile.</p>
                                                <p className="text-[10px] text-text-secondary mt-2">1 day ago</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-surface-hover border-t border-border text-center">
                                    <button className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">View All Notifications</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                        className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border transition-all ${showProfile ? 'bg-surface-hover border-border-bright ring-1 ring-border-bright' : 'bg-surface border-border hover:border-border-bright hover:bg-surface-hover'}`}
                    >
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center shadow-inner">
                            <User className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-text-primary hidden sm:block">{user?.name || 'User'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${showProfile ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showProfile && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-2 w-56 bg-surface/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl overflow-hidden z-50 p-2 space-y-1"
                            >
                                <div className="px-3 py-2 mb-2 border-b border-border/50">
                                    <p className="text-sm font-semibold text-text-primary">Founder Account</p>
                                    <p className="text-xs text-text-muted mt-0.5">{user?.email || 'No email'}</p>
                                </div>

                                <Link href="/settings">
                                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-accent-cyan hover:bg-accent-cyan/10 transition-colors">
                                        <Settings className="w-4 h-4" /> Settings
                                    </button>
                                </Link>

                                <div className="h-px bg-border/50 my-1" />

                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-accent-rose hover:bg-accent-rose/10 transition-colors">
                                    <LogOut className="w-4 h-4" /> Sign out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
