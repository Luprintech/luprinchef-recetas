import { NextRequest, NextResponse } from 'next/server';
import { searchPhoto } from '@/services/pexels';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { imageHint } = body;

        if (!imageHint) {
            return NextResponse.json({ error: 'Se requiere imageHint.' }, { status: 400 });
        }

        const imageUrl = await searchPhoto(imageHint);
        return NextResponse.json({ imageUrl });
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ha ocurrido un error desconocido.';
        return NextResponse.json(
            { error: `No se pudo generar la imagen: ${errorMessage}` },
            { status: 500 }
        );
    }
}
