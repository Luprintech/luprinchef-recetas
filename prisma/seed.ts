/**
 * Seed script: imports Spanish/international recipes from local JSON dataset.
 * Uses the Pexels API to fetch real food photos for each recipe.
 *
 * Usage:
 *   npm run seed                — import missing recipes (safe to re-run)
 *   CLEAN=true npm run seed     — delete all traditional recipes first, then re-import
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'pexels';
import recipesData from './recipes-es.json';

const prisma = new PrismaClient();

interface RecipeEntry {
    recipeName: string;
    ingredientsList: string;
    instructions: string;
    estimatedCookingTime: string;
    additionalSuggestedIngredients: string;
    nutritionalInformation: string;
    imageHint: string;
    cuisine: string;
    diet: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

async function getPexelsImage(hint: string): Promise<string> {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
        console.warn('    ⚠  PEXELS_API_KEY no configurada, usando placeholder');
        return 'https://placehold.co/600x400.png';
    }

    try {
        const client = createClient(apiKey);
        const result = await client.photos.search({ query: hint, per_page: 5, page: 1 });
        if ('photos' in result && result.photos.length > 0) {
            const idx = Math.floor(Math.random() * result.photos.length);
            return result.photos[idx].src.large;
        }
    } catch (err) {
        console.warn(`    ⚠  Pexels error para "${hint}":`, err);
    }
    return 'https://placehold.co/600x400.png';
}

function buildIngredientsCSV(ingredientsList: string): string {
    return ingredientsList
        .split('\n')
        .map(l => l.replace(/^-\s*/, '').trim().toLowerCase())
        .filter(Boolean)
        .join(',');
}

function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    const clean = process.env.CLEAN === 'true';

    if (clean) {
        const deleted = await prisma.recipe.deleteMany({ where: { createdByAI: false } });
        console.log(`🗑  Eliminadas ${deleted.count} recetas tradicionales existentes.\n`);
    }

    const recipes = recipesData as RecipeEntry[];
    console.log(`🌱 Importando ${recipes.length} recetas en español con imágenes de Pexels…\n`);

    let seeded = 0;
    let skipped = 0;

    for (const recipe of recipes) {
        const slug = slugify(recipe.recipeName);

        const exists = await prisma.recipe.findUnique({ where: { slug } });
        if (exists) {
            console.log(`↩  ${recipe.recipeName}`);
            skipped++;
            continue;
        }

        // Fetch image from Pexels
        const imageUrl = await getPexelsImage(recipe.imageHint);
        await sleep(400); // Respect Pexels rate limits

        const ingredientsCSV = buildIngredientsCSV(recipe.ingredientsList);

        const recipeData = JSON.stringify({
            recipeName: recipe.recipeName,
            ingredientsList: recipe.ingredientsList,
            instructions: recipe.instructions,
            estimatedCookingTime: recipe.estimatedCookingTime,
            additionalSuggestedIngredients: recipe.additionalSuggestedIngredients,
            nutritionalInformation: recipe.nutritionalInformation,
            imageHint: recipe.imageHint,
            imageUrl,
        });

        await prisma.recipe.create({
            data: {
                title: recipe.recipeName,
                slug,
                ingredients: ingredientsCSV,
                instructions: recipe.instructions,
                image: imageUrl,
                cuisine: recipe.cuisine || null,
                diet: recipe.diet || '',
                createdByAI: false,
                recipeData,
            },
        });

        console.log(`✓  ${recipe.recipeName} [${recipe.cuisine}]`);
        seeded++;
    }

    console.log(`\n✅  Seed completado: ${seeded} recetas importadas, ${skipped} omitidas.`);
    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
