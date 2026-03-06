'use client';

interface ScoreBadgeProps {
    score: number;
    label: string;
    size?: 'sm' | 'md';
}

export default function ScoreBadge({ score, label, size = 'md' }: ScoreBadgeProps) {
    let className = '';
    if (score >= 85) className = 'score-excellent';
    else if (score >= 70) className = 'score-good';
    else if (score >= 50) className = 'score-moderate';
    else className = 'score-low';

    const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

    return (
        <span className={`inline-flex items-center gap-1 rounded-lg border font-semibold tabular-nums ${className} ${padding}`}>
            {score}%
            <span className="font-normal">{label}</span>
        </span>
    );
}
