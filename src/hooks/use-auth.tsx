'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function useAuth() {
    const { data: session, status } = useSession();
    return {
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
        isLoading: status === 'loading',
        signIn: () => signIn('google'),
        signOut: () => signOut(),
    };
}
