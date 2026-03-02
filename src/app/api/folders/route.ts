import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { getFolders, createFolder } from '@/db/queries/folders';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const folders = getFolders(session.user.id);
    return NextResponse.json({ folders });
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name?.trim()) {
        return NextResponse.json({ error: 'El nombre es requerido.' }, { status: 400 });
    }

    const folder = createFolder(session.user.id, name.trim());
    return NextResponse.json({ folder });
}
