import { NextRequest, NextResponse } from 'next/server';
import { generateRecipe, type GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';

function buildDietFilter(vegetarian: boolean, glutenFree: boolean, airFryer: boolean) {
    const conditions: object[] = [];
    if (vegetarian) conditions.push({ diet: { contains: 'vegetarian' } });
    if (glutenFree) conditions.push({ diet: { contains: 'gluten-free' } });
    if (airFryer) conditions.push({ diet: { contains: 'air-fryer' } });
    return conditions;
}

async function saveRecipeToDB(
    recipe: GenerateRecipeOutput,
    opts: { vegetarian: boolean; glutenFree: boolean; airFryer: boolean; cuisine: string }
) {
    const slug = slugify(recipe.recipeName);
    const ingredients = recipe.ingredientsList
        .split('\n')
        .map(l => l.replace(/^-\s*/, '').trim().toLowerCase())
        .filter(Boolean)
        .join(',');
    const diet = [
        opts.vegetarian && 'vegetarian',
        opts.glutenFree && 'gluten-free',
        opts.airFryer && 'air-fryer',
    ]
        .filter(Boolean)
        .join(',');

    try {
        await prisma.recipe.upsert({
            where: { slug },
            update: { views: { increment: 1 } },
            create: {
                title: recipe.recipeName,
                slug,
                ingredients,
                instructions: recipe.instructions,
                image: recipe.imageUrl || null,
                cuisine: opts.cuisine || null,
                diet,
                createdByAI: true,
                recipeData: JSON.stringify(recipe),
            },
        });
    } catch (err) {
        // Non-fatal: log but don't block the response
        console.error('[DB] Failed to save recipe:', err);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { ingredients, vegetarian = false, glutenFree = false, airFryer = false, cuisine = '' } = body;

        if (!ingredients) {
            return NextResponse.json({ error: 'Se requieren ingredientes.' }, { status: 400 });
        }

        // Use only the first 3 key ingredients for a broad DB search
        const ingredientWords = (ingredients as string)
            .split(',')
            .map((i: string) => i.trim().toLowerCase())
            .filter(Boolean)
            .slice(0, 3);

        const dietFilter = buildDietFilter(vegetarian, glutenFree, airFryer);

        const andConditions: object[] = [
            ...ingredientWords.map(w => ({ ingredients: { contains: w } })),
            ...dietFilter,
        ];
        if (cuisine) andConditions.push({ cuisine });

        // DB-first: find the most-viewed compatible recipe
        const found = await prisma.recipe.findFirst({
            where: { AND: andConditions },
            orderBy: { views: 'desc' },
        });

        if (found) {
            // Cache hit — update views in background and return stored data
            prisma.recipe.update({
                where: { id: found.id },
                data: { views: { increment: 1 } },
            }).catch(() => { /* non-fatal */ });

            console.log(`[DB cache hit] "${found.title}" (views: ${found.views})`);
            return NextResponse.json({ recipe: JSON.parse(found.recipeData) });
        }

        // AI fallback — generate via Gemini
        const recipe = await generateRecipe({ ingredients, vegetarian, glutenFree, airFryer, cuisine });

        // Save to DB in background so we don't delay the response
        saveRecipeToDB(recipe, { vegetarian, glutenFree, airFryer, cuisine });

        return NextResponse.json({ recipe });
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ha ocurrido un error desconocido.';
        return NextResponse.json(
            { error: `No se pudo generar la receta: ${errorMessage}` },
            { status: 500 }
        );
    }
}
