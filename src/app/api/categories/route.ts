import { NextRequest, NextResponse } from 'next/server';
import { generateRecipe } from '@/ai/flows/generate-recipe';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';

// In-memory server cache: same category within 30 min → no new Gemini call
const serverCache = new Map<string, { data: GenerateRecipeOutput[]; expires: number }>();

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
        return NextResponse.json({ error: 'Por favor, introduce una categoría.' }, { status: 400 });
    }

    const cacheKey = `category:${name.toLowerCase().trim()}`;
    const cached = serverCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
        return NextResponse.json({ recipes: cached.data });
    }

    try {
        // Generate 2 recipes in the same category but from different cuisines
        const cuisines = ['Española', 'Italiana', 'Mexicana', 'Francesa', 'Japonesa', 'India'];
        const [c1, c2] = cuisines.sort(() => Math.random() - 0.5).slice(0, 2);

        const recipes = await Promise.all([
            generateRecipe({ category: name, cuisine: c1 }),
            generateRecipe({ category: name, cuisine: c2 }),
        ]);
        serverCache.set(cacheKey, { data: recipes, expires: Date.now() + 30 * 60 * 1000 });
        return NextResponse.json({ recipes });
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ha ocurrido un error desconocido.';
        return NextResponse.json(
            { error: `No se pudieron generar las recetas para la categoría: ${errorMessage}` },
            { status: 500 }
        );
    }
}
