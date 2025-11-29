import { StatusCodes } from 'http-status-codes';
import { createUser, findUserByEmail, getProfile, upsertProfile } from '../repositories/userRepository';
import { hashPassword, comparePassword } from '../utils/password';
import { signJwt } from '../utils/jwt';
import { User, UserProfile } from '../models/user';

export class AuthError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface LoginResult {
  token: string;
  user: Pick<User, 'id' | 'email' | 'role'>;
}

export async function registerUser(input: RegisterInput): Promise<LoginResult> {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) {
    throw new AuthError('Email and password are required', StatusCodes.BAD_REQUEST);
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AuthError('Email already in use', StatusCodes.CONFLICT);
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser(email, passwordHash, 'USER');

  await upsertProfile(user.id, input.name ?? null, input.phone ?? null, null);

  const token = signJwt({
    sub: user.id,
    email: user.email,
    role: user.role
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  };
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    throw new AuthError('Invalid credentials', StatusCodes.UNAUTHORIZED);
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new AuthError('Invalid credentials', StatusCodes.UNAUTHORIZED);
  }

  const token = signJwt({
    sub: user.id,
    email: user.email,
    role: user.role
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  return getProfile(userId);
}

export async function updateUserProfile(
  userId: string,
  updates: { name?: string | null; phone?: string | null; preferences?: Record<string, unknown> | null }
): Promise<UserProfile> {
  const existing = await getProfile(userId);
  const merged = {
    name: updates.name !== undefined ? updates.name : existing?.name ?? null,
    phone: updates.phone !== undefined ? updates.phone : existing?.phone ?? null,
    preferences: updates.preferences !== undefined ? updates.preferences : existing?.preferences ?? null
  };

  return upsertProfile(userId, merged.name, merged.phone, merged.preferences);
}


