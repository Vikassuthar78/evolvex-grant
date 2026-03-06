'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Pencil, Trash2, X, Search, DollarSign, Tag, Globe, Database, RefreshCw, ExternalLink } from 'lucide-react';
import api from '@/services/api';

interface GrantRow {
    id: string;
    title: string;
    funder: string;
    amount: number;
    description: string;
    category: string;
    keywords: string[] | string;
    eligibility: string | string[];
    created_at: string;
    source_url?: string;
    deadline?: string;
}

const emptyForm = { title: '', funder: '', amount: 0, description: '', category: '', keywords: '', eligibility: '' };

export default function AdminGrantsPage() {
    const [grants, setGrants] = useState<GrantRow[]>([]);
    const [liveGrants, setLiveGrants] = useState<GrantRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [liveLoading, setLiveLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'db' | 'live'>('db');

    const fetchGrants = async () => {
        try {
            const { data } = await api.get('/api/admin/grants');
            if (data.success) setGrants(data.grants || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchLiveGrants = async () => {
        setLiveLoading(true);
        try {
            const { data } = await api.get('/api/admin/grants', { params: { source: 'live' } });
            if (data.success) setLiveGrants(data.grants || []);
        } catch (err) { console.error(err); }
        finally { setLiveLoading(false); }
    };

    useEffect(() => { fetchGrants(); }, []);
    useEffect(() => { if (activeTab === 'live' && liveGrants.length === 0) fetchLiveGrants(); }, [activeTab]);

    const currentGrants = activeTab === 'live' ? liveGrants : grants;
    const filtered = currentGrants.filter(g =>
        !query || g.title?.toLowerCase().includes(query.toLowerCase()) || g.funder?.toLowerCase().includes(query.toLowerCase()) || g.category?.toLowerCase().includes(query.toLowerCase())
    );

    const openAdd = () => {
        setEditId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (g: GrantRow) => {
        setEditId(g.id);
        setForm({
            title: g.title || '',
            funder: g.funder || '',
            amount: g.amount || 0,
            description: g.description || '',
            category: g.category || '',
            keywords: Array.isArray(g.keywords) ? g.keywords.join(', ') : (g.keywords || ''),
            eligibility: typeof g.eligibility === 'string' ? g.eligibility : '',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = {
            ...form,
            amount: Number(form.amount) || 0,
            keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
        };
        try {
            if (editId) {
                await api.put(`/api/admin/grants/${editId}`, payload);
            } else {
                await api.post('/api/admin/grants', payload);
            }
            setShowModal(false);
            setForm(emptyForm);
            setEditId(null);
            await fetchGrants();
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this grant? This cannot be undone.')) return;
        try {
            await api.delete(`/api/admin/grants/${id}`);
            await fetchGrants();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Grants Management</h1>
                    <p className="text-sm text-text-muted mt-1">Database grants & live Grants.gov feed</p>
                </div>
                <div className="flex items-center gap-2">
                    {activeTab === 'live' && (
                        <button onClick={fetchLiveGrants} disabled={liveLoading} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm text-text-secondary hover:border-border-bright transition-all">
                            <RefreshCw className={`w-4 h-4 ${liveLoading ? 'animate-spin' : ''}`} /> Refresh
                        </button>
                    )}
                    {activeTab === 'db' && (
                        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan text-background font-semibold text-sm hover:shadow-lg hover:shadow-accent-purple/20 transition-all">
                            <Plus className="w-4 h-4" /> Add Grant
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-surface rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('db')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'db' ? 'bg-accent-purple/10 text-accent-purple' : 'text-text-muted hover:text-text-secondary'}`}
                >
                    <Database className="w-3.5 h-3.5" /> Database ({grants.length})
                </button>
                <button
                    onClick={() => setActiveTab('live')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'live' ? 'bg-accent-green/10 text-accent-green' : 'text-text-muted hover:text-text-secondary'}`}
                >
                    <Globe className="w-3.5 h-3.5" /> Grants.gov Live {liveGrants.length > 0 && `(${liveGrants.length})`}
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search grants..."
                    className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 transition-all" />
            </div>

            {/* Table */}
            {(activeTab === 'db' && loading) || (activeTab === 'live' && liveLoading) ? (
                <div className="glass-card p-8 flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-6 h-6 text-accent-cyan animate-spin" />
                    <p className="text-sm text-text-muted">{activeTab === 'live' ? 'Fetching from Grants.gov...' : 'Loading grants...'}</p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Title</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Funder</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Amount</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">{activeTab === 'live' ? 'Deadline' : 'Category'}</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((g, i) => (
                                    <motion.tr
                                        key={g.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activeTab === 'live' ? 'bg-accent-green/10' : 'bg-accent-purple/10'}`}>
                                                    {activeTab === 'live' ? <Globe className="w-4 h-4 text-accent-green" /> : <FileText className="w-4 h-4 text-accent-purple" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-sm font-medium text-text-primary block truncate max-w-xs">{g.title}</span>
                                                    {activeTab === 'live' && <span className="text-[10px] text-text-muted">{g.category || 'Federal'}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-text-secondary">{g.funder}</td>
                                        <td className="px-4 py-3 text-sm text-accent-green font-medium">${(g.amount || 0).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            {activeTab === 'live'
                                                ? <span className="text-xs text-text-secondary">{g.deadline || 'Open'}</span>
                                                : <span className="px-2 py-0.5 rounded-md bg-surface border border-border text-xs text-text-muted">{g.category || '—'}</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {activeTab === 'live' ? (
                                                <a href={g.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent-green/10 text-accent-green text-xs font-medium hover:bg-accent-green/20 transition-colors">
                                                    <ExternalLink className="w-3 h-3" /> View
                                                </a>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg hover:bg-accent-cyan/10 text-text-muted hover:text-accent-cyan transition-colors">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(g.id)} className="p-1.5 rounded-lg hover:bg-accent-rose/10 text-text-muted hover:text-accent-rose transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filtered.length === 0 && (
                        <div className="p-12 text-center">
                            <FileText className="w-10 h-10 text-text-muted mx-auto mb-3" />
                            <p className="text-sm text-text-muted">No grants found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add / Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            className="relative w-full max-w-lg bg-background border border-border rounded-2xl p-6 space-y-4 shadow-2xl"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-text-primary">{editId ? 'Edit Grant' : 'Add New Grant'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-text-secondary mb-1 block">Title</label>
                                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-text-secondary mb-1 block">Funder</label>
                                        <input value={form.funder} onChange={e => setForm({ ...form, funder: e.target.value })} className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-text-secondary mb-1 block">Amount ($)</label>
                                        <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-text-secondary mb-1 block">Description</label>
                                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-text-secondary mb-1 block">Category</label>
                                        <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-text-secondary mb-1 block">Eligibility</label>
                                        <input value={form.eligibility} onChange={e => setForm({ ...form, eligibility: e.target.value })} className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-text-secondary mb-1 block">Keywords (comma-separated)</label>
                                    <input value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} placeholder="AI, healthcare, climate..." className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 transition-all" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-hover transition-all">Cancel</button>
                                <button onClick={handleSave} disabled={saving || !form.title} className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan text-background font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                                    {saving ? <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" /> : null}
                                    {editId ? 'Save Changes' : 'Add Grant'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
