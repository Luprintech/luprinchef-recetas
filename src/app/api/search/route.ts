import { NextRequest, NextResponse } from 'next/server';
import { generateRecipe } from '@/ai/flows/generate-recipe';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) {
        return NextResponse.json(
            { error: 'Por favor, introduce un término de búsqueda.' },
            { status: 400 }
        );
    }

    try {
        const recipes = await Promise.all([
            generateRecipe({ ingredients: q }),
            generateRecipe({ ingredients: q }),
        ]);
        return NextResponse.json({ recipes });
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ha ocurrido un error desconocido.';
        return NextResponse.json(
            { error: `No se pudieron buscar las recetas: ${errorMessage}` },
            { status: 500 }
        );
    }
}
