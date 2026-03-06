'use client';

import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoadingState({ message = "Loading..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-accent-cyan/10 text-accent-cyan"
            >
                <Loader2 className="w-8 h-8 animate-spin" />
            </motion.div>
            <p className="text-sm font-medium text-text-secondary animate-pulse">{message}</p>
        </div>
    );
}
