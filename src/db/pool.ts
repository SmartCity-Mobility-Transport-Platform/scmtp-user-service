import { Pool } from 'pg';
import { env } from '../config/env';

export const pool = new Pool({
  host: env.pgHost,
  port: env.pgPort,
  user: env.pgUser,
  password: env.pgPassword,
  database: env.pgDatabase
});

export async function runMigrations(): Promise<void> {
  // Minimal inline migrations for demo; in real-world use a migration tool
  const client = await pool.connect();
  try {
    // Enable pgcrypto extension if not exists
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'USER',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        name TEXT,
        phone TEXT,
        preferences JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
  } catch (err: any) {
    await client.query('ROLLBACK').catch(() => {});
    // If tables already exist, that's okay - just log and continue
    if (err?.code === '42P07' || err?.message?.includes('already exists')) {
      console.log('Tables already exist, skipping migration');
    } else {
      throw err;
    }
  } finally {
    client.release();
  }
}


