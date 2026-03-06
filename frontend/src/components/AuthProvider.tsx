'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'founder' | 'admin';

interface User {
    id: string;
    email: string;
    name?: string;
    organizationId?: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    role: UserRole | null;
    login: (email: string, password: string) => Promise<{ error?: string }>;
    signUp: (email: string, password: string, role?: UserRole) => Promise<{ error?: string }>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/', '/landing', '/auth', '/onboard'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchProfile = useCallback(async (supaUser: SupabaseUser): Promise<User | null> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role, org_id')
                .eq('id', supaUser.id)
                .single();

            if (error || !data) {
                // Profile may not exist yet — try to create one (table might not exist, so silently skip)
                try {
                    await supabase
                        .from('profiles')
                        .insert({ id: supaUser.id, email: supaUser.email, role: 'founder' });
                } catch {
                    // profiles table may not exist — that's OK, continue with defaults
                }
                return {
                    id: supaUser.id,
                    email: supaUser.email || '',
                    name: supaUser.email?.split('@')[0],
                    role: 'founder',
                };
            }

            // Restore org_id to localStorage if stored in profile
            if (data.org_id) {
                localStorage.setItem('org_id', data.org_id);
            }

            return {
                id: supaUser.id,
                email: supaUser.email || '',
                name: supaUser.email?.split('@')[0],
                role: (data.role as UserRole) || 'founder',
                organizationId: data.org_id || undefined,
            };
        } catch {
            return null;
        }
    }, []);

    // Initialize auth state from Supabase session
    useEffect(() => {
        const initSession = async () => {
            try {
                // Check for built-in admin session
                const savedAdmin = localStorage.getItem('grantagent_admin');
                if (savedAdmin === 'true') {
                    setUser({ id: 'admin-builtin', email: 'admin@grantagent.com', name: 'Admin', role: 'admin' });
                    setRole('admin');
                    setIsLoading(false);
                    return;
                }

                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const profile = await fetchProfile(session.user);
                    if (profile) {
                        setUser(profile);
                        setRole(profile.role);
                        // Store token for API interceptor
                        localStorage.setItem('token', session.access_token);
                    }
                }
            } catch (err) {
                console.error('Session init error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        initSession();

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                const profile = await fetchProfile(session.user);
                if (profile) {
                    setUser(profile);
                    setRole(profile.role);
                    localStorage.setItem('token', session.access_token);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setRole(null);
                localStorage.removeItem('token');
            }
        });

        return () => { subscription.unsubscribe(); };
    }, [fetchProfile]);

    // Route protection
    useEffect(() => {
        if (!isLoading) {
            const isPublic = PUBLIC_ROUTES.includes(pathname);
            const isAdminRoute = pathname.startsWith('/admin');
            const hasOrg = typeof window !== 'undefined' && !!localStorage.getItem('org_id');

            if (!user && !isPublic) {
                router.push('/auth');
            } else if (user && (pathname === '/auth' || pathname === '/')) {
                // Redirect based on role
                if (user.role === 'admin') {
                    router.push('/admin/dashboard');
                } else if (!hasOrg) {
                    // New founder without org → must onboard first
                    router.push('/onboard');
                } else {
                    router.push('/dashboard');
                }
            } else if (user && user.role === 'founder' && !hasOrg && pathname !== '/onboard') {
                // Founder without org trying to access any page → redirect to onboard
                router.push('/onboard');
            } else if (user && isAdminRoute && user.role !== 'admin') {
                // Non-admin trying to access admin routes
                router.push('/dashboard');
            }
        }
    }, [user, isLoading, pathname, router]);

    const login = async (email: string, password: string): Promise<{ error?: string }> => {
        // Built-in admin account
        if (email === 'admin@grantagent.com' && password === 'admin@123') {
            const adminUser: User = {
                id: 'admin-builtin',
                email: 'admin@grantagent.com',
                name: 'Admin',
                role: 'admin',
            };
            setUser(adminUser);
            setRole('admin');
            localStorage.setItem('token', 'admin-token');
            localStorage.setItem('grantagent_admin', 'true');
            return {};
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        return {};
    };

    const signUp = async (email: string, password: string, selectedRole: UserRole = 'founder'): Promise<{ error?: string }> => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { error: error.message };

        // Insert profile with chosen role
        if (data.user) {
            const { error: profileErr } = await supabase
                .from('profiles')
                .insert({ id: data.user.id, email, role: selectedRole });
            if (profileErr) console.error('Profile creation error:', profileErr);
        }

        return {};
    };

    const logout = async () => {
        // Clear all storage first before any async calls
        localStorage.removeItem('token');
        localStorage.removeItem('grantagent_user');
        localStorage.removeItem('grantagent_onboarding_data');
        localStorage.removeItem('grantagent_admin');
        localStorage.removeItem('org_id');
        
        // Clear state
        setUser(null);
        setRole(null);

        // Sign out from Supabase if there's a session
        try { await supabase.auth.signOut(); } catch {}

        // Navigate after cleanup
        window.location.href = '/landing';
    };

    return (
        <AuthContext.Provider value={{ user, role, login, signUp, logout, isLoading }}>
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
