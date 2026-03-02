import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { upsertUser } from '@/db/queries/users';

export const { auth, handlers, signIn, signOut } = NextAuth({
    ...authConfig,
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account }) {
            if (account?.providerAccountId && user.email) {
                upsertUser({
                    id: account.providerAccountId,
                    email: user.email,
                    name: user.name ?? null,
                    image: user.image ?? null,
                });
            }
            return true;
        },
    },
});
