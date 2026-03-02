import { NextRequest, NextResponse } from 'next/server';
import { suggestSearchTerms } from '@/ai/flows/suggest-search-terms';

// In-memory server cache for suggestions: same query within 1 hour → no Gemini call
const serverCache = new Map<string, { data: string[]; expires: number }>();

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.length < 3) {
        return NextResponse.json({ suggestions: [] });
    }

    const cacheKey = q.toLowerCase().trim();
    const cached = serverCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
        return NextResponse.json({ suggestions: cached.data });
    }

    try {
        const result = await suggestSearchTerms({ query: q });
        serverCache.set(cacheKey, { data: result.suggestions, expires: Date.now() + 60 * 60 * 1000 });
        return NextResponse.json({ suggestions: result.suggestions });
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ha ocurrido un error desconocido.';
        return NextResponse.json(
            { error: `No se pudieron obtener sugerencias: ${errorMessage}` },
            { status: 500 }
        );
    }
}
