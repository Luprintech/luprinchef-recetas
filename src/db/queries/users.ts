import db from '@/db/client';

interface UserRow {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
}

export function upsertUser(user: UserRow): void {
    db.prepare(`
        INSERT INTO users (id, email, name, image)
        VALUES (@id, @email, @name, @image)
        ON CONFLICT(id) DO UPDATE SET
            email = excluded.email,
            name  = excluded.name,
            image = excluded.image
    `).run(user);
}
