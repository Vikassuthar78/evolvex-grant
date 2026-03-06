'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import {
    Search,
    FileText,
    Target,
    DollarSign,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
    'search': Search,
    'file-text': FileText,
    'target': Target,
    'dollar-sign': DollarSign,
};

interface KPICardProps {
    label: string;
    value: number;
    change: number;
    prefix?: string;
    suffix?: string;
    icon: string;
    index: number;
}

export default function KPICard({ label, value, change, prefix, suffix, icon, index }: KPICardProps) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (v) => {
        if (value < 10) return v.toFixed(1);
        return Math.round(v).toString();
    });

    useEffect(() => {
        const controls = animate(count, value, { duration: 1.5, delay: index * 0.1, ease: 'easeOut' });
        return controls.stop;
    }, [count, value, index]);

    const Icon = iconMap[icon] || Target;
    const isPositive = change >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="glass-card glass-card-hover p-5 flex flex-col gap-3"
        >
            <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary font-medium">{label}</span>
                <div className="w-9 h-9 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-accent-cyan" />
                </div>
            </div>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-bold tracking-tight text-text-primary">
                    {prefix}<motion.span>{rounded}</motion.span>{suffix}
                </span>
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-accent-green' : 'text-accent-rose'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{isPositive ? '+' : ''}{change}% from last month</span>
            </div>
        </motion.div>
    );
}
