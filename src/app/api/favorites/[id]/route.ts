import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { removeFavoriteById, moveFavoriteToFolder } from '@/db/queries/favorites';

export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    removeFavoriteById(params.id);
    return NextResponse.json({ success: true });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { folderId } = await request.json();
    const favorite = moveFavoriteToFolder(params.id, folderId ?? null);
    return NextResponse.json({ favorite });
}
