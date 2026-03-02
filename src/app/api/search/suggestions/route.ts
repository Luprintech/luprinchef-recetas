import { NextRequest, NextResponse } from 'next/server';
import { suggestSearchTerms } from '@/ai/flows/suggest-search-terms';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
        return NextResponse.json({ suggestions: [] });
    }

    try {
        const result = await suggestSearchTerms({ query: q });
        return NextResponse.json({ suggestions: result.suggestions });
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ha ocurrido un error desconocido.';
        return NextResponse.json(
            { error: `No se pudieron obtener sugerencias: ${errorMessage}` },
            { status: 500 }
        );
    }
}
