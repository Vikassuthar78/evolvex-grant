'use client';

import { motion } from 'framer-motion';
import {
    Zap,
    Search,
    CheckCircle,
    PenTool,
    ShieldCheck,
    Bot,
    ArrowRight,
    Sparkles,
    TrendingUp,
    Users,
    DollarSign,
    Clock,
    Star,
    ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

const stats = [
    { value: '$2.3B+', label: 'in grants go unclaimed yearly', icon: DollarSign },
    { value: '120+ hrs', label: 'avg time per grant application', icon: Clock },
    { value: '80%', label: 'of eligible orgs never apply', icon: Users },
    { value: '<20%', label: 'success rate without expertise', icon: TrendingUp },
];

const workflow = [
    { step: '01', title: 'Profile Your Organization', desc: 'Enter your mission, team, and funding needs. AI analyzes your fit instantly.', icon: Users, color: '#00D4FF' },
    { step: '02', title: 'Discover Grants', desc: 'AI scans Grants.gov in real-time and ranks opportunities by fit score.', icon: Search, color: '#00FFA3' },
    { step: '03', title: 'Check Eligibility', desc: 'AI cross-references requirements against your profile with confidence scoring.', icon: CheckCircle, color: '#7C3AED' },
    { step: '04', title: 'Generate Proposal', desc: 'AI writes tailored narratives using funder priorities and your impact data.', icon: PenTool, color: '#F59E0B' },
    { step: '05', title: 'Validate Compliance', desc: 'Word counts, budgets, documents — everything checked before submission.', icon: ShieldCheck, color: '#F43F5E' },
    { step: '06', title: 'Simulate Review', desc: 'AI reviewer scores your proposal before real reviewers see it.', icon: Bot, color: '#00D4FF' },
];

const features = [
    { title: 'Multi-Agent AI', desc: '7 specialized agents handle every aspect of the grant lifecycle autonomously.', icon: Bot },
    { title: 'Real-time Discovery', desc: 'Connected to Grants.gov API for live federal grant opportunities.', icon: Search },
    { title: 'Intelligent Matching', desc: 'Vector-powered fit scoring matches your profile to the right grants.', icon: Star },
    { title: 'Compliance Guard', desc: 'Never miss a requirement. AI validates every rule before submission.', icon: ShieldCheck },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center">
                            <Zap className="w-4 h-4 text-background" />
                        </div>
                        <span className="text-lg font-bold">Grant<span className="text-accent-cyan">Agent</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/auth" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Log in</Link>
                        <Link href="/auth">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-5 py-2 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-green text-background text-sm font-semibold hover:shadow-lg hover:shadow-accent-cyan/20 transition-all"
                            >
                                Get Started
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-mesh" />
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent-cyan/5 blur-[120px]" />
                <div className="absolute top-40 left-1/4 w-[400px] h-[400px] rounded-full bg-accent-purple/5 blur-[100px]" />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 mb-8"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
                        <span className="text-xs font-medium text-accent-cyan">AI-Native Funding Operating System</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
                    >
                        Your AI{' '}
                        <span className="gradient-text-cyan">Grant Officer</span>
                        <br />
                        for Founders
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Stop spending months on grant applications. GrantAgent discovers, writes, validates, and prepares
                        your funding applications — autonomously.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex items-center justify-center gap-4"
                    >
                        <Link href="/dashboard">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-accent-cyan to-accent-green text-background font-semibold text-base hover:shadow-xl hover:shadow-accent-cyan/20 transition-all flex items-center gap-2"
                            >
                                Launch Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </Link>
                        <Link href="/onboard">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-8 py-3.5 rounded-2xl border border-border text-text-primary font-semibold text-base hover:bg-surface-hover transition-all"
                            >
                                Start Onboarding
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Problem Stats */}
            <section className="py-20 px-6 border-t border-border">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">The Grant Funding Problem</h2>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                            Billions in non-dilutive funding go unclaimed because the application process is brutally complex.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card p-6 text-center"
                                >
                                    <Icon className="w-6 h-6 text-accent-cyan mx-auto mb-3" />
                                    <div className="text-2xl md:text-3xl font-bold gradient-text-cyan mb-2">{stat.value}</div>
                                    <p className="text-sm text-text-muted">{stat.label}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Workflow */}
            <section className="py-20 px-6 border-t border-border">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            From Profile to Submission in <span className="gradient-text-cyan">6 Steps</span>
                        </h2>
                        <p className="text-text-secondary text-lg">AI handles every stage. You just review and approve.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workflow.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08 }}
                                    className="glass-card glass-card-hover p-6 relative"
                                >
                                    <div className="text-5xl font-black text-white/[0.03] absolute top-4 right-4">{step.step}</div>
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                        style={{ backgroundColor: `${step.color}15` }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: step.color }} />
                                    </div>
                                    <h3 className="text-base font-semibold text-text-primary mb-2">{step.title}</h3>
                                    <p className="text-sm text-text-muted leading-relaxed">{step.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6 border-t border-border">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feat, i) => {
                            const Icon = feat.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card glass-card-hover p-6 flex items-start gap-4"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-5 h-5 text-accent-purple" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-text-primary mb-1">{feat.title}</h3>
                                        <p className="text-sm text-text-muted">{feat.desc}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 border-t border-border relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-mesh" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-accent-cyan/5 blur-[120px]" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center relative z-10"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Ready to unlock your <span className="gradient-text-cyan">funding potential</span>?
                    </h2>
                    <p className="text-lg text-text-secondary mb-8">
                        Join founders who are letting AI handle the heavy lifting of grant applications.
                    </p>
                    <Link href="/onboard">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-accent-cyan to-accent-green text-background font-bold text-lg hover:shadow-xl hover:shadow-accent-cyan/20 transition-all inline-flex items-center gap-2"
                        >
                            Get Started Free
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-border">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-accent-cyan" />
                        <span className="text-sm font-semibold">GrantAgent</span>
                    </div>
                    <p className="text-xs text-text-muted">© 2026 GrantAgent. AI-native funding operating system.</p>
                </div>
            </footer>
        </div>
    );
}
