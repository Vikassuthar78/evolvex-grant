'use client';

import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 ml-[260px] transition-all duration-300">
                <Topbar />
                <main className="p-6 bg-gradient-mesh min-h-[calc(100vh-64px)]">
                    {children}
                </main>
            </div>
        </div>
    );
}
