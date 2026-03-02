'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Search as SearchIcon, BookOpen, ChevronLeft, ChevronRight, Sparkles, Globe } from 'lucide-react';
import { FavoriteRecipeCard } from '@/components/favorite-recipe-card';
import { RecipeSkeleton } from '@/components/recipe-skeleton';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';

// All cuisines present in the DB (sorted alphabetically)
const CUISINES = [
    'Americana', 'Árabe', 'Argentina', 'Brasileña', 'China', 'Colombiana',
    'Coreana', 'Egipcia', 'Española', 'Francesa', 'Griega', 'India',
    'Italiana', 'Japonesa', 'Libanesa', 'Marroquí', 'Mexicana', 'Peruana',
    'Tailandesa', 'Turca', 'Venezolana', 'Vietnamita',
];

type RecipeType = 'all' | 'ai' | 'traditional';

interface RecipeRow {
    id: string;
    title: string;
    slug: string;
    image: string | null;
    cuisine: string | null;
    diet: string;
    createdByAI: boolean;
    views: number;
    recipeData: string;
}

interface ParsedRecipe {
    data: GenerateRecipeOutput;
    createdByAI: boolean;
}

interface TabCounts { all: number; traditional: number; ai: number }

function RecipesPageComponent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<RecipeType>(
        (searchParams.get('type') as RecipeType) || 'all'
    );
    const [recipes, setRecipes] = useState<ParsedRecipe[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [tabCounts, setTabCounts] = useState<TabCounts>({ all: 0, traditional: 0, ai: 0 });

    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [pendingSearch, setPendingSearch] = useState(searchParams.get('q') || '');
    const [cuisine, setCuisine] = useState(searchParams.get('cuisine') || '');
    const [vegetarian, setVegetarian] = useState(searchParams.get('vegetarian') === 'true');
    const [glutenFree, setGlutenFree] = useState(searchParams.get('glutenFree') === 'true');
    const [airFryer, setAirFryer] = useState(searchParams.get('airFryer') === 'true');
    const [orderBy, setOrderBy] = useState(searchParams.get('orderBy') || 'date');
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
    const limit = 12;

    // Fetch tab counts once on mount
    useEffect(() => {
        Promise.all([
            fetch('/api/recipes?limit=1').then(r => r.json()),
            fetch('/api/recipes?limit=1&type=traditional').then(r => r.json()),
            fetch('/api/recipes?limit=1&type=ai').then(r => r.json()),
        ]).then(([all, trad, ai]) => {
            setTabCounts({ all: all.total || 0, traditional: trad.total || 0, ai: ai.total || 0 });
        }).catch(() => {});
    }, []);

    const fetchRecipes = useCallback(async () => {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.set('type', activeTab);
        if (searchTerm) params.set('q', searchTerm);
        if (cuisine) params.set('cuisine', cuisine);
        if (vegetarian) params.set('vegetarian', 'true');
        if (glutenFree) params.set('glutenFree', 'true');
        if (airFryer) params.set('airFryer', 'true');
        params.set('orderBy', orderBy);
        params.set('page', String(page));
        params.set('limit', String(limit));

        const res = await fetch(`/api/recipes?${params.toString()}`);
        const data = await res.json();
        if (data.recipes) {
            setRecipes(
                data.recipes.map((r: RecipeRow) => ({
                    data: JSON.parse(r.recipeData) as GenerateRecipeOutput,
                    createdByAI: r.createdByAI,
                }))
            );
            setTotal(data.total || 0);
        }
        setIsLoading(false);
    }, [activeTab, searchTerm, cuisine, vegetarian, glutenFree, airFryer, orderBy, page]);

    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    const handleTabChange = (value: string) => {
        setActiveTab(value as RecipeType);
        setPage(1);
    };

    // Filters auto-apply; search text only applies on submit
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSearchTerm(pendingSearch);
        setPage(1);
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
            <main className="w-full max-w-6xl">
                {/* Header */}
                <header className="flex justify-between items-center w-full mb-8">
                    <div className="flex items-center gap-3">
                        <BookOpen className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl md:text-4xl font-bold font-headline">
                            Catálogo de Recetas
                        </h1>
                    </div>
                    <nav className="flex items-center gap-2">
                        <ThemeToggle />
                        <Link href="/" passHref>
                            <Button variant="ghost">
                                <Home className="mr-2 h-4 w-4" />
                                Inicio
                            </Button>
                        </Link>
                    </nav>
                </header>

                {/* Tabs with counts */}
                <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-5">
                    <TabsList>
                        <TabsTrigger value="all" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            Todas
                            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">{tabCounts.all}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="traditional" className="gap-2">
                            <Globe className="h-4 w-4" />
                            Tradicionales
                            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">{tabCounts.traditional}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="ai" className="gap-2">
                            <Sparkles className="h-4 w-4" />
                            IA
                            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">{tabCounts.ai}</Badge>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-5">
                    {activeTab === 'traditional' && 'Recetas curadas en español de múltiples cocinas del mundo.'}
                    {activeTab === 'ai' && 'Recetas generadas por IA a partir de ingredientes. Se guardan automáticamente.'}
                    {activeTab === 'all' && 'Todas las recetas disponibles: curadas e IA.'}
                </p>

                {/* Filters — changes apply automatically except el texto del buscador */}
                <form onSubmit={handleSearch} className="mb-6 space-y-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Buscar por nombre o ingrediente..."
                            value={pendingSearch}
                            onChange={(e) => setPendingSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Cuisine */}
                        <Select value={cuisine || '_all'} onValueChange={(v) => { setCuisine(v === '_all' ? '' : v); setPage(1); }}>
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Cualquier cocina" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="_all">Cualquier cocina</SelectItem>
                                {CUISINES.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Order */}
                        <Select value={orderBy} onValueChange={(v) => { setOrderBy(v); setPage(1); }}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date">Más recientes</SelectItem>
                                <SelectItem value="popularity">Más populares</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Diet checkboxes */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                <Checkbox checked={vegetarian} onCheckedChange={(v) => { setVegetarian(!!v); setPage(1); }} />
                                Vegetariana
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                <Checkbox checked={glutenFree} onCheckedChange={(v) => { setGlutenFree(!!v); setPage(1); }} />
                                Sin gluten
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                <Checkbox checked={airFryer} onCheckedChange={(v) => { setAirFryer(!!v); setPage(1); }} />
                                Air Fryer
                            </label>
                        </div>

                        <Button type="submit">Buscar</Button>

                        {/* Active filters indicator */}
                        {(cuisine || vegetarian || glutenFree || airFryer || searchTerm) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground text-xs"
                                onClick={() => {
                                    setCuisine('');
                                    setVegetarian(false);
                                    setGlutenFree(false);
                                    setAirFryer(false);
                                    setSearchTerm('');
                                    setPendingSearch('');
                                    setPage(1);
                                }}
                            >
                                × Limpiar filtros
                            </Button>
                        )}
                    </div>
                </form>

                {/* Results count */}
                {!isLoading && (
                    <p className="text-sm text-muted-foreground mb-4">
                        {total === 0
                            ? 'Sin resultados para los filtros aplicados'
                            : `${total} receta${total !== 1 ? 's' : ''} encontrada${total !== 1 ? 's' : ''}`}
                    </p>
                )}

                {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => <RecipeSkeleton key={i} />)}
                    </div>
                ) : recipes.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {recipes.map((r, i) => (
                            <div key={`${r.data.recipeName}-${i}`} className="relative">
                                <div className="absolute top-2 left-2 z-10 pointer-events-none">
                                    {r.createdByAI ? (
                                        <Badge variant="secondary" className="text-xs gap-1 shadow">
                                            <Sparkles className="h-3 w-3" /> IA
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-xs gap-1 bg-background/80 shadow backdrop-blur-sm">
                                            <Globe className="h-3 w-3" /> Tradicional
                                        </Badge>
                                    )}
                                </div>
                                <FavoriteRecipeCard 
                                    recipe={r.data} 
                                    onGenerateWithSuggestions={(recipeName, ingredients) => {
                                        const params = new URLSearchParams();
                                        const combined = [recipeName, ...ingredients].join(', ');
                                        params.set('ingredients', combined);
                                        router.push(`/recipe?${params.toString()}`);
                                    }} 
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg mt-16">
                        {activeTab === 'ai' ? (
                            <>
                                <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                <h2 className="text-xl font-semibold text-foreground">Sin recetas de IA aún</h2>
                                <p className="mt-2">Genera una receta y se guardará automáticamente aquí.</p>
                                <Button onClick={() => router.push('/')} className="mt-4">Generar una receta</Button>
                            </>
                        ) : (
                            <>
                                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                <h2 className="text-xl font-semibold text-foreground">Sin resultados</h2>
                                <p className="mt-2">Prueba con otros filtros o limpia la búsqueda.</p>
                                <Button variant="outline" className="mt-4" onClick={() => {
                                    setCuisine(''); setVegetarian(false); setGlutenFree(false);
                                    setAirFryer(false); setSearchTerm(''); setPendingSearch(''); setPage(1);
                                }}>Limpiar filtros</Button>
                            </>
                        )}
                    </Card>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
                        <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function RecipesPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
                <div className="w-full max-w-6xl">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-24">
                        {Array.from({ length: 8 }).map((_, i) => <RecipeSkeleton key={i} />)}
                    </div>
                </div>
            </div>
        }>
            <RecipesPageComponent />
        </Suspense>
    );
}
