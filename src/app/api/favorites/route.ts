import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { getFavorites, addFavorite } from '@/db/queries/favorites';
import { getFolders } from '@/db/queries/folders';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const favorites = getFavorites(session.user.id);
    const folders = getFolders(session.user.id);
    return NextResponse.json({ favorites, folders });
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { recipe, folderId } = body;

    if (!recipe?.recipeName) {
        return NextResponse.json({ error: 'Receta inválida.' }, { status: 400 });
    }

    const favorite = addFavorite(session.user.id, recipe, folderId ?? null);
    return NextResponse.json({ favorite });
}
