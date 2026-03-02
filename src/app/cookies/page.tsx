import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Política de Cookies — Cocina con Luprinchef' };

export default function CookiesPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <Link href="/">
                <Button variant="ghost" className="mb-6 -ml-2">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
            </Link>

            <h1 className="text-3xl font-bold mb-2">Política de Cookies</h1>
            <p className="text-sm text-muted-foreground mb-8">Última actualización: marzo de 2026</p>

            <div className="space-y-6 text-sm leading-relaxed">

                <section>
                    <h2 className="text-lg font-semibold mb-2">¿Qué son las cookies?</h2>
                    <p>
                        Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo cuando los visitas.
                        Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente y para proporcionar información a los propietarios del sitio.
                        Esta aplicación también utiliza <strong>localStorage</strong> del navegador para almacenar preferencias de manera local.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-3">Cookies que utilizamos</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-muted">
                                    <th className="border p-2 text-left">Nombre</th>
                                    <th className="border p-2 text-left">Tipo</th>
                                    <th className="border p-2 text-left">Duración</th>
                                    <th className="border p-2 text-left">Finalidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border p-2 font-mono">next-auth.session-token</td>
                                    <td className="border p-2">Necesaria</td>
                                    <td className="border p-2">Sesión</td>
                                    <td className="border p-2">Mantiene la sesión autenticada con Google OAuth</td>
                                </tr>
                                <tr>
                                    <td className="border p-2 font-mono">next-auth.csrf-token</td>
                                    <td className="border p-2">Necesaria</td>
                                    <td className="border p-2">Sesión</td>
                                    <td className="border p-2">Protección contra ataques CSRF</td>
                                </tr>
                                <tr>
                                    <td className="border p-2 font-mono">luprinchef_cookie_consent</td>
                                    <td className="border p-2">Necesaria</td>
                                    <td className="border p-2">Permanente</td>
                                    <td className="border p-2">Almacena tu elección sobre cookies (localStorage)</td>
                                </tr>
                                <tr>
                                    <td className="border p-2 font-mono">theme (next-themes)</td>
                                    <td className="border p-2">Funcional</td>
                                    <td className="border p-2">Permanente</td>
                                    <td className="border p-2">Recuerda tu preferencia de tema claro/oscuro</td>
                                </tr>
                                <tr>
                                    <td className="border p-2 font-mono">luprinchef_recipe:*</td>
                                    <td className="border p-2">Funcional</td>
                                    <td className="border p-2">Sesión</td>
                                    <td className="border p-2">Caché de recetas generadas (sessionStorage) para evitar llamadas duplicadas a la IA</td>
                                </tr>
                                <tr>
                                    <td className="border p-2 font-mono">luprinchef_search:*</td>
                                    <td className="border p-2">Funcional</td>
                                    <td className="border p-2">Sesión</td>
                                    <td className="border p-2">Caché de resultados de búsqueda (sessionStorage)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2">Cookies de terceros</h2>
                    <p>Al autenticarte con Google, Google puede establecer sus propias cookies de acuerdo con su política de privacidad. Consulta la <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="underline">política de cookies de Google</a> para más información.</p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2">Base legal</h2>
                    <p>
                        Las cookies necesarias se instalan en base al <strong>interés legítimo</strong> (Art. 6.1.f RGPD) para el funcionamiento seguro de la aplicación.
                        Las cookies funcionales requieren tu <strong>consentimiento</strong> (Art. 6.1.a RGPD), que puedes gestionar en cualquier momento pulsando el icono 🍪.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2">Cómo gestionar o eliminar cookies</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Desde la app:</strong> pulsa el icono 🍪 en la esquina inferior derecha para cambiar tu preferencia.</li>
                        <li><strong>Desde el navegador:</strong> puedes eliminar y bloquear cookies desde la configuración de tu navegador. Ten en cuenta que bloquear las cookies necesarias puede impedir el correcto funcionamiento de la aplicación.</li>
                    </ul>
                    <p className="mt-2 text-muted-foreground">
                        Instrucciones para navegadores populares:{' '}
                        <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="underline">Chrome</a>{' '}·{' '}
                        <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="underline">Firefox</a>{' '}·{' '}
                        <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="underline">Safari</a>
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2">Más información</h2>
                    <p>
                        Consulta nuestra <Link href="/privacidad" className="underline">Política de Privacidad</Link> para conocer en detalle cómo tratamos tus datos personales.
                    </p>
                </section>

            </div>
        </div>
    );
}
