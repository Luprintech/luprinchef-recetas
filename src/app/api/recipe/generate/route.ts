import { NextRequest, NextResponse } from 'next/server';
import { generateRecipe } from '@/ai/flows/generate-recipe';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { ingredients, vegetarian, glutenFree, airFryer, cuisine } = body;

        if (!ingredients) {
            return NextResponse.json({ error: 'Se requieren ingredientes.' }, { status: 400 });
        }

        const recipe = await generateRecipe({ ingredients, vegetarian, glutenFree, airFryer, cuisine });
        return NextResponse.json({ recipe });
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ha ocurrido un error desconocido.';
        return NextResponse.json(
            { error: `No se pudo generar la receta: ${errorMessage}` },
            { status: 500 }
        );
    }
}
