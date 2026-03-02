import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { deleteFolder } from '@/db/queries/folders';

export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    deleteFolder(params.id);
    return NextResponse.json({ success: true });
}
