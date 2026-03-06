'use client';

import { use, useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { mockProposalQuestions } from '@/lib/mock-data';
import { grantsService, narrativeService, applicationsService, autofillService } from '@/services';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, RefreshCw, CheckCircle, Edit3, ArrowLeft,
    Wand2, ChevronDown, ChevronUp, Copy, Check, Loader2, Save, Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const toneOptions = ['professional', 'compelling', 'technical', 'narrative'];

export default function ProposalStudioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params); // this is now application_id
    const router = useRouter();
    const [grant, setGrant] = useState<any>(null);
    const [application, setApplication] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [questions, setQuestions] = useState(mockProposalQuestions);
    const [activeQuestion, setActiveQuestion] = useState(questions[0].id);
    const [regenerating, setRegenerating] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState<'narrative' | 'autofill'>('narrative');
    const [autofillFields, setAutofillFields] = useState<any[]>([]);
    const [autofillLoading, setAutofillLoading] = useState(false);
    const [autofillStats, setAutofillStats] = useState<{ filled: number; total: number } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch application state
                const appRes = await applicationsService.getById(id);
                if (appRes && appRes.data) {
                    const appData = appRes.data;
                    setApplication(appData);

                    // Fetch associated grant
                    const grantRes = await grantsService.getById(appData.grant_id);
                    setGrant(grantRes);

                    // Populate inputs with existing DRAFT data if available
                    if (appData.narrative || appData.form_data) {
                        setQuestions(qs => qs.map(q => {
                            if (q.id === 'pq-1' && appData.narrative) return { ...q, answer: appData.narrative };
                            if (q.id === 'pq-2' && appData.form_data?.impact_statement) return { ...q, answer: appData.form_data.impact_statement };
                            if (q.id === 'pq-3' && appData.form_data?.budget_justification) return { ...q, answer: appData.form_data.budget_justification };
                            return q;
                        }));
                    }
                }
            } catch (err) {
                console.error("Fetch data error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const activeQ = questions.find(q => q.id === activeQuestion) || questions[0];

    const handleRegenerate = async (qId: string) => {
        // We will do a full application generation to demonstrate the backend-2 capabilities
        setRegenerating(qId);
        try {
            const orgId = localStorage.getItem('org_id');
            if (!orgId || !grant) return;

            const res = await narrativeService.generateFull({
                org_id: orgId,
                grant_id: grant.id,
                grant_title: grant.title,
                funder_name: grant.funder,
                funder_priorities: grant.description
            });

            if (res && res.success) {
                setQuestions(qs => qs.map(q => {
                    if (q.id === 'pq-1') return { ...q, answer: res.narrative, status: 'edited' as const };
                    if (q.id === 'pq-2') return { ...q, answer: res.impact_statement, status: 'edited' as const };
                    if (q.id === 'pq-3') return { ...q, answer: res.budget_justification, status: 'edited' as const };
                    return q;
                }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setRegenerating(null);
        }
    };

    const handleApprove = (qId: string) => {
        setQuestions(qs => qs.map(q => q.id === qId ? { ...q, status: 'approved' as const } : q));
    };

    const handleCopy = (text: string, qId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(qId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleToneChange = (qId: string, tone: string) => {
        setQuestions(qs => qs.map(q => q.id === qId ? { ...q, tone: tone as typeof q.tone } : q));
        handleRegenerate(qId);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);
        try {
            const narrative = questions.find(q => q.id === 'pq-1')?.answer || '';
            const impact = questions.find(q => q.id === 'pq-2')?.answer || '';
            const budget = questions.find(q => q.id === 'pq-3')?.answer || '';
            await applicationsService.update(id, {
                narrative,
                form_data: { impact_statement: impact, budget_justification: budget }
            });
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error('Save error:', err);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this draft? This cannot be undone.')) return;
        setIsDeleting(true);
        try {
            await applicationsService.delete(id);
            router.push('/applications');
        } catch (err: any) {
            const msg = err?.response?.data?.detail || 'Only DRAFT applications can be deleted.';
            alert(msg);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleLoadAutofill = async () => {
        const orgId = localStorage.getItem('org_id');
        if (!orgId) return;
        setAutofillLoading(true);
        try {
            const res = await autofillService.getMockForm(orgId);
            if (res?.success) {
                setAutofillFields(res.filled_fields || []);
                setAutofillStats({ filled: res.auto_filled || 0, total: res.total_fields || 0 });
            }
        } catch (err) {
            console.error('Autofill error:', err);
        } finally {
            setAutofillLoading(false);
        }
    };

    return (
        <AppLayout>
            {isLoading || !grant ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <Loader2 className="w-8 h-8 text-accent-cyan animate-spin mb-4" />
                    <h3 className="text-base font-semibold text-text-primary">Loading Proposal Studio...</h3>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Link href={`/grant/${grant.id}`} className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors mb-2">
                                <ArrowLeft className="w-3 h-3" /> Back to Grant
                            </Link>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Wand2 className="w-6 h-6 text-accent-purple" /> Proposal Studio
                            </h1>
                            <p className="text-sm text-text-secondary mt-1">{grant.title}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-text-muted">
                                {questions.filter(q => q.status === 'approved').length}/{questions.length} approved
                            </span>
                            {saveStatus === 'saved' && (
                                <span className="text-xs text-accent-green flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Saved</span>
                            )}
                            {saveStatus === 'error' && (
                                <span className="text-xs text-accent-rose">Save failed</span>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2.5 rounded-xl border border-border text-text-secondary text-sm font-medium flex items-center gap-2 hover:bg-surface-hover transition-all disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Draft
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2.5 rounded-xl border border-accent-rose/30 text-accent-rose text-sm font-medium flex items-center gap-2 hover:bg-accent-rose/10 transition-all disabled:opacity-50"
                            >
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Delete
                            </motion.button>
                            <Link href="/compliance">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-green text-background text-sm font-semibold"
                                >
                                    Run Compliance Check
                                </motion.button>
                            </Link>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('narrative')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'narrative' ? 'bg-accent-purple/10 text-accent-purple border border-accent-purple/30' : 'bg-surface border border-border text-text-muted hover:text-text-secondary'}`}
                        >
                            <Wand2 className="w-3.5 h-3.5 inline mr-1.5" />Narrative Editor
                        </button>
                        <button
                            onClick={() => { setActiveTab('autofill'); if (autofillFields.length === 0) handleLoadAutofill(); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'autofill' ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30' : 'bg-surface border border-border text-text-muted hover:text-text-secondary'}`}
                        >
                            <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />Auto-Fill Form
                        </button>
                    </div>

                    {activeTab === 'autofill' ? (
                        <div className="glass-card p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold">Form Auto-Fill</h2>
                                    <p className="text-sm text-text-muted mt-1">Fields pre-populated from your organization profile</p>
                                </div>
                                {autofillStats && (
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-accent-green">{autofillStats.filled}</span>
                                        <span className="text-sm text-text-muted">/{autofillStats.total} auto-filled</span>
                                    </div>
                                )}
                            </div>
                            {autofillLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 text-accent-cyan animate-spin" />
                                    <span className="ml-2 text-sm text-text-muted">Loading form fields...</span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {autofillFields.map((field: any, i: number) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${field.auto_filled ? 'bg-accent-green/10' : 'bg-accent-amber/10'}`}>
                                                {field.auto_filled ? <CheckCircle className="w-3 h-3 text-accent-green" /> : <Edit3 className="w-3 h-3 text-accent-amber" />}
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs font-medium text-text-muted">{field.field_name}</label>
                                                <input
                                                    type="text"
                                                    defaultValue={field.filled_value || ''}
                                                    placeholder={field.auto_filled ? '' : 'Needs manual entry'}
                                                    className="w-full mt-1 bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                    <>
                    {/* Split Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Questions List */}
                        <div className="lg:col-span-4 space-y-2">
                            {questions.map((q, i) => (
                                <motion.button
                                    key={q.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setActiveQuestion(q.id)}
                                    className={`w-full text-left p-4 rounded-xl transition-all border ${activeQuestion === q.id
                                        ? 'glass-card border-accent-cyan/30 bg-accent-cyan/5'
                                        : 'bg-surface border-border hover:border-border-bright'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-medium text-text-primary line-clamp-2">{q.question}</p>
                                        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${q.status === 'approved' ? 'bg-accent-green/10' :
                                            q.status === 'edited' ? 'bg-accent-amber/10' : 'bg-surface-hover'
                                            }`}>
                                            {q.status === 'approved' ? <CheckCircle className="w-3 h-3 text-accent-green" /> :
                                                q.status === 'edited' ? <Edit3 className="w-3 h-3 text-accent-amber" /> :
                                                    <div className="w-2 h-2 rounded-full bg-text-muted" />}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[11px] text-text-muted">{q.wordCount}/{q.maxWords} words</span>
                                        <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${q.tone === 'professional' ? 'bg-accent-cyan/10 text-accent-cyan' :
                                            q.tone === 'compelling' ? 'bg-accent-green/10 text-accent-green' :
                                                q.tone === 'technical' ? 'bg-accent-purple/10 text-accent-purple' :
                                                    'bg-accent-amber/10 text-accent-amber'
                                            }`}>{q.tone}</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Answer Editor */}
                        <div className="lg:col-span-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeQ.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="glass-card p-6 space-y-4"
                                >
                                    <h2 className="text-base font-semibold text-text-primary">{activeQ.question}</h2>

                                    {/* Tone Control */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-text-muted">Tone:</span>
                                        {toneOptions.map(tone => (
                                            <button
                                                key={tone}
                                                onClick={() => handleToneChange(activeQ.id, tone)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${activeQ.tone === tone
                                                    ? 'bg-accent-purple/10 border-accent-purple/30 text-accent-purple'
                                                    : 'bg-surface border-border text-text-muted hover:text-text-secondary'
                                                    }`}
                                            >
                                                {tone}
                                            </button>
                                        ))}
                                    </div>

                                    {/* AI Generated Answer */}
                                    <div className="relative">
                                        {regenerating === activeQ.id && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="absolute inset-0 bg-surface/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10"
                                            >
                                                <div className="flex items-center gap-2 text-accent-cyan">
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                    <span className="text-sm font-medium">Regenerating...</span>
                                                </div>
                                            </motion.div>
                                        )}
                                        <textarea
                                            value={activeQ.answer}
                                            onChange={e => setQuestions(qs => qs.map(q => q.id === activeQ.id ? { ...q, answer: e.target.value, status: 'edited' as const, wordCount: e.target.value.split(/\s+/).filter(Boolean).length } : q))}
                                            rows={10}
                                            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary leading-relaxed focus:outline-none focus:border-accent-cyan/50 transition-all resize-none"
                                        />
                                    </div>

                                    {/* Word Count & Actions */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-xs text-text-muted">
                                            <span className={activeQ.wordCount > activeQ.maxWords ? 'text-accent-rose' : ''}>
                                                {activeQ.wordCount} / {activeQ.maxWords} words
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-md border ${activeQ.status === 'approved' ? 'text-accent-green border-accent-green/30 bg-accent-green/10' :
                                                activeQ.status === 'edited' ? 'text-accent-amber border-accent-amber/30 bg-accent-amber/10' :
                                                    'text-text-muted border-border bg-surface'
                                                }`}>{activeQ.status}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleCopy(activeQ.answer, activeQ.id)}
                                                className="p-2 rounded-lg bg-surface hover:bg-surface-hover transition-all text-text-muted hover:text-text-primary"
                                            >
                                                {copiedId === activeQ.id ? <Check className="w-4 h-4 text-accent-green" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleRegenerate(activeQ.id)}
                                                className="px-3 py-2 rounded-lg bg-surface border border-border hover:border-border-bright text-xs font-medium text-text-secondary flex items-center gap-1 hover:text-text-primary transition-all"
                                            >
                                                <RefreshCw className="w-3 h-3" /> Regenerate
                                            </button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleApprove(activeQ.id)}
                                                className="px-4 py-2 rounded-lg bg-accent-green/10 text-accent-green text-xs font-semibold flex items-center gap-1 hover:bg-accent-green/20 transition-all"
                                            >
                                                <CheckCircle className="w-3 h-3" /> Approve
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                    </>
                    )}
                </div>
            )}
        </AppLayout>
    );
}
