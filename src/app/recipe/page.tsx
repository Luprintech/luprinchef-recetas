
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RecipeCard } from '@/components/recipe-card';
import { RecipeSkeleton } from '@/components/recipe-skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home } from 'lucide-react';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import { ThemeToggle } from '@/components/theme-toggle';

// Build a stable cache key from recipe params
function buildCacheKey(ingredients: string, vegetarian: boolean, glutenFree: boolean, airFryer: boolean, cuisine: string) {
    return `luprinchef_recipe:${JSON.stringify({ ingredients: ingredients.trim().toLowerCase(), vegetarian, glutenFree, airFryer, cuisine })}`;
}

function RecipePageComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [recipe, setRecipe] = useState<GenerateRecipeOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const ingredients = searchParams.get('ingredients');

        if (!ingredients) {
            router.push('/');
            return;
        }

        const vegetarian = searchParams.get('vegetarian') === 'true';
        const glutenFree = searchParams.get('glutenFree') === 'true';
        const airFryer = searchParams.get('airFryer') === 'true';
        const cuisine = searchParams.get('cuisine') || '';

        const fetchRecipe = async () => {
            setIsLoading(true);
            setRecipe(null);
            setError(null);

            // Check sessionStorage cache first — avoids calling Gemini again for same params
            const cacheKey = buildCacheKey(ingredients, vegetarian, glutenFree, airFryer, cuisine);
            try {
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) {
                    setRecipe(JSON.parse(cached));
                    setIsLoading(false);
                    return;
                }
            } catch (_) { /* sessionStorage unavailable (SSR, private mode) */ }

            const res = await fetch('/api/recipe/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredients, vegetarian, glutenFree, airFryer, cuisine }),
            });
            const result = await res.json();
            if (result.error) {
                setError(result.error);
            } else {
                setRecipe(result.recipe);
                try {
                    sessionStorage.setItem(cacheKey, JSON.stringify(result.recipe));
                } catch (_) { /* quota exceeded or unavailable */ }
            }
            setIsLoading(false);
        };

        fetchRecipe();
    }, [searchParams, router]);

    const handleGenerateWithSuggestions = (recipeName: string, additionalIngredients: string[]) => {
        const ingredients = searchParams.get('ingredients');
        if (!ingredients) {
            router.push('/');
            return;
        }

        const originalIngredients = ingredients.split(',').map(i => i.trim()).filter(Boolean);
        const newIngredients = [...new Set([...originalIngredients, ...additionalIngredients])];

        const params = new URLSearchParams(searchParams.toString());
        params.set('ingredients', newIngredients.join(', '));

        router.push(`/recipe?${params.toString()}`);
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
            <main className="w-full max-w-2xl">
                <header className="flex justify-between items-center w-full mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold font-headline">
                        Tu Receta Personalizada
                    </h1>
                    <nav className="flex items-center gap-2">
                        <ThemeToggle />
                        <Link href="/" passHref>
                            <Button variant="ghost">
                                <Home className="mr-2" />
                                Inicio
                            </Button>
                        </Link>
                    </nav>
                </header>

                <div className="mt-8 w-full">
                    {isLoading && <RecipeSkeleton />}
                    {error && !isLoading && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-destructive flex items-center gap-2">
                                    <AlertTriangle />
                                    Error al generar la receta
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{error}</p>
                                <Link href="/" passHref>
                                    <Button variant="outline" className="mt-4">
                                        Volver al inicio
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                    {recipe && !isLoading && !error && (
                        <RecipeCard recipe={recipe} onGenerateWithSuggestions={handleGenerateWithSuggestions} />
                    )}
                </div>
            </main>
        </div>
    )
}

export default function RecipePage() {
    return (
        <Suspense fallback={<RecipeSkeleton />}>
            <RecipePageComponent />
        </Suspense>
    )
}
