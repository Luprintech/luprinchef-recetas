import db from '@/db/client';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';

export interface FavoriteRow {
    id: string;
    user_id: string;
    folder_id: string | null;
    recipe_name: string;
    recipe_data: string; // JSON string
    created_at: number;
}

export function getFavorites(userId: string): FavoriteRow[] {
    return db.prepare(
        'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at ASC'
    ).all(userId) as FavoriteRow[];
}

export function addFavorite(
    userId: string,
    recipe: GenerateRecipeOutput,
    folderId?: string | null
): FavoriteRow {
    const id = crypto.randomUUID();
    db.prepare(`
        INSERT INTO favorites (id, user_id, folder_id, recipe_name, recipe_data)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(user_id, recipe_name) DO UPDATE SET
            recipe_data = excluded.recipe_data,
            folder_id   = excluded.folder_id
    `).run(id, userId, folderId ?? null, recipe.recipeName, JSON.stringify(recipe));
    return db.prepare('SELECT * FROM favorites WHERE user_id = ? AND recipe_name = ?')
        .get(userId, recipe.recipeName) as FavoriteRow;
}

export function removeFavoriteById(id: string): void {
    db.prepare('DELETE FROM favorites WHERE id = ?').run(id);
}

export function moveFavoriteToFolder(id: string, folderId: string | null): FavoriteRow {
    db.prepare('UPDATE favorites SET folder_id = ? WHERE id = ?').run(folderId, id);
    return db.prepare('SELECT * FROM favorites WHERE id = ?').get(id) as FavoriteRow;
}

export function updateFavoriteImage(userId: string, recipeName: string, imageUrl: string): void {
    const row = db.prepare(
        'SELECT id, recipe_data FROM favorites WHERE user_id = ? AND recipe_name = ?'
    ).get(userId, recipeName) as FavoriteRow | undefined;

    if (!row) return;
    const data = JSON.parse(row.recipe_data);
    data.imageUrl = imageUrl;
    db.prepare('UPDATE favorites SET recipe_data = ? WHERE id = ?')
        .run(JSON.stringify(data), row.id);
}
