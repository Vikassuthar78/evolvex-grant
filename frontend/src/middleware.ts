import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const PUBLIC_ROUTES = ['/', '/landing', '/auth', '/onboard'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip public routes and static assets
    if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // Check for Supabase auth tokens in cookies
    const supabaseRef = (supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/) || [])[1] || '';
    const accessToken = request.cookies.get(`sb-${supabaseRef}-auth-token`)?.value;

    if (!accessToken) {
        // No auth cookie — let client-side AuthProvider handle redirect
        return NextResponse.next();
    }

    // For admin routes, verify role via Supabase
    if (pathname.startsWith('/admin')) {
        try {
            const supabase = createClient(supabaseUrl, supabaseAnonKey);
            const { data: { user } } = await supabase.auth.getUser(accessToken);

            if (!user) {
                return NextResponse.redirect(new URL('/auth', request.url));
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (!profile || profile.role !== 'admin') {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        } catch {
            // On error, let client-side handle it
            return NextResponse.next();
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
