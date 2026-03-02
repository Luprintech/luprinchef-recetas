import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import { RecipeCard } from '@/components/recipe-card';
import { Button } from '@/components/ui/button';
import { Home, BookOpen } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

// Revalidate detail pages every hour (ISR)
export const revalidate = 3600;

export async function generateStaticParams() {
    const recipes = await prisma.recipe.findMany({
        select: { slug: true },
        orderBy: { views: 'desc' },
        take: 100,
    });
    return recipes.map(r => ({ slug: r.slug }));
}

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function RecipeDetailPage({ params }: Props) {
    const { slug } = await params;

    const recipe = await prisma.recipe.findUnique({ where: { slug } });
    if (!recipe) notFound();

    // Increment views in background — non-blocking
    prisma.recipe.update({
        where: { id: recipe.id },
        data: { views: { increment: 1 } },
    }).catch(() => { /* non-fatal */ });

    const recipeData = JSON.parse(recipe.recipeData) as GenerateRecipeOutput;

    return (
        <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
            <main className="w-full max-w-2xl">
                <header className="flex justify-between items-center w-full mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold font-headline line-clamp-1">
                        {recipeData.recipeName}
                    </h1>
                    <nav className="flex items-center gap-2 shrink-0 ml-4">
                        <ThemeToggle />
                        <Link href="/recipes" passHref>
                            <Button variant="ghost" size="sm">
                                <BookOpen className="mr-2 h-4 w-4" />
                                Catálogo
                            </Button>
                        </Link>
                        <Link href="/" passHref>
                            <Button variant="ghost" size="sm">
                                <Home className="mr-2 h-4 w-4" />
                                Inicio
                            </Button>
                        </Link>
                    </nav>
                </header>

                <RecipeCard recipe={recipeData} />
            </main>
        </div>
    );
}
