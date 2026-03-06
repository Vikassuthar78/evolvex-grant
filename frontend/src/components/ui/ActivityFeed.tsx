'use client';

import { motion } from 'framer-motion';
import { ActivityItem } from '@/types';
import { Bot, Search, FileText, ShieldCheck, CheckCircle, Wand2 } from 'lucide-react';

const agentIcons: Record<string, React.ElementType> = {
    'Narrative Agent': Wand2,
    'Compliance Guard': ShieldCheck,
    'Discovery Agent': Search,
    'Eligibility Agent': CheckCircle,
    'Reviewer Simulator': Bot,
    'Auto-Fill Agent': FileText,
};

const agentColors: Record<string, string> = {
    'Narrative Agent': '#7C3AED',
    'Compliance Guard': '#F59E0B',
    'Discovery Agent': '#00D4FF',
    'Eligibility Agent': '#00FFA3',
    'Reviewer Simulator': '#F43F5E',
    'Auto-Fill Agent': '#94A3B8',
};

interface ActivityFeedProps {
    items: ActivityItem[];
}

export default function ActivityFeed({ items }: ActivityFeedProps) {
    return (
        <div className="space-y-3">
            {items.map((item, i) => {
                const Icon = agentIcons[item.agent] || Bot;
                const color = agentColors[item.agent] || '#94A3B8';

                return (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors"
                    >
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${color}15` }}
                        >
                            <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-text-primary">{item.action}</span>
                                <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded-md bg-surface-hover">{item.agent}</span>
                            </div>
                            <p className="text-xs text-text-muted mt-0.5 truncate">{item.details}</p>
                        </div>
                        <span className="text-[11px] text-text-muted whitespace-nowrap flex-shrink-0">{item.timestamp}</span>
                    </motion.div>
                );
            })}
        </div>
    );
}
