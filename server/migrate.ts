import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPgMigration(sql: string, migrationName: string) {
  if (!process.env.DATABASE_URL) {
    return;
  }

  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

  try {
    await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations (id SERIAL PRIMARY KEY, migration_name TEXT UNIQUE NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW());');
    await pool.query('BEGIN');
    await pool.query(sql);
    await pool.query('INSERT INTO schema_migrations (migration_name) VALUES ($1) ON CONFLICT (migration_name) DO NOTHING;', [migrationName]);
    await pool.query('COMMIT');
    console.log(`[pg] Applied migration ${migrationName}`);
  } catch (error) {
    await pool.query('ROLLBACK').catch(() => undefined);
    console.warn(`[migrate] PostgreSQL unavailable; using file-based migration tracking only. ${String(error)}`);
  } finally {
    await pool.end();
  }
}

async function main() {
  const migrationDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationDir).filter((file) => file.endsWith('.sql')).sort();
  db.normalizeUserRoles();

  for (const file of files) {
    const fileKey = file.replace(/\.sql$/, '');
    if (db.get().schemaMigrations.includes(fileKey)) continue;

    const sql = fs.readFileSync(path.join(migrationDir, file), 'utf-8');
    await runPgMigration(sql, fileKey);
    if (!db.get().schemaMigrations.includes(fileKey)) {
      db.get().schemaMigrations.push(fileKey);
      db.save();
    }
    console.log(`Applied migration ${fileKey}`);
  }

  if (files.length === 0) {
    console.log('No SQL migrations found in server/migrations.');
  }

  console.log(`Migration state: ${db.get().schemaMigrations.join(', ') || 'none'}`);
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
