'use client';

export default function LoadingSkeleton({ rows = 3, type = 'card' }: { rows?: number; type?: 'card' | 'table' | 'text' }) {
    if (type === 'card') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="glass-card p-5 space-y-3 animate-pulse">
                        <div className="h-3 bg-surface-hover rounded w-1/3" />
                        <div className="h-5 bg-surface-hover rounded w-2/3" />
                        <div className="h-3 bg-surface-hover rounded w-full" />
                        <div className="h-3 bg-surface-hover rounded w-4/5" />
                        <div className="flex gap-2 pt-2">
                            <div className="h-6 bg-surface-hover rounded w-16" />
                            <div className="h-6 bg-surface-hover rounded w-16" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'table') {
        return (
            <div className="space-y-2 animate-pulse">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-surface">
                        <div className="h-4 bg-surface-hover rounded w-1/4" />
                        <div className="h-4 bg-surface-hover rounded w-1/6" />
                        <div className="h-4 bg-surface-hover rounded w-1/6" />
                        <div className="h-4 bg-surface-hover rounded w-1/4" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3 animate-pulse">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="h-4 bg-surface-hover rounded" style={{ width: `${80 - i * 15}%` }} />
            ))}
        </div>
    );
}
