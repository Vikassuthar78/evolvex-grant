'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, Github, Chrome } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

function AuthContent() {
    const searchParams = useSearchParams();
    const isSignupUrl = searchParams.get('mode') === 'signup';

    const [isLogin, setIsLogin] = useState(!isSignupUrl);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const { login, signUp } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (isLogin) {
                const result = await login(email, password);
                if (result.error) {
                    setError(result.error);
                }
                // Redirect handled by AuthProvider onAuthStateChange
            } else {
                const result = await signUp(email, password, 'founder');
                if (result.error) {
                    setError(result.error);
                } else {
                    setSuccessMsg('Account created! Check your email to confirm, then log in.');
                    setIsLogin(true);
                    setEmail('');
                    setPassword('');
                }
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
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
                            onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${isLogin ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-text-muted hover:text-text-secondary'}`}
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-text-muted hover:text-text-secondary'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Error / Success messages */}
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm">
                            {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="mb-4 p-3 rounded-xl bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm">
                            {successMsg}
                        </div>
                    )}

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
                            <div>
                                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@email.com"
                                        required
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
                                        required
                                        minLength={6}
                                        className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/20 transition-all"
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-green text-background font-semibold text-sm hover:shadow-lg hover:shadow-accent-cyan/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? 'Log In' : 'Create Account'}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
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
