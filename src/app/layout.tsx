import type { Metadata } from 'next';
import '@/app/globals.css';
import Link from 'next/link';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { SessionProvider } from 'next-auth/react';
import { CookieConsent } from '@/components/cookie-consent';

export const metadata: Metadata = {
    title: 'Cocina con Luprinchef',
    description: 'Genera recetas deliciosas con lo que tienes en tu nevera.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#09090b" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="Luprinchef" />
                <link rel="apple-touch-icon" href="/icons/icon-192.png" />
            </head>
            <body className="font-body antialiased">
                <SessionProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        disableTransitionOnChange
                    >
                        {children}
                        <Toaster />

                        {/* Footer */}
                        <footer className="border-t mt-12 py-6 px-4">
                            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                                <span>© {new Date().getFullYear()} Cocina con Luprinchef · Powered by Guadalupe Cano</span>
                                <nav className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
                                    <Link href="/privacidad" className="hover:text-foreground transition-colors">
                                        Privacidad
                                    </Link>
                                    <span aria-hidden>·</span>
                                    <Link href="/cookies" className="hover:text-foreground transition-colors">
                                        Cookies
                                    </Link>
                                </nav>
                            </div>
                        </footer>

                        <CookieConsent />
                    </ThemeProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
