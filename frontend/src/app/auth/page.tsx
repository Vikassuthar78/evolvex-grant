'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, Github, Chrome } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

function AuthContent() {
    const searchParams = useSearchParams();
    const isSignupUrl = searchParams.get('mode') === 'signup';

    const [isLogin, setIsLogin] = useState(!isSignupUrl);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(email || 'founder@startup.com');
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-mesh" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-cyan/5 blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center">
                        <Zap className="w-5 h-5 text-background" />
                    </div>
                    <span className="text-2xl font-bold">Grant<span className="text-accent-cyan">Agent</span></span>
                </div>

                {/* Card */}
                <div className="glass-card p-8">
                    {/* Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-surface rounded-xl mb-8">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${isLogin ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-text-muted hover:text-text-secondary'
                                }`}
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-text-muted hover:text-text-secondary'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.form
                            key={isLogin ? 'login' : 'signup'}
                            initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            {!isLogin && (
                                <div>
                                    <label className="text-xs font-medium text-text-secondary mb-1.5 block">Organization Name</label>
                                    <input
                                        type="text"
                                        placeholder="Acme Inc."
                                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/20 transition-all"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="founder@startup.com"
                                        className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/20 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/20 transition-all"
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-green text-background font-semibold text-sm hover:shadow-lg hover:shadow-accent-cyan/20 transition-all flex items-center justify-center gap-2"
                            >
                                {isLogin ? 'Log In' : 'Create Account'}
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </motion.form>
                    </AnimatePresence>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-text-muted">or continue with</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Social */}
                    <div className="flex gap-3">
                        <button type="button" className="flex-1 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover transition-all flex items-center justify-center gap-2 text-sm text-text-secondary">
                            <Github className="w-4 h-4" /> GitHub
                        </button>
                        <button type="button" className="flex-1 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover transition-all flex items-center justify-center gap-2 text-sm text-text-secondary">
                            <Chrome className="w-4 h-4" /> Google
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs text-text-muted mt-6">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </motion.div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
            <AuthContent />
        </Suspense>
    );
}
