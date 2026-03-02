import { NextRequest, NextResponse } from 'next/server';
import { identifyIngredients } from '@/ai/flows/identify-ingredients-flow';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { imageDataUri } = body;

        if (!imageDataUri) {
            return NextResponse.json(
                { error: 'No se ha proporcionado ninguna imagen.' },
                { status: 400 }
            );
        }

        const result = await identifyIngredients({ imageDataUri });
        return NextResponse.json({ ingredients: result.ingredients });
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ha ocurrido un error desconocido.';
        return NextResponse.json(
            { error: `No se pudieron identificar los ingredientes: ${errorMessage}` },
            { status: 500 }
        );
    }
}
