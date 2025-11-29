import { pool } from '../db/pool';
import { User, UserProfile, UserRole } from '../models/user';

export async function findUserByEmail(email: string): Promise<User | null> {
  const res = await pool.query(
    `SELECT id, email, password_hash, role, created_at, updated_at FROM users WHERE email = $1`,
    [email]
  );
  if (res.rowCount === 0) return null;
  const row = res.rows[0];
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role as UserRole,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function findUserById(id: string): Promise<User | null> {
  const res = await pool.query(
    `SELECT id, email, password_hash, role, created_at, updated_at FROM users WHERE id = $1`,
    [id]
  );
  if (res.rowCount === 0) return null;
  const row = res.rows[0];
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role as UserRole,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createUser(
  email: string,
  passwordHash: string,
  role: UserRole = 'USER'
): Promise<User> {
  const res = await pool.query(
    `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, password_hash, role, created_at, updated_at
    `,
    [email, passwordHash, role]
  );
  const row = res.rows[0];
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role as UserRole,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function upsertProfile(
  userId: string,
  name: string | null,
  phone: string | null,
  preferences: Record<string, unknown> | null
): Promise<UserProfile> {
  const res = await pool.query(
    `
      INSERT INTO profiles (user_id, name, phone, preferences)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) DO UPDATE
        SET name = EXCLUDED.name,
            phone = EXCLUDED.phone,
            preferences = EXCLUDED.preferences,
            updated_at = NOW()
      RETURNING user_id, name, phone, preferences, created_at, updated_at
    `,
    [userId, name, phone, preferences]
  );
  const row = res.rows[0];
  return {
    userId: row.user_id,
    name: row.name,
    phone: row.phone,
    preferences: row.preferences,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const res = await pool.query(
    `
      SELECT user_id, name, phone, preferences, created_at, updated_at
      FROM profiles
      WHERE user_id = $1
    `,
    [userId]
  );
  if (res.rowCount === 0) return null;
  const row = res.rows[0];
  return {
    userId: row.user_id,
    name: row.name,
    phone: row.phone,
    preferences: row.preferences,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}


