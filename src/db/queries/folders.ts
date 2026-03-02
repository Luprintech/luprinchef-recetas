import db from '@/db/client';

export interface FolderRow {
    id: string;
    user_id: string;
    name: string;
    created_at: number;
}

export function getFolders(userId: string): FolderRow[] {
    return db.prepare(
        'SELECT * FROM folders WHERE user_id = ? ORDER BY created_at ASC'
    ).all(userId) as FolderRow[];
}

export function createFolder(userId: string, name: string): FolderRow {
    const id = crypto.randomUUID();
    db.prepare(
        'INSERT INTO folders (id, user_id, name) VALUES (?, ?, ?)'
    ).run(id, userId, name);
    return db.prepare('SELECT * FROM folders WHERE id = ?').get(id) as FolderRow;
}

export function deleteFolder(id: string): void {
    db.prepare('DELETE FROM folders WHERE id = ?').run(id);
}
