import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Política de Privacidad — Cocina con Luprinchef' };

export default function PrivacidadPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <Link href="/">
                <Button variant="ghost" className="mb-6 -ml-2">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
            </Link>

            <h1 className="text-3xl font-bold mb-2">Política de Privacidad</h1>
            <p className="text-sm text-muted-foreground mb-8">Última actualización: marzo de 2026</p>

            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">

                <section>
                    <h2 className="text-lg font-semibold mb-2">1. Responsable del tratamiento</h2>
                    <p>
                        El responsable del tratamiento de los datos personales recogidos a través de esta aplicación es <strong>Cocina con Luprinchef</strong>.
                        Para cualquier consulta relacionada con la privacidad puedes contactar a través de los canales indicados en la aplicación.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2">2. Datos que recopilamos</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Datos de autenticación:</strong> cuando inicias sesión con Google OAuth, recibimos tu nombre, dirección de correo electrónico y foto de perfil pública proporcionados por Google.</li>
                        <li><strong>Datos de uso:</strong> recetas marcadas como favoritas, carpetas creadas y preferencias de configuración almacenadas en nuestra base de datos local.</li>
                        <li><strong>Datos técnicos:</strong> cookies de sesión necesarias para mantener la autenticación activa.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2">3. Finalidad del tratamiento</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Permitir el inicio de sesión y gestión de tu cuenta mediante Google OAuth 2.0.</li>
                        <li>Guardar y recuperar tus recetas favoritas y carpetas personales.</li>
                        <li>Mejorar la experiencia de usuario recordando preferencias (tema claro/oscuro).</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2">4. Base legal del tratamiento</h2>
                    <p>
                        El tratamiento se basa en tu <strong>consentimiento explícito</strong> (Art. 6.1.a RGPD) otorgado al iniciar sesión con Google y al aceptar las cookies funcionales,
                        así como en el <strong>interés legítimo</strong> (Art. 6.1.f RGPD) para garantizar la seguridad de la aplicación mediante cookies técnicas necesarias.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2">5. Terceros y transferencias internacionales</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Google LLC</strong>: proveedor de autenticación OAuth. Consulta la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">política de privacidad de Google</a>.</li>
                        <li><strong>Google Gemini API</strong>: las recetas se generan enviando los ingredientes introducidos. No se envían datos personales identificables.</li>
                        <li><strong>Pexels</strong>: se realizan búsquedas de imágenes usando palabras clave de la receta. No se envían datos personales.</li>
                    </ul>
                    <p className="mt-2">No vendemos ni cedemos tus datos personales a ningún tercero con fines comerciales.</p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2">6. Conservación de datos</h2>
                    <p>
                        Los datos de tu cuenta se conservan mientras mantengas una cuenta activa. Puedes solicitar la eliminación de tus datos en cualquier momento,
                        lo que conllevará la eliminación de tus favoritos y carpetas.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2">7. Tus derechos (RGPD)</h2>
                    <p>Conforme al Reglamento (UE) 2016/679, tienes derecho a:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Acceso:</strong> conocer qué datos tenemos sobre ti.</li>
                        <li><strong>Rectificación:</strong> corregir datos inexactos.</li>
                        <li><strong>Supresión ("derecho al olvido"):</strong> solicitar la eliminación de tus datos.</li>
                        <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado.</li>
                        <li><strong>Oposición y limitación:</strong> oponerte al tratamiento o solicitar su limitación.</li>
                        <li><strong>Retirada del consentimiento:</strong> puedes retirar tu consentimiento en cualquier momento sin que ello afecte a la licitud del tratamiento previo.</li>
                    </ul>
                    <p className="mt-2">También tienes derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong> en <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="underline">www.aepd.es</a>.</p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2">8. Seguridad</h2>
                    <p>
                        Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos contra el acceso no autorizado, pérdida o destrucción,
                        incluyendo cifrado de sesiones y almacenamiento local de datos con acceso restringido.
                    </p>
                </section>

            </div>
        </div>
    );
}
