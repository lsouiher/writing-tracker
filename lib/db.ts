import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'writing-tracker.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const globalForDb = globalThis as unknown as { db: Database.Database };

function createDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      current_phase INTEGER NOT NULL DEFAULT 0,
      current_week INTEGER NOT NULL DEFAULT 1,
      last_tab TEXT NOT NULL DEFAULT 'plan',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS week_logs (
      week_number INTEGER PRIMARY KEY,
      days TEXT NOT NULL DEFAULT '[]',
      notes TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS skill_ratings (
      skill_key TEXT PRIMARY KEY,
      rating INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    INSERT OR IGNORE INTO user_state (id) VALUES (1);

    INSERT OR IGNORE INTO skill_ratings (skill_key) VALUES
      ('sentence_variety'),
      ('paragraph_structure'),
      ('voice_tone'),
      ('storytelling'),
      ('business_writing'),
      ('editing_revision');
  `);

  return db;
}

let db: Database.Database;

try {
  if (process.env.NODE_ENV === 'production') {
    db = createDb();
  } else {
    if (!globalForDb.db) {
      globalForDb.db = createDb();
    }
    db = globalForDb.db;
  }
} catch (error) {
  console.error('Failed to initialize SQLite database:', error);
  throw error;
}

export { db };
