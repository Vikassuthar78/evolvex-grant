'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name?: string;
    organizationId?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/', '/landing', '/auth', '/onboard'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check local storage for mock session on mount
        const storedUser = localStorage.getItem('grantagent_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!isLoading) {
            if (!user && !PUBLIC_ROUTES.includes(pathname)) {
                // Not logged in and trying to access a protected route
                router.push('/auth');
            } else if (user && (pathname === '/auth' || pathname === '/')) {
                // Logged in and trying to access auth or root
                router.push('/dashboard');
            }
        }
    }, [user, isLoading, pathname, router]);

    const login = (email: string) => {
        const mockUser = {
            id: 'user_123',
            email,
            name: email.split('@')[0],
            organizationId: 'org_123'
        };
        setUser(mockUser);
        localStorage.setItem('grantagent_user', JSON.stringify(mockUser));
        router.push('/dashboard');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('grantagent_user');
        localStorage.removeItem('grantagent_onboarding_data'); // clear onboarding data too
        router.push('/landing');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
