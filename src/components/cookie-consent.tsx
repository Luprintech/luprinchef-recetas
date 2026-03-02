'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, BarChart2, Check, X } from 'lucide-react';

const STORAGE_KEY = 'luprinchef_cookie_consent';

type ConsentValue = 'accepted' | 'rejected' | null;

export function CookieConsent() {
    const [consent, setConsent] = useState<ConsentValue>(null);
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem(STORAGE_KEY) as ConsentValue;
        setConsent(stored);
        // Auto-open on first visit
        if (!stored) {
            const timer = setTimeout(() => setOpen(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const accept = () => {
        localStorage.setItem(STORAGE_KEY, 'accepted');
        setConsent('accepted');
        setOpen(false);
    };

    const reject = () => {
        localStorage.setItem(STORAGE_KEY, 'rejected');
        setConsent('rejected');
        setOpen(false);
    };

    if (!mounted) return null;

    return (
        <>
            {/* Floating cookie button — always visible until decided */}
            {consent === null && (
                <button
                    onClick={() => setOpen(true)}
                    aria-label="Gestionar cookies"
                    className="fixed bottom-6 right-6 z-50 text-4xl drop-shadow-lg hover:scale-110 transition-transform animate-bounce"
                    title="Política de cookies"
                >
                    🍪
                </button>
            )}

            {/* Small cookie icon after decision */}
            {consent !== null && (
                <button
                    onClick={() => setOpen(true)}
                    aria-label="Gestionar cookies"
                    className="fixed bottom-6 right-6 z-50 text-2xl opacity-40 hover:opacity-100 transition-opacity"
                    title="Gestionar cookies"
                >
                    🍪
                </button>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <span className="text-3xl">🍪</span> Política de Cookies
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-relaxed mt-1">
                            Usamos cookies para garantizar el correcto funcionamiento de la aplicación y mejorar tu experiencia. De acuerdo con el <strong>Reglamento General de Protección de Datos (RGPD)</strong> de la UE, necesitamos tu consentimiento.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 my-2">
                        {/* Necessary */}
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                            <Lock className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-sm">Cookies necesarias</p>
                                    <Badge variant="secondary" className="text-xs">Siempre activas</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Sesión de usuario, autenticación con Google (OAuth), seguridad CSRF. Sin estas cookies la aplicación no puede funcionar.
                                </p>
                            </div>
                        </div>

                        {/* Functional */}
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                            <Shield className="h-5 w-5 mt-0.5 text-blue-500 shrink-0" />
                            <div className="flex-1">
                                <p className="font-semibold text-sm">Cookies funcionales</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Preferencias de tema (claro/oscuro) y caché de recetas generadas para evitar llamadas duplicadas a la IA.
                                </p>
                            </div>
                        </div>

                        {/* Analytics */}
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                            <BarChart2 className="h-5 w-5 mt-0.5 text-orange-500 shrink-0" />
                            <div className="flex-1">
                                <p className="font-semibold text-sm">Datos de uso</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Conteo de visitas por receta (almacenado localmente, sin rastreo externo). No se comparte con terceros.
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Puedes cambiar tu decisión en cualquier momento pulsando el icono 🍪 en la esquina inferior derecha.{' '}
                        <Link href="/cookies" className="underline hover:text-foreground" onClick={() => setOpen(false)}>
                            Más información
                        </Link>{' '}·{' '}
                        <Link href="/privacidad" className="underline hover:text-foreground" onClick={() => setOpen(false)}>
                            Privacidad
                        </Link>
                    </p>

                    <div className="flex gap-3 mt-1">
                        <Button variant="outline" className="flex-1 gap-2" onClick={reject}>
                            <X className="h-4 w-4" /> Solo necesarias
                        </Button>
                        <Button className="flex-1 gap-2" onClick={accept}>
                            <Check className="h-4 w-4" /> Aceptar todas
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
