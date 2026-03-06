'use client';

import { motion } from 'framer-motion';

interface ComplianceMeterProps {
    score: number;
    size?: number;
}

export default function ComplianceMeter({ score, size = 160 }: ComplianceMeterProps) {
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;

    let color = '#F43F5E';
    if (score >= 80) color = '#00FFA3';
    else if (score >= 60) color = '#00D4FF';
    else if (score >= 40) color = '#F59E0B';

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="8"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - progress }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold" style={{ color }}>{score}</span>
                <span className="text-xs text-text-muted">/ 100</span>
            </div>
        </div>
    );
}
