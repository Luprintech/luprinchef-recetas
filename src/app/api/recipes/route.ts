import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const cuisine = searchParams.get('cuisine') || '';
    const vegetarian = searchParams.get('vegetarian') === 'true';
    const glutenFree = searchParams.get('glutenFree') === 'true';
    const airFryer = searchParams.get('airFryer') === 'true';
    const orderBy = searchParams.get('orderBy') === 'popularity' ? 'views' : 'createdAt';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(48, parseInt(searchParams.get('limit') || '12', 10));
    const skip = (page - 1) * limit;

    // type: 'ai' | 'traditional' | 'all' (default)
    const type = searchParams.get('type') || 'all';

    const andConditions: object[] = [];

    if (type === 'ai') andConditions.push({ createdByAI: true });
    if (type === 'traditional') andConditions.push({ createdByAI: false });

    if (q) {
        andConditions.push({
            OR: [
                { title: { contains: q } },
                { ingredients: { contains: q.toLowerCase() } },
            ],
        });
    }
    if (cuisine) andConditions.push({ cuisine: { contains: cuisine } });
    if (vegetarian) andConditions.push({ diet: { contains: 'vegetarian' } });
    if (glutenFree) andConditions.push({ diet: { contains: 'gluten-free' } });
    if (airFryer) andConditions.push({ diet: { contains: 'air-fryer' } });

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const [recipes, total] = await Promise.all([
        prisma.recipe.findMany({
            where,
            orderBy: { [orderBy]: 'desc' },
            skip,
            take: limit,
            select: {
                id: true,
                title: true,
                slug: true,
                image: true,
                cuisine: true,
                diet: true,
                createdByAI: true,
                createdAt: true,
                views: true,
                recipeData: true,
            },
        }),
        prisma.recipe.count({ where }),
    ]);

    return NextResponse.json({ recipes, total, page, limit });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, recipeData, ingredients, instructions, image, cuisine, diet, createdByAI } = body;

        if (!title || !recipeData) {
            return NextResponse.json({ error: 'Se requieren title y recipeData.' }, { status: 400 });
        }

        const slug = slugify(title);

        const recipe = await prisma.recipe.upsert({
            where: { slug },
            update: { views: { increment: 1 } },
            create: {
                title,
                slug,
                ingredients: ingredients || '',
                instructions: instructions || '',
                image: image || null,
                cuisine: cuisine || null,
                diet: diet || '',
                createdByAI: createdByAI ?? true,
                recipeData,
            },
        });

        return NextResponse.json({ recipe });
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ha ocurrido un error desconocido.';
        return NextResponse.json(
            { error: `No se pudo guardar la receta: ${errorMessage}` },
            { status: 500 }
        );
    }
}
