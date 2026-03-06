'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
    LayoutDashboard,
    Building2,
    FileText,
    ClipboardList,
    ScrollText,
    Activity,
    Settings,
    ChevronLeft,
    ChevronRight,
    Shield,
    LogOut,
    Bell,
    User,
    ChevronDown,
    Zap,
} from 'lucide-react';

const adminNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: 'Organizations', icon: Building2, href: '/admin/organizations' },
    { label: 'Grants', icon: FileText, href: '/admin/grants' },
    { label: 'Applications', icon: ClipboardList, href: '/admin/applications' },
    { label: 'Audit Logs', icon: ScrollText, href: '/admin/audit' },
    { label: 'System Health', icon: Activity, href: '/admin/health' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

function AdminSidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
    const pathname = usePathname();

    return (
        <aside className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-background border-r border-border transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}>
            {/* Header */}
            <div className="h-16 flex items-center gap-3 px-4 border-b border-border flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4.5 h-4.5 text-white" />
                </div>
                {!collapsed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <span className="text-lg font-bold text-text-primary">
                            Grant<span className="text-accent-purple">Admin</span>
                        </span>
                    </motion.div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {adminNavItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group cursor-pointer ${isActive
                                ? 'bg-accent-purple/10 text-accent-purple'
                                : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover'}`}>
                                {isActive && (
                                    <motion.div
                                        layoutId="admin-active-bg"
                                        className="absolute inset-0 rounded-xl bg-accent-purple/10 border border-accent-purple/20"
                                        transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                                    />
                                )}
                                <Icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${isActive ? 'text-accent-purple' : ''}`} />
                                {!collapsed && (
                                    <span className="text-sm font-medium relative z-10">{item.label}</span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse toggle */}
            <div className="px-3 py-3 border-t border-border">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-text-muted hover:text-text-secondary hover:bg-surface-hover transition-all"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    {!collapsed && <span className="text-xs">Collapse</span>}
                </button>
            </div>
        </aside>
    );
}

function AdminTopbar() {
    const { user, logout } = useAuth();
    const [showProfile, setShowProfile] = useState(false);

    return (
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20">
                    <Shield className="w-3.5 h-3.5 text-accent-purple" />
                    <span className="text-xs font-medium text-accent-purple">Admin Panel</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Notifications placeholder */}
                <button className="relative p-2.5 rounded-xl bg-surface border border-border hover:border-border-bright hover:bg-surface-hover transition-all">
                    <Bell className="w-4 h-4 text-text-secondary" />
                </button>

                {/* Profile */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border transition-all ${showProfile ? 'bg-surface-hover border-border-bright' : 'bg-surface border-border hover:border-border-bright hover:bg-surface-hover'}`}
                    >
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-purple to-accent-rose flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-text-primary hidden sm:block">Admin</span>
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
                                    <p className="text-sm font-semibold text-text-primary">Admin Account</p>
                                    <p className="text-xs text-text-muted mt-0.5">{user?.email}</p>
                                </div>
                                <Link href="/admin/settings">
                                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-accent-purple hover:bg-accent-purple/10 transition-colors">
                                        <Settings className="w-4 h-4" /> Settings
                                    </button>
                                </Link>
                                <div className="h-px bg-border/50 my-1" />
                                <button onClick={() => logout()} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-accent-rose hover:bg-accent-rose/10 transition-colors">
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-background text-text-primary">
            <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
                <AdminTopbar />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
