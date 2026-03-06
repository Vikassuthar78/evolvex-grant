'use client';

import { Bell, Search, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Topbar() {
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
                <button className="relative p-2.5 rounded-xl bg-surface border border-border hover:border-border-bright hover:bg-surface-hover transition-all">
                    <Bell className="w-4 h-4 text-text-secondary" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-rose" />
                </button>

                {/* User */}
                <button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-surface border border-border hover:border-border-bright hover:bg-surface-hover transition-all">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-text-primary">Founder</span>
                </button>
            </div>
        </header>
    );
}
