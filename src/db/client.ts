import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'luprinchef.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         TEXT PRIMARY KEY,
    email      TEXT NOT NULL UNIQUE,
    name       TEXT,
    image      TEXT,
    created_at INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS folders (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    UNIQUE(user_id, name)
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    folder_id   TEXT REFERENCES folders(id) ON DELETE SET NULL,
    recipe_name TEXT NOT NULL,
    recipe_data TEXT NOT NULL,
    created_at  INTEGER DEFAULT (unixepoch()),
    UNIQUE(user_id, recipe_name)
  );

  CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
  CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
`);

export default db;
