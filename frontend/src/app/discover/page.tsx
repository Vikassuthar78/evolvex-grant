'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import GrantCard from '@/components/ui/GrantCard';
import { grantsService } from '@/services';
import { Grant } from '@/types';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Sparkles, Loader2 } from 'lucide-react';

const sortOptions = ['Fit Score', 'Deadline', 'Amount', 'Probability'];

export default function DiscoverPage() {
    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('Fit Score');

    const [grants, setGrants] = useState<Grant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // Compute unique categories from actual grants data
    const categories = ['All', ...Array.from(new Set(grants.map(g => g.category).filter(Boolean))).sort()];
    useEffect(() => {
        const fetchGrants = async () => {
            const orgId = localStorage.getItem('org_id');

            // First load: show DB grants scored against org profile (fast)
            try {
                const dbData = await grantsService.getAll(orgId || undefined);
                if (dbData?.grants?.length) {
                    // Map DB fields to frontend format
                    const mapped = dbData.grants.map((g: any) => {
                        const rawAmount = g.amount;
                        let amount = 0;
                        if (typeof rawAmount === 'number') amount = rawAmount;
                        else if (typeof rawAmount === 'string') {
                            const nums = rawAmount.match(/[\d,]+/g);
                            if (nums) amount = Math.max(...nums.map((n: string) => parseInt(n.replace(/,/g, ''), 10) || 0));
                        }
                        return {
                            ...g,
                            amount,
                            fitScore: g.fitScore ?? g.fit_score ?? 0,
                            probabilityScore: g.probabilityScore ?? Math.round((g.fitScore ?? g.fit_score ?? 0) * 0.85 * 10) / 10,
                            status: g.status || 'open',
                            description: g.description || g.title || '',
                            eligibility: Array.isArray(g.eligibility) ? g.eligibility : typeof g.eligibility === 'string' && g.eligibility ? [g.eligibility] : [],
                            keywords: Array.isArray(g.keywords) ? g.keywords : typeof g.keywords === 'string' ? g.keywords.split(/[,\s]+/).filter(Boolean) : [],
                            category: g.category || 'Federal',
                            funder: g.funder || 'Federal Agency',
                        };
                    });
                    setGrants(mapped);
                    setIsLoading(false);
                }
            } catch {
                // DB fetch failed, continue to discover
            }

            // Then discover fresh grants from Grants.gov (slow but live)
            if (orgId) {
                try {
                    const data = await grantsService.discover({ org_id: orgId, limit: 15 });
                    if (data?.grants?.length) {
                        // Merge: discover results first, then DB grants not in discover
                        setGrants(prev => {
                            const discoverTitles = new Set(data.grants.map((g: any) => g.title));
                            const uniqueDb = prev.filter(g => !discoverTitles.has(g.title));
                            return [...data.grants, ...uniqueDb];
                        });
                    }
                } catch (error) {
                    console.error("Discovery failed, using cached grants", error);
                }
            }

            setIsLoading(false);
        };
        fetchGrants();
    }, []);

    const filtered = grants
        .filter(g => {
            const kw: string[] = Array.isArray(g.keywords) ? g.keywords : typeof g.keywords === 'string' ? (g.keywords as string).split(/[,\s]+/).filter(Boolean) : [];
            const matchesQuery = !query || g.title.toLowerCase().includes(query.toLowerCase()) || g.funder.toLowerCase().includes(query.toLowerCase()) || kw.some((k: string) => k.toLowerCase().includes(query.toLowerCase()));
            const cat = selectedCategory.toLowerCase();
            const gCat = (g.category || '').toLowerCase();
            const gTitle = (g.title || '').toLowerCase();
            const gDesc = (g.description || '').toLowerCase();
            const gKw = kw.map((k: string) => k.toLowerCase()).join(' ');
            const matchesCategory = selectedCategory === 'All' || gCat === cat || gCat.includes(cat) || cat.includes(gCat) || gTitle.includes(cat) || gDesc.includes(cat) || gKw.includes(cat);
            return matchesQuery && matchesCategory;
        })
        .sort((a, b) => {
            if (sortBy === 'Fit Score') return b.fitScore - a.fitScore;
            if (sortBy === 'Deadline') return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            if (sortBy === 'Amount') return b.amount - a.amount;
            if (sortBy === 'Probability') return b.probabilityScore - a.probabilityScore;
            return 0;
        });

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Discover Grants</h1>
                        <p className="text-sm text-text-secondary mt-1">AI-powered grant discovery from Grants.gov</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20">
                        <Sparkles className="w-3.5 h-3.5 text-accent-green" />
                        <span className="text-xs font-medium text-accent-green">{isLoading ? 'Loading...' : `${filtered.length} grants found`}</span>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="glass-card p-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search by keyword, funder, or topic..."
                                className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-text-muted" />
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-accent-cyan/50 cursor-pointer"
                            >
                                {sortOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Category Pills */}
                    <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${selectedCategory === cat
                                    ? 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan'
                                    : 'bg-surface border-border text-text-muted hover:text-text-secondary hover:border-border-bright'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State or Grid */}
                {isLoading ? (
                    <div className="glass-card p-12 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-accent-cyan animate-spin mb-4" />
                        <h3 className="text-base font-semibold text-text-primary">Fetching optimal grants...</h3>
                        <p className="text-sm text-text-muted mt-1">Cross-referencing your profile with Grants.gov</p>
                    </div>
                ) : (
                    <>
                        {/* Grant Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map((grant, i) => (
                                <GrantCard key={grant.id} grant={grant} index={i} />
                            ))}
                        </div>

                        {filtered.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="glass-card p-12 text-center"
                            >
                                <Search className="w-10 h-10 text-text-muted mx-auto mb-3" />
                                <h3 className="text-base font-semibold text-text-primary">No grants found</h3>
                                <p className="text-sm text-text-muted mt-1">Try adjusting your search or filters</p>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
