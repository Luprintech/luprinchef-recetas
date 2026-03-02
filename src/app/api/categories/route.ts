import { NextRequest, NextResponse } from 'next/server';
import { generateRecipe } from '@/ai/flows/generate-recipe';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
        return NextResponse.json({ error: 'Por favor, introduce una categoría.' }, { status: 400 });
    }

    try {
        const recipes = await Promise.all([
            generateRecipe({ category: name }),
            generateRecipe({ category: name }),
        ]);
        return NextResponse.json({ recipes });
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ha ocurrido un error desconocido.';
        return NextResponse.json(
            { error: `No se pudieron generar las recetas para la categoría: ${errorMessage}` },
            { status: 500 }
        );
    }
}
