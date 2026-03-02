import { NextRequest, NextResponse } from 'next/server';
import { generateRecipe } from '@/ai/flows/generate-recipe';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';

// In-memory server cache: same query within 10 min → no new Gemini call
const serverCache = new Map<string, { data: GenerateRecipeOutput[]; expires: number }>();

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) {
        return NextResponse.json(
            { error: 'Por favor, introduce un término de búsqueda.' },
            { status: 400 }
        );
    }

    const cacheKey = `search:${q.toLowerCase().trim()}`;
    const cached = serverCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
        return NextResponse.json({ recipes: cached.data });
    }

    try {
        // Generate 2 recipes with different cuisines for variety
        const recipes = await Promise.all([
            generateRecipe({ ingredients: q }),
            generateRecipe({ ingredients: q, cuisine: 'any' }),
        ]);
        serverCache.set(cacheKey, { data: recipes, expires: Date.now() + 10 * 60 * 1000 });
        return NextResponse.json({ recipes });
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ha ocurrido un error desconocido.';
        return NextResponse.json(
            { error: `No se pudieron buscar las recetas: ${errorMessage}` },
            { status: 500 }
        );
    }
}
