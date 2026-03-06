'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Search,
    FileText,
    PenTool,
    ShieldCheck,
    CheckCircle,
    Brain,
    Settings,
    Zap,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Discover Grants', href: '/discover', icon: Search },
    { label: 'Applications', href: '/applications', icon: FileText },
    { label: 'Proposal Studio', href: '/apply/grant-1', icon: PenTool },
    { label: 'Compliance', href: '/compliance', icon: ShieldCheck },
    { label: 'Review Center', href: '/review', icon: CheckCircle },
    { label: 'Org Memory', href: '/memory', icon: Brain },
    { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-0 h-screen z-40 flex flex-col border-r border-border"
            style={{ background: 'rgba(11, 16, 32, 0.95)', backdropFilter: 'blur(20px)' }}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 h-16 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-background" />
                </div>
                {!collapsed && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-lg font-bold tracking-tight"
                    >
                        Grant<span className="text-accent-cyan">Agent</span>
                    </motion.span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    const Icon = item.icon;

                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${isActive
                                        ? 'text-accent-cyan bg-accent-cyan/10'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-indicator"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-accent-cyan"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <div className="px-3 py-4 border-t border-border">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex items-center justify-center w-full py-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                >
                    {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>
        </motion.aside>
    );
}
