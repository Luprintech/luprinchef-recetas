import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

export const authConfig: NextAuthConfig = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/',
    },
    callbacks: {
        jwt({ token, account }) {
            if (account?.providerAccountId) {
                token.userId = account.providerAccountId;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user && token.userId) {
                session.user.id = token.userId as string;
            }
            return session;
        },
    },
};
